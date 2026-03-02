/**
 * Central Dashboard view model. Single source that feeds the Dashboard UI.
 * Built from extraction payload or demo data; includes isDemoSource for badges.
 */

import type { ContractExtractionPayload } from "@/lib/types/extraction";

const OPPORTUNITY_LEVERS = [
  "Pricing (discounts/rebates)",
  "Payment terms",
  "Service levels (fill rate/SLA)",
  "VMI / inventory optimization",
  "Vending fees",
  "Invoicing / AP process",
  "Other terms",
] as const;

function categoryToLever(category: string): string {
  const map: Record<string, string> = {
    Pricing: "Pricing (discounts/rebates)",
    Terms: "Payment terms",
    Service: "Service levels (fill rate/SLA)",
    Operations: "VMI / inventory optimization",
  };
  return map[category] ?? "Other terms";
}

const DEMO_SUPPLIER_VALUE_COMMITMENTS: SupplierValueCommitment[] = [
  { title: "Quarterly cost takeout review", target: "Annual cost reduction target", cadence: "Quarterly", isDemoSource: true },
  { title: "SKU rationalization program", details: "Reduce SKU count to lower carrying cost", cadence: "Ongoing", isDemoSource: true },
  { title: "VMI optimization to reduce stockouts", target: "Improve fill rate", cadence: "Monthly", isDemoSource: true },
  { title: "Quarterly rebate optimization review", cadence: "Quarterly", isDemoSource: true },
];

function buildSupplierValueCommitments(
  payload: ContractExtractionPayload,
  isDemoSource: boolean
): SupplierValueCommitment[] {
  const vc = (payload as { valueCommitments?: { initiatives: Array<{ title: string; details?: string; target?: string; cadence?: string }> } | null }).valueCommitments;
  if (vc?.initiatives?.length) {
    return vc.initiatives.map((i) => ({
      title: i.title,
      details: i.details,
      target: i.target,
      cadence: i.cadence,
      isDemoSource: false,
    }));
  }
  if (isDemoSource) {
    return DEMO_SUPPLIER_VALUE_COMMITMENTS;
  }
  return DEMO_SUPPLIER_VALUE_COMMITMENTS.map((c) => ({ ...c, isDemoSource: true }));
}

export interface DashboardKeyStats {
  startDate: string | null;
  endDate: string | null;
  termLengthMonths: number | null;
  paymentTermsText: string | null;
  avgCatalogDiscountPct: number | null;
  rebateSummaryPct: number | null;
  fillRatePct: number | null;
  vmiMarkupPct: number | null;
  vendingMonthlyCost: number | null;
  consignment: boolean | null;
  invoicingSummaryText: string | null;
  extractionConfidencePct: number;
  isDemoSource: boolean;
}

export interface DashboardCharts {
  discountByCategory: Array<{ category: string; discountPct: number | null }>;
  rebateTiers: Array<{ tierLabel: string; rebatePct: number | null }>;
  spendTrend: Array<{ month: string; spendUSD: number; savingsUSD: number }>;
  riskVsSavings: Array<{ riskScore: number; savingsUSD: number; category?: string }>;
  capabilityMatrix: Array<{ capability: string; status: "yes" | "no" | "unknown" }>;
  isDemoSource: boolean;
}

export interface DashboardOpportunity {
  id?: string;
  title: string;
  category: string;
  lever: string; // one of OpportunityLever for filtering
  rationale: string;
  prerequisitesMissing: string[];
  estimatedSavingsRange: { low: number | null; high: number | null; basisText: string | null } | null;
  confidence: number;
  status: string;
  evidence: Array<{ quote: string; page?: number | null }>;
  isDemoSource: boolean;
}

export interface SupplierValueCommitment {
  title: string;
  details?: string;
  target?: string;
  cadence?: string;
  isDemoSource?: boolean;
}

export interface DashboardViewModel {
  keyStats: DashboardKeyStats;
  charts: DashboardCharts;
  opportunities: DashboardOpportunity[];
  supplierValueCommitments: SupplierValueCommitment[];
  showExtractionPendingBanner: boolean;
  payload: ContractExtractionPayload;
}

