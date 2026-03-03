/**
 * MRO Extraction: LLM-powered pipeline with stub fallback.
 * Uses llm-extraction when OPENAI_API_KEY is set and contract has extracted text.
 */

import { prisma } from "@/lib/db";
import { extractWithLlm, hasLlmExtractionConfigured } from "@/lib/services/llm-extraction";
import type { Prisma } from "@prisma/client";
import type {
  ContractExtractionPayload,
  KeyStats,
  KeyTerms,
  ContractIdentifiers,
  CriticalTerms,
  Derived,
  Opportunity,
  Evidence,
} from "@/lib/types/extraction";
import { contractExtractionPayloadSchema } from "@/lib/types/extraction";

const STUB_VERSION = "stub-v1";

function emptyEvidence(): Evidence[] {
  return [];
}

function emptyField<T>(value: T) {
  return { value, confidence: 0, evidence: emptyEvidence() };
}

/** Creates an empty extraction payload (all null/empty, extractorVersion stub-v1). */
export function createEmptyExtractionPayload(): ContractExtractionPayload {
  const keyStats: KeyStats = {
    contractStartDate: emptyField<string | null>(null),
    contractEndDate: emptyField<string | null>(null),
    autoRenewal: emptyField<{ enabled: boolean | null; termMonths?: number | null; noticeDays?: number | null }>({
      enabled: null,
    }),
    paymentTerms: emptyField<{ type: "NET_DAYS" | "OTHER" | null; netDays?: number | null; text?: string | null }>({
      type: null,
    }),
    lengthOfMSAYears: emptyField<number | null>(null),
    catalogDiscounts: emptyField(null),
    revenueRebate: emptyField(null),
    fillRateGuarantee: emptyField(null),
    consignment: emptyField<boolean | null>(null),
    vmi: emptyField(null),
    vendingMachines: emptyField(null),
    inventoryBuyBack: emptyField<boolean | null>(null),
    itemLevelPricing: emptyField<boolean | null>(null),
    fixedPricingTerm: emptyField(null),
    invoicingOptions: emptyField(null),
  };

  const keyTerms: KeyTerms = {
    sitesCovered: emptyField<string[] | null>(null),
    binManagement: emptyField(null),
    expeditedService: emptyField(null),
    accountManagement: emptyField(null),
    spendDataReports: emptyField(null),
    orderingEcommerce: emptyField(null),
  };

  const contractIdentifiers: ContractIdentifiers = {
    contractTitleFromDoc: emptyField<string | null>(null),
    supplierNameFromDoc: emptyField<string | null>(null),
    contractValueFromDoc: emptyField<string | null>(null),
  };

  const criticalTerms: CriticalTerms = {
    paymentTerms: emptyField<{ summary: string; netDays?: number; rawText?: string } | null>(null),
    terminationExit: emptyField<{ summary: string; noticeDays?: number; conditions?: string } | null>(null),
    penaltiesDamages: emptyField<{ summary: string; latePayment?: string; breach?: string } | null>(null),
    renewalTerms: emptyField<{ summary: string; autoRenewal?: boolean; noticeDays?: number } | null>(null),
    liabilityIndemnity: emptyField<{ summary: string; liabilityCap?: string; indemnificationScope?: string } | null>(null),
  };

  const derived: Derived = {
    daysUntilExpiry: null,
    isExpired: null,
    paymentTermsDays: null,
    discountDepthScore: null,
    serviceCoverageScore: null,
  };

  const payload: ContractExtractionPayload = {
    meta: {
      extractedAt: new Date().toISOString(),
      extractorVersion: STUB_VERSION,
      overallConfidence: 0,
    },
    keyStats,
    keyTerms,
    contractIdentifiers,
    criticalTerms,
    derived,
    valueCommitments: null,
    opportunities: [],
  };

  return payload;
}

/**
 * Opportunity engine: deterministic rules from extracted fields.
 * Only add opportunity when we have enough data; otherwise list prerequisitesMissing.
 */
