import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getContractById } from "@/lib/services/contract-service";
import { prisma } from "@/lib/db";
import { updateContractSchema } from "@/lib/validations/contract";
import { toApiStatus } from "@/lib/api-mappers";
import { fromApiStatus } from "@/lib/api-mappers";
import { addActivityEvent } from "@/lib/services/contract-service";
import { generateInsightsFromTerms } from "@/lib/services/insights-service";

const TYPE_MAP: Record<string, "MSA" | "SOW" | "SLA" | "NDA" | "License" | "Amendment"> = {
  MSA: "MSA", SOW: "SOW", SLA: "SLA", NDA: "NDA", License: "License", Amendment: "Amendment",
};
const RISK_MAP: Record<string, "low" | "medium" | "high" | "critical"> = {
  low: "low", medium: "medium", high: "high", critical: "critical",
};

function mapContractToApi(c: Awaited<ReturnType<typeof getContractById>>) {
  if (!c) return null;
  const version = c.latestDocument?.latestVersion;
  const extractedData = version?.extractedData as Record<string, unknown> | null | undefined;
  const terms = version && extractedData ? buildTermsFromVersion(c, version, extractedData) : null;
  const insights = generateInsightsFromTerms(c.riskScore, terms ?? {});

  return {
    id: c.id,
    supplierId: c.supplierId,
    supplierName: c.supplierName,
    contractName: c.contractName,
    contractType: c.contractType,
    effectiveDate: c.effectiveDate.toISOString().slice(0, 10),
    expiryDate: c.expiryDate.toISOString().slice(0, 10),
    status: toApiStatus(c.status),
    riskScore: c.riskScore,
    riskLevel: c.riskLevel,
    value: c.value,
    tags: c.tags,
    uploadedAt: c.uploadedAt.toISOString(),
    lastAnalyzedAt: c.lastAnalyzedAt?.toISOString() ?? null,
    documentId: c.latestDocument?.id ?? null,
    latestVersionId: version?.id ?? null,
    terms,
    insights,
    clauses: version?.clauses.map((cl) => ({
      id: cl.id,
      name: cl.name,
      category: cl.category,
      extractedText: cl.extractedText,
      interpretation: cl.interpretation ?? "",
      riskNotes: cl.riskNotes ?? "",
      pageRef: cl.pageRef ?? "",
    })) ?? [],
    obligations: version?.obligations.map((ob) => ({
      id: ob.id,
      obligation: ob.obligation,
      owner: ob.owner,
      dueDate: ob.dueDate?.toISOString().slice(0, 10) ?? "",
      status: ob.status,
      evidenceLink: ob.evidenceLink ?? undefined,
    })) ?? [],
  };
}

function buildTermsFromVersion(
  c: NonNullable<Awaited<ReturnType<typeof getContractById>>>,
  version: { extractedData: unknown; clauses: unknown[]; obligations: unknown[] },
  data: Record<string, unknown>
) {
  const obligations = (version.obligations as Array<{ id: string; obligation: string; owner: string; dueDate: Date | null; status: string; evidenceLink: string | null }>).map((o) => ({
    id: o.id,
    obligation: o.obligation,
    owner: o.owner as "Supplier" | "Client" | "Both",
    dueDate: o.dueDate?.toISOString().slice(0, 10) ?? "",
    status: o.status as "pending" | "completed" | "overdue" | "at-risk",
    evidenceLink: o.evidenceLink ?? undefined,
  }));
  return {
    supplierName: c.supplierName,
    contractType: c.contractType,
    contractName: c.contractName,
    effectiveDate: c.effectiveDate.toISOString().slice(0, 10),
    endDate: c.expiryDate.toISOString().slice(0, 10),
    renewalTerms: (data.renewalTerms as string) ?? "See contract",
    paymentTerms: (data.paymentTerms as string) ?? "See contract",
    invoiceCadence: (data.invoiceCadence as string) ?? "See contract",
    terminationNoticeDays: (data.terminationNoticeDays as number) ?? 30,
    deliverables: (data.deliverables as string[]) ?? [],
    milestones: (data.milestones as Array<{ name: string; dueDate: string; status: string }>) ?? [],
    serviceLevels: (data.serviceLevels as Array<{ metric: string; target: string; penalty: string }>) ?? [],
    obligations,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const mapped = mapContractToApi(contract);
  return NextResponse.json(mapped);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateContractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) data.status = fromApiStatus(parsed.data.status);
  if (parsed.data.riskScore !== undefined) data.riskScore = parsed.data.riskScore;
  if (parsed.data.riskLevel !== undefined) data.riskLevel = RISK_MAP[parsed.data.riskLevel];
  if (parsed.data.value !== undefined) data.value = parsed.data.value;
  if (parsed.data.tags !== undefined) data.tags = parsed.data.tags;
  if (parsed.data.contractName !== undefined) data.contractName = parsed.data.contractName;
  if (parsed.data.effectiveDate !== undefined) data.effectiveDate = new Date(parsed.data.effectiveDate);
  if (parsed.data.expiryDate !== undefined) data.expiryDate = new Date(parsed.data.expiryDate);

  const contract = await prisma.contract.update({
    where: { id },
    data,
  });

  if (parsed.data.status) {
    await addActivityEvent(id, "status_change", `Status updated to ${parsed.data.status}`, session.user.id);
  }
  if (parsed.data.riskScore !== undefined || parsed.data.riskLevel) {
    await addActivityEvent(id, "risk_updated", `Risk updated`, session.user.id);
  }

  const full = await getContractById(id);
  return NextResponse.json(mapContractToApi(full));
}