function fromPayload(
  payload: ContractExtractionPayload,
  isDemoSource: boolean
): DashboardViewModel {
  const ks = payload.keyStats;
  const conf = Math.round((payload.meta?.overallConfidence ?? 0) * 100);

  const keyStats: DashboardKeyStats = {
    startDate: ks.contractStartDate.value ?? null,
    endDate: ks.contractEndDate.value ?? null,
    termLengthMonths:
      ks.lengthOfMSAYears.value != null ? ks.lengthOfMSAYears.value * 12 : ks.autoRenewal.value?.termMonths ?? null,
    paymentTermsText:
      ks.paymentTerms.value?.type === "NET_DAYS" && ks.paymentTerms.value?.netDays != null
        ? `Net ${ks.paymentTerms.value.netDays}`
        : ks.paymentTerms.value?.text ?? null,
    avgCatalogDiscountPct: ks.catalogDiscounts.value?.summaryPct ?? null,
    rebateSummaryPct: ks.revenueRebate.value?.summaryPct ?? null,
    fillRatePct: ks.fillRateGuarantee.value?.pct ?? null,
    vmiMarkupPct: ks.vmi.value?.markupPct ?? null,
    vendingMonthlyCost:
      ks.vendingMachines.value?.cost?.frequency === "MONTH"
        ? ks.vendingMachines.value?.cost?.amount ?? null
        : null,
    consignment: ks.consignment.value,
    invoicingSummaryText: (() => {
      const inv = ks.invoicingOptions.value;
      if (!inv) return null;
      const parts: string[] = [];
      if (inv.edi) parts.push("EDI");
      if (inv.pcard) parts.push("P-card");
      if (inv.perShipment) parts.push("Per shipment");
      if (inv.otherText) parts.push(inv.otherText);
      return parts.length ? parts.join(", ") : null;
    })(),
    extractionConfidencePct: conf,
    isDemoSource,
  };

  const discountByCategory =
    ks.catalogDiscounts.value?.byCategory?.map((c) => ({
      category: c.category,
      discountPct: c.discountPct,
    })) ?? [];
  if (discountByCategory.length === 0 && ks.catalogDiscounts.value?.summaryPct != null) {
    discountByCategory.push({ category: "Summary", discountPct: ks.catalogDiscounts.value.summaryPct });
  }

  const rebateTiers =
    ks.revenueRebate.value?.tiers?.map((t, i) => ({
      tierLabel: `Tier ${i + 1}`,
      rebatePct: t.rebatePct ?? null,
    })) ?? [];
  if (rebateTiers.length === 0 && ks.revenueRebate.value?.summaryPct != null) {
    rebateTiers.push({ tierLabel: "Rebate", rebatePct: ks.revenueRebate.value.summaryPct });
  }

  const charts: DashboardCharts = {
    discountByCategory,
    rebateTiers,
    spendTrend: [],
    riskVsSavings: [],
    capabilityMatrix: [
      { capability: "Consignment", status: ks.consignment.value === true ? "yes" : ks.consignment.value === false ? "no" : "unknown" },
      { capability: "VMI", status: ks.vmi.value?.offered === true ? "yes" : ks.vmi.value?.offered === false ? "no" : "unknown" },
      { capability: "Vending", status: ks.vendingMachines.value?.offered === true ? "yes" : ks.vendingMachines.value?.offered === false ? "no" : "unknown" },
      { capability: "Bin mgmt", status: payload.keyTerms.binManagement.value?.offered === true ? "yes" : payload.keyTerms.binManagement.value?.offered === false ? "no" : "unknown" },
      { capability: "Expedited", status: payload.keyTerms.expeditedService.value?.offered === true ? "yes" : payload.keyTerms.expeditedService.value?.offered === false ? "no" : "unknown" },
      { capability: "Item pricing", status: ks.itemLevelPricing.value === true ? "yes" : ks.itemLevelPricing.value === false ? "no" : "unknown" },
    ],
    isDemoSource,
  };

  const opportunities: DashboardOpportunity[] = payload.opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    category: o.category,
    lever: (o as { lever?: string }).lever ?? categoryToLever(o.category),
    rationale: o.rationale,
    prerequisitesMissing: o.prerequisitesMissing ?? [],
    estimatedSavingsRange: o.estimatedSavingsRange
      ? {
          low: o.estimatedSavingsRange.low ?? null,
          high: o.estimatedSavingsRange.high ?? null,
          basisText: o.estimatedSavingsRange.basisText ?? null,
        }
      : null,
    confidence: o.confidence,
    status: o.status,
    evidence: o.evidence ?? [],
    isDemoSource,
  }));

  const supplierValueCommitments = buildSupplierValueCommitments(payload, isDemoSource);

  return {
    keyStats,
    charts,
    opportunities,
    supplierValueCommitments,
    showExtractionPendingBanner: false,
    payload,
  };
}

/** Build view model from extraction payload (real or demo). Set showExtractionPendingBanner when using demo fallback for a real contract. */
export function buildDashboardViewModel(
  payload: ContractExtractionPayload,
  options: {
    isDemoSource: boolean;
    showExtractionPendingBanner?: boolean;
    chartOverrides?: {
      spendTrend?: Array<{ month: string; spend?: number; spendUSD?: number; savings?: number; savingsUSD?: number }>;
      riskVsSavings?: Array<{ riskScore: number; savingsPotential?: number; savingsUSD?: number; category?: string }>;
    };
  }
): DashboardViewModel {
  const vm = fromPayload(payload, options.isDemoSource);
  vm.showExtractionPendingBanner = options.showExtractionPendingBanner ?? false;
  if (options.chartOverrides?.spendTrend?.length) {
    vm.charts.spendTrend = options.chartOverrides.spendTrend.map((s) => ({
      month: s.month,
      spendUSD: s.spendUSD ?? s.spend ?? 0,
      savingsUSD: s.savingsUSD ?? s.savings ?? 0,
    }));
  }
  if (options.chartOverrides?.riskVsSavings?.length) {
    vm.charts.riskVsSavings = options.chartOverrides.riskVsSavings.map((r) => ({
      riskScore: r.riskScore,
      savingsUSD: r.savingsUSD ?? r.savingsPotential ?? 0,
      category: r.category,
    }));
  }
  return vm;
}