export function runOpportunityEngine(
  payload: ContractExtractionPayload,
  contractExpiryDate?: string | null
): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const { keyStats, keyTerms, derived } = payload;
  let idSeq = 0;
  const nextId = () => `opp-${++idSeq}`;

  // Helper: add with evidence from a keyStat
  const add = (
    title: string,
    category: Opportunity["category"],
    rationale: string,
    prerequisitesMissing: string[],
    estimatedSavingsRange: Opportunity["estimatedSavingsRange"],
    confidence: number,
    evidence: Evidence[] = []
  ) => {
    opportunities.push({
      id: nextId(),
      title,
      category,
      rationale,
      prerequisitesMissing,
      estimatedSavingsRange,
      confidence,
      status: "New",
      evidence,
    });
  };

  // Rebate tier renegotiation: revenueRebate exists but no tiers or seems low
  const rebate = keyStats.revenueRebate.value;
  if (rebate !== null) {
    const hasTiers = Array.isArray(rebate.tiers) && rebate.tiers.length > 0;
    const summary = rebate.summaryPct ?? null;
    if (!hasTiers && summary === null) {
      add(
        "Rebate tier renegotiation",
        "Pricing",
        "Revenue rebate structure is present but tier details were not extracted. Consider renegotiating with defined tiers.",
        ["revenueRebate.tiers"],
        null,
        0.5,
        keyStats.revenueRebate.evidence
      );
    } else if (typeof summary === "number" && summary < 2) {
      add(
        "Rebate tier renegotiation",
        "Pricing",
        `Current rebate summary (${summary}%) may be low. Consider renegotiating rebate tiers.`,
        [],
        { low: null, high: null, basisText: "Rebate % improvement" },
        0.6,
        keyStats.revenueRebate.evidence
      );
    }
  } else {
    add(
      "Rebate tier renegotiation",
      "Pricing",
      "Revenue rebate not extracted. Once extracted, we can suggest tier renegotiation.",
      ["revenueRebate"],
      null,
      0.3,
      []
    );
  }

  // Volume-based discount: catalogDiscounts summary low vs categories
  const catalog = keyStats.catalogDiscounts.value;
  if (catalog !== null) {
    const summary = catalog.summaryPct ?? null;
    const byCat = catalog.byCategory ?? [];
    if (byCat.length > 0 && typeof summary === "number") {
      const maxCat = Math.max(...byCat.map((c) => c.discountPct ?? 0));
      if (summary < maxCat - 5) {
        add(
          "Volume-based discount improvement",
          "Pricing",
          `Summary discount (${summary}%) is below category max (${maxCat}%). Align volume discounts.`,
          [],
          { low: null, high: null, basisText: "Category discount alignment" },
          0.65,
          keyStats.catalogDiscounts.evidence
        );
      }
    }
  }

  // Payment terms: netDays < 45
  const pt = keyStats.paymentTerms.value;
  const netDays = pt?.netDays ?? derived.paymentTermsDays ?? null;
  if (typeof netDays === "number" && netDays < 45) {
    add(
      "Negotiate longer payment terms",
      "Terms",
      `Current payment terms (Net ${netDays}) are under 45 days. Extending improves cash flow.`,
      [],
      { low: null, high: null, basisText: "Cash flow benefit" },
      0.7,
      keyStats.paymentTerms.evidence
    );
  } else if (pt === null || (pt?.type === null && netDays === null)) {
    add(
      "Negotiate longer payment terms",
      "Terms",
      "Payment terms not extracted. Once Net X days is known, we can suggest extension.",
      ["paymentTerms"],
      null,
      0.3,
      []
    );
  }

  // Fill-rate SLA: missing or < 95%
  const fillRate = keyStats.fillRateGuarantee.value;
  const fillPct = fillRate?.pct ?? null;
  if (fillPct === null && fillRate === null) {
    add(
      "Add/raise fill-rate SLA",
      "Service",
      "Fill rate guarantee was not extracted. Consider adding or raising a fill-rate SLA.",
      ["fillRateGuarantee"],
      null,
      0.5,
      []
    );
  } else if (typeof fillPct === "number" && fillPct < 95) {
    add(
      "Add/raise fill-rate SLA",
      "Service",
      `Current fill rate guarantee (${fillPct}%) is below 95%. Consider negotiating higher.`,
      [],
      { low: null, high: null, basisText: "Reduced stockouts" },
      0.65,
      keyStats.fillRateGuarantee.evidence
    );
  }

  // Vending: offered and cost present -> cap or waive fees
  const vending = keyStats.vendingMachines.value;
  if (vending?.offered === true && vending.cost != null) {
    add(
      "Cap or waive vending machine fees",
      "Operations",
      "Vending machines are offered and cost terms were extracted. Consider capping or waiving fees.",
      [],
      { low: null, high: null, basisText: "Vending cost terms" },
      0.6,
      keyStats.vendingMachines.evidence
    );
  }

  // VMI: offered and markup present -> reduce/standardize
  const vmi = keyStats.vmi.value;
  if (vmi?.offered === true && typeof vmi.markupPct === "number") {
    add(
      "Reduce/standardize VMI markup",
      "Pricing",
      `VMI is offered with ${vmi.markupPct}% markup. Consider reducing or standardizing.`,
      [],
      { low: null, high: null, basisText: "VMI markup reduction" },
      0.6,
      keyStats.vmi.evidence
    );
  }

  // Invoicing: lack EDI/pcard but have reporting -> add EDI/P-card
  const inv = keyStats.invoicingOptions.value;
  const reports = keyTerms.spendDataReports.value;
  if (reports !== null && (inv?.edi === false || inv?.pcard === false || inv === null)) {
    add(
      "Add EDI/P-card for AP efficiency",
      "Operations",
      "Spend data reporting is present but EDI or P-card not fully enabled. Adding can improve AP efficiency.",
      inv === null ? ["invoicingOptions"] : [],
      { low: null, high: null, basisText: "Savings TBD" },
      0.5,
      keyStats.invoicingOptions?.evidence ?? []
    );
  }

  // Days until expiry (from derived or contract)
  const endDate = keyStats.contractEndDate.value ?? contractExpiryDate ?? null;
  if (derived.daysUntilExpiry !== null && derived.daysUntilExpiry <= 90) {
    add(
      "Contract renewal / expiry",
      "Terms",
      `Contract expires in ${derived.daysUntilExpiry} days. Plan renewal or renegotiation.`,
      [],
      null,
      0.9,
      keyStats.contractEndDate?.evidence ?? []
    );
  }

  return opportunities;
}

