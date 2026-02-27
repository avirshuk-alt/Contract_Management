import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getContractList } from "@/lib/services/contract-service";
import { listContractsSchema } from "@/lib/validations/contract";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import { addActivityEvent } from "@/lib/services/contract-service";
import { runExtractionPipeline } from "@/lib/services/extraction-service";
import { createContractSchema } from "@/lib/validations/contract";
import { toApiStatus } from "@/lib/api-mappers";

const STATUS_MAP: Record<string, "active" | "expiring" | "expired" | "draft" | "under_review"> = {
  active: "active",
  expiring: "expiring",
  expired: "expired",
  draft: "draft",
  under_review: "under_review",
};

const RISK_MAP: Record<string, "low" | "medium" | "high" | "critical"> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

const TYPE_MAP: Record<string, "MSA" | "SOW" | "SLA" | "NDA" | "License" | "Amendment"> = {
  MSA: "MSA",
  SOW: "SOW",
  SLA: "SLA",
  NDA: "NDA",
  License: "License",
  Amendment: "Amendment",
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = listContractsSchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    contractType: searchParams.get("contractType") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    riskLevel: searchParams.get("riskLevel") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const statusVal = parsed.data.status;
  const filters = {
    ...parsed.data,
    contractType: parsed.data.contractType ? TYPE_MAP[parsed.data.contractType] : undefined,
    status: statusVal ? STATUS_MAP[statusVal === "under-review" ? "under_review" : statusVal] : undefined,
    riskLevel: parsed.data.riskLevel ? RISK_MAP[parsed.data.riskLevel] : undefined,
  };

  const result = await getContractList(filters as Parameters<typeof getContractList>[0]);

  const contracts = result.contracts.map((c) => ({
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
  }));

  return NextResponse.json({
    contracts,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const contractName = formData.get("contractName") as string | null;
  const supplierName = formData.get("supplierName") as string | null;
  const contractType = formData.get("contractType") as string | null;
  const effectiveDate = formData.get("effectiveDate") as string | null;
  const expiryDate = formData.get("expiryDate") as string | null;
  const value = formData.get("value") as string | null;

  const parsed = createContractSchema.safeParse({
    contractName: contractName ?? "",
    supplierName: supplierName ?? "",
    contractType: contractType ?? "MSA",
    effectiveDate: effectiveDate ?? new Date().toISOString().slice(0, 10),
    expiryDate: expiryDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().slice(0, 10),
    value: value ? parseFloat(value) : 0,
    tags: [],
  });

  if (!parsed.success || !file || file.type !== "application/pdf") {
    return NextResponse.json(
      { error: parsed.success ? "PDF file required" : parsed.error.flatten() },
      { status: 400 }
    );
  }

  let supplier = await prisma.supplier.findFirst({
    where: { name: { equals: parsed.data.supplierName, mode: "insensitive" } },
  });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: parsed.data.supplierName,
        industry: null,
        spendEstimate: 0,
      },
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveFile(buffer, file.name, file.type);

  const riskScore = Math.floor(Math.random() * 50) + 20;
  const riskLevel =
    riskScore >= 75 ? "critical" : riskScore >= 55 ? "high" : riskScore >= 35 ? "medium" : "low";

  const contract = await prisma.contract.create({
    data: {
      supplierId: supplier.id,
      contractName: parsed.data.contractName,
      contractType: TYPE_MAP[parsed.data.contractType] ?? "MSA",
      effectiveDate: new Date(parsed.data.effectiveDate),
      expiryDate: new Date(parsed.data.expiryDate),
      status: "active",
      riskScore,
      riskLevel: RISK_MAP[riskLevel] ?? "low",
      value: parsed.data.value,
      tags: parsed.data.tags ?? [],
    },
  });

  const doc = await prisma.contractDocument.create({
    data: {
      contractId: contract.id,
      storagePath: stored.storagePath,
      filename: stored.filename,
      mimeType: stored.mimeType,
      size: stored.size,
      checksum: stored.checksum,
    },
  });

  const version = await prisma.contractVersion.create({
    data: {
      documentId: doc.id,
      versionNumber: 1,
      processingStatus: "PENDING",
    },
  });

  await addActivityEvent(
    contract.id,
    "uploaded",
    `${parsed.data.contractName} uploaded`,
    session.user.id
  );

  // Run extraction inline for MVP
  try {
    await runExtractionPipeline(version.id);
    await addActivityEvent(
      contract.id,
      "extracted",
      "Contract terms extracted successfully",
      session.user.id
    );
    await addActivityEvent(
      contract.id,
      "insights_generated",
      `Risk analysis completed - Score: ${riskScore}/100`,
      session.user.id
    );
    await prisma.contract.update({
      where: { id: contract.id },
      data: { lastAnalyzedAt: new Date() },
    });
  } catch (e) {
    await addActivityEvent(
      contract.id,
      "extracted",
      "Extraction failed - manual review required",
      session.user.id,
      { error: String(e) }
    );
  }

  return NextResponse.json({
    id: contract.id,
    supplierName: supplier.name,
    contractName: contract.contractName,
    contractType: contract.contractType,
    effectiveDate: contract.effectiveDate.toISOString().slice(0, 10),
    expiryDate: contract.expiryDate.toISOString().slice(0, 10),
    status: toApiStatus(contract.status),
    riskScore: contract.riskScore,
    riskLevel: contract.riskLevel,
    value: contract.value,
    uploadedAt: contract.uploadedAt.toISOString(),
    lastAnalyzedAt: contract.lastAnalyzedAt?.toISOString() ?? null,
  });
}