/**
 * Build stub payload (empty extraction + opportunity engine), persist to contract, return payload.
 */
export async function runMROExtractionStub(contractId: string): Promise<ContractExtractionPayload | null> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { id: true, expiryDate: true },
  });
  if (!contract) return null;

  const payload = createEmptyExtractionPayload();
  const expiryIso = contract.expiryDate.toISOString().slice(0, 10);

  // Compute derived from contract-level dates when we have no extraction
  payload.derived = {
    daysUntilExpiry: Math.floor(
      (contract.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    ),
    isExpired: contract.expiryDate < new Date(),
    paymentTermsDays: null,
    discountDepthScore: null,
    serviceCoverageScore: null,
  };

  payload.opportunities = runOpportunityEngine(payload, expiryIso);

  const parsed = contractExtractionPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Stub payload validation failed: " + JSON.stringify(parsed.error.flatten()));
  }

  const toStore = parsed.data as unknown as Prisma.InputJsonValue;
  await prisma.contract.update({
    where: { id: contractId },
    data: { extraction: toStore } as Prisma.ContractUpdateInput,
  });

  return parsed.data;
}

/**
 * Run MRO extraction: use LLM when API key is set and contract has extracted text; otherwise stub.
 */
export async function runMROExtraction(contractId: string): Promise<ContractExtractionPayload | null> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: {
      id: true,
      effectiveDate: true,
      expiryDate: true,
      documents: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            select: { extractedText: true },
          },
        },
      },
    },
  });
  if (!contract) return null;

  const version = contract.documents[0]?.versions[0];
  const extractedText = version?.extractedText ?? null;
  const metadata = {
    effectiveDate: contract.effectiveDate.toISOString().slice(0, 10),
    expiryDate: contract.expiryDate.toISOString().slice(0, 10),
  };

  if (extractedText && hasLlmExtractionConfigured()) {
    const llmPayload = await extractWithLlm(extractedText, metadata);
    if (llmPayload) {
      const expiryIso = metadata.expiryDate;
      llmPayload.opportunities = runOpportunityEngine(llmPayload, expiryIso);

      const parsed = contractExtractionPayloadSchema.safeParse(llmPayload);
      if (parsed.success) {
        const toStore = parsed.data as unknown as Prisma.InputJsonValue;
        await prisma.contract.update({
          where: { id: contractId },
          data: { extraction: toStore } as Prisma.ContractUpdateInput,
        });
        return parsed.data;
      }
    }
  }

  return runMROExtractionStub(contractId);
}

/** Default critical terms when loading legacy payloads that don't have them. */
function getDefaultCriticalTerms(): CriticalTerms {
  return {
    paymentTerms: emptyField<{ summary: string; netDays?: number; rawText?: string } | null>(null),
    terminationExit: emptyField<{ summary: string; noticeDays?: number; conditions?: string } | null>(null),
    penaltiesDamages: emptyField<{ summary: string; latePayment?: string; breach?: string } | null>(null),
    renewalTerms: emptyField<{ summary: string; autoRenewal?: boolean; noticeDays?: number } | null>(null),
    liabilityIndemnity: emptyField<{ summary: string; liabilityCap?: string; indemnificationScope?: string } | null>(null),
  };
}

/** Default contract identifiers for legacy payloads. */
function getDefaultContractIdentifiers(): ContractIdentifiers {
  return {
    contractTitleFromDoc: emptyField<string | null>(null),
    supplierNameFromDoc: emptyField<string | null>(null),
    contractValueFromDoc: emptyField<string | null>(null),
  };
}

/**
 * Get persisted extraction for a contract. If missing, run MRO extraction (LLM or stub) and persist.
 * Legacy payloads without criticalTerms are merged with defaults so they still validate.
 */
export async function getOrCreateExtraction(contractId: string): Promise<ContractExtractionPayload | null> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  });
  if (!contract) return null;

  const raw = (contract as { extraction?: unknown }).extraction;
  if (raw != null && typeof raw === "object" && "meta" in raw) {
    let parsed = contractExtractionPayloadSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    const o = raw as Record<string, unknown>;
    const withDefaults = { ...raw };
    if (!o.criticalTerms || typeof o.criticalTerms !== "object") (withDefaults as Record<string, unknown>).criticalTerms = getDefaultCriticalTerms();
    if (!o.contractIdentifiers || typeof o.contractIdentifiers !== "object") (withDefaults as Record<string, unknown>).contractIdentifiers = getDefaultContractIdentifiers();
    parsed = contractExtractionPayloadSchema.safeParse(withDefaults);
    if (parsed.success) return parsed.data;
  }

  return runMROExtraction(contractId);
}
