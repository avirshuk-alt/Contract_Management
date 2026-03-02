/**
 * Demo data for Dashboard. Two UI-only demo contracts (not persisted).
 * CONTRACT_DEMO_1: existing full-featured profile.
 * CONTRACT_DEMO_2: Net 30, 8% discount, no vending, no consignment, 95% fill, 1.5% rebate, different trends.
 */

import type { ContractExtractionPayload } from "@/lib/types/extraction";

export const CONTRACT_DEMO_1 = "CONTRACT_DEMO_1";
export const CONTRACT_DEMO_2 = "CONTRACT_DEMO_2";

export const DEMO_CONTRACT_1_LABEL = "Demo Contract A — Acme MRO";
export const DEMO_CONTRACT_2_LABEL = "Demo Contract B — Beta Supplies";

function ef<T>(value: T, confidence = 0.9) {
  return { value, confidence, evidence: [] as { quote: string; page?: number | null }[] };
}

/** CONTRACT_DEMO_1: Net 45, 12% discount, vending, consignment, 98% fill, 2.5% rebate. */
export const DEMO_CONTRACT_1_PAYLOAD: ContractExtractionPayload = {
  meta: {
    extractedAt: new Date().toISOString(),
    extractorVersion: "demo-v1",
    overallConfidence: 0.85,
  },
  keyStats: {
    contractStartDate: ef("2024-01-15T00:00:00.000Z"),
    contractEndDate: ef("2027-01-14T00:00:00.000Z"),
    autoRenewal: ef({ enabled: true, termMonths: 12, noticeDays: 90 }),
    paymentTerms: ef({ type: "NET_DAYS" as const, netDays: 45, text: "Net 45" }),
    lengthOfMSAYears: ef(3),
    catalogDiscounts: ef({
      summaryPct: 12,
      byCategory: [
        { category: "MRO Supplies", discountPct: 15 },
        { category: "Safety", discountPct: 10 },
      ],
    }),
    revenueRebate: ef({
      summaryPct: 2.5,
      tiers: [
        { spendMin: 0, spendMax: 500_000, rebatePct: 1 },
        { spendMin: 500_000, spendMax: 1_000_000, rebatePct: 2 },
        { spendMin: 1_000_000, spendMax: null, rebatePct: 2.5 },
      ],
    }),
    fillRateGuarantee: ef({ pct: 98, text: "98% fill rate" }),
    consignment: ef(true),
    vmi: ef({ offered: true, markupPct: 5, text: "5% markup" }),
    vendingMachines: ef({ offered: true, cost: { amount: 150, frequency: "MONTH" as const } }),
    inventoryBuyBack: ef(true),
    itemLevelPricing: ef(true),
    fixedPricingTerm: ef({ months: 24, text: "24 months" }),
    invoicingOptions: ef({ edi: true, pcard: true, perShipment: false, otherText: null }),
  },
  keyTerms: {
    sitesCovered: ef(["Site A", "Site B", "Site C"]),
    binManagement: ef({ offered: true, markupText: "Standard 3%" }),
    expeditedService: ef({ offered: true, termsText: "24–48 hr available" }),
    accountManagement: ef({ description: "Dedicated account manager" }),
    spendDataReports: ef({ frequency: "MONTHLY" as const, description: "Monthly spend reports" }),
    orderingEcommerce: ef({ optionsText: "Portal + EDI" }),
  },
  derived: {
    daysUntilExpiry: 720,
    isExpired: false,
    paymentTermsDays: 45,
    discountDepthScore: 72,
    serviceCoverageScore: 85,
  },
  opportunities: [
    { id: "d1-1", title: "Rebate tier renegotiation", category: "Pricing", lever: "Pricing (discounts/rebates)", rationale: "Current rebate tiers could be improved at higher spend thresholds.", prerequisitesMissing: [], estimatedSavingsRange: { low: 15000, high: 40000, basisText: "Rebate % improvement" }, confidence: 0.75, status: "New", evidence: [] },
    { id: "d1-2", title: "Extend payment terms to Net 60", category: "Terms", lever: "Payment terms", rationale: "Negotiate Net 60 to improve cash flow (currently Net 45).", prerequisitesMissing: [], estimatedSavingsRange: { low: null, high: null, basisText: "Cash flow benefit" }, confidence: 0.7, status: "New", evidence: [] },
    { id: "d1-3", title: "Cap vending machine fees", category: "Operations", lever: "Vending fees", rationale: "Vending fees at $150/mo; consider cap or waiver for high-volume sites.", prerequisitesMissing: [], estimatedSavingsRange: { low: 5000, high: 12000, basisText: "Annual vending cost" }, confidence: 0.65, status: "In Review", evidence: [] },
    { id: "d1-4", title: "Reduce VMI markup", category: "Pricing", lever: "VMI / inventory optimization", rationale: "Current 5% VMI markup; benchmark suggests 3–4% is achievable.", prerequisitesMissing: [], estimatedSavingsRange: { low: 8000, high: 20000, basisText: "Markup reduction" }, confidence: 0.68, status: "New", evidence: [] },
    { id: "d1-5", title: "Add fill-rate SLA penalty", category: "Service", lever: "Service levels (fill rate/SLA)", rationale: "98% fill rate is strong; add penalty clause for underperformance.", prerequisitesMissing: [], estimatedSavingsRange: null, confidence: 0.6, status: "New", evidence: [] },
  ],
};

/** CONTRACT_DEMO_2: Net 30, 8% discount, no vending, no consignment, 95% fill, 1.5% rebate. */
export const DEMO_CONTRACT_2_PAYLOAD: ContractExtractionPayload = {
  meta: {
    extractedAt: new Date().toISOString(),
    extractorVersion: "demo-v1",
    overallConfidence: 0.78,
  },
  keyStats: {
    contractStartDate: ef("2024-06-01T00:00:00.000Z"),
    contractEndDate: ef("2026-05-31T00:00:00.000Z"),
    autoRenewal: ef({ enabled: false, termMonths: null, noticeDays: 60 }),
    paymentTerms: ef({ type: "NET_DAYS" as const, netDays: 30, text: "Net 30" }),
    lengthOfMSAYears: ef(2),
    catalogDiscounts: ef({
      summaryPct: 8,
      byCategory: [
        { category: "MRO Supplies", discountPct: 8 },
        { category: "Safety", discountPct: 6 },
      ],
    }),
    revenueRebate: ef({
      summaryPct: 1.5,
      tiers: [
        { spendMin: 0, spendMax: 750_000, rebatePct: 1 },
        { spendMin: 750_000, spendMax: null, rebatePct: 1.5 },
      ],
    }),
    fillRateGuarantee: ef({ pct: 95, text: "95% fill rate" }),
    consignment: ef(false),
    vmi: ef({ offered: true, markupPct: 4, text: "4% markup" }),
    vendingMachines: ef({ offered: false, cost: undefined }),
    inventoryBuyBack: ef(false),
    itemLevelPricing: ef(true),
    fixedPricingTerm: ef({ months: 12, text: "12 months" }),
    invoicingOptions: ef({ edi: true, pcard: false, perShipment: true, otherText: "Invoice per delivery" }),
  },
  keyTerms: {
    sitesCovered: ef(["North", "South"]),
    binManagement: ef({ offered: false, markupText: null }),
    expeditedService: ef({ offered: true, termsText: "48–72 hr" }),
    accountManagement: ef({ description: "Shared account team" }),
    spendDataReports: ef({ frequency: "QUARTERLY" as const, description: "Quarterly reports" }),
    orderingEcommerce: ef({ optionsText: "Portal only" }),
  },
  derived: {
    daysUntilExpiry: 485,
    isExpired: false,
    paymentTermsDays: 30,
    discountDepthScore: 55,
    serviceCoverageScore: 62,
  },
  opportunities: [
    { id: "d2-1", title: "Improve rebate to 2%+", category: "Pricing", lever: "Pricing (discounts/rebates)", rationale: "Current 1.5% rebate is below market; push for tiered 2%+.", prerequisitesMissing: [], estimatedSavingsRange: { low: 10000, high: 25000, basisText: "Rebate increase" }, confidence: 0.72, status: "New", evidence: [] },
    { id: "d2-2", title: "Extend payment terms to Net 45", category: "Terms", lever: "Payment terms", rationale: "Net 30 is short; extend to Net 45 for cash flow.", prerequisitesMissing: [], estimatedSavingsRange: { low: null, high: null, basisText: "Cash flow" }, confidence: 0.68, status: "New", evidence: [] },
    { id: "d2-3", title: "Add consignment option", category: "Operations", lever: "VMI / inventory optimization", rationale: "No consignment today; adding it could reduce working capital.", prerequisitesMissing: [], estimatedSavingsRange: { low: 15000, high: 35000, basisText: "Inventory carry" }, confidence: 0.6, status: "New", evidence: [] },
    { id: "d2-4", title: "Raise fill-rate guarantee to 97%", category: "Service", lever: "Service levels (fill rate/SLA)", rationale: "95% fill rate; negotiate 97% with penalty for underperformance.", prerequisitesMissing: [], estimatedSavingsRange: null, confidence: 0.55, status: "New", evidence: [] },
    { id: "d2-5", title: "Add P-card for AP efficiency", category: "Operations", lever: "Invoicing / AP process", rationale: "P-card not currently enabled; enable for faster payment and potential discount.", prerequisitesMissing: [], estimatedSavingsRange: { low: 3000, high: 8000, basisText: "AP efficiency" }, confidence: 0.65, status: "In Review", evidence: [] },
  ],
};

/** Chart data for CONTRACT_DEMO_1. */
export const DEMO_CONTRACT_1_SPEND_TREND = [
  { month: "Jul", spend: 420, savings: 52 },
  { month: "Aug", spend: 445, savings: 58 },
  { month: "Sep", spend: 438, savings: 61 },
  { month: "Oct", spend: 460, savings: 65 },
  { month: "Nov", spend: 478, savings: 72 },
  { month: "Dec", spend: 492, savings: 78 },
];

/** Chart data for CONTRACT_DEMO_2 — different curve. */
export const DEMO_CONTRACT_2_SPEND_TREND = [
  { month: "Jul", spend: 280, savings: 22 },
  { month: "Aug", spend: 310, savings: 28 },
  { month: "Sep", spend: 295, savings: 25 },
  { month: "Oct", spend: 330, savings: 32 },
  { month: "Nov", spend: 350, savings: 38 },
  { month: "Dec", spend: 365, savings: 42 },
];

export const DEMO_CONTRACT_1_RISK_VS_SAVINGS = [
  { category: "Pricing", riskScore: 25, savingsPotential: 45 },
  { category: "Service", riskScore: 35, savingsPotential: 20 },
  { category: "Operations", riskScore: 45, savingsPotential: 35 },
  { category: "Terms", riskScore: 20, savingsPotential: 15 },
];

export const DEMO_CONTRACT_2_RISK_VS_SAVINGS = [
  { category: "Pricing", riskScore: 40, savingsPotential: 55 },
  { category: "Service", riskScore: 50, savingsPotential: 25 },
  { category: "Operations", riskScore: 30, savingsPotential: 40 },
  { category: "Terms", riskScore: 35, savingsPotential: 20 },
];

/** Legacy export for callers that still use single demo payload (defaults to demo 1). */
export const DEMO_EXTRACTION_PAYLOAD = DEMO_CONTRACT_1_PAYLOAD;

/** UI-only options for dropdown when backend returns 0 contracts. */
export const DEMO_CONTRACT_OPTIONS = [
  { id: CONTRACT_DEMO_1, contractName: "Demo Contract A", supplierName: "Acme MRO", uploadedAt: "" },
  { id: CONTRACT_DEMO_2, contractName: "Demo Contract B", supplierName: "Beta Supplies", uploadedAt: "" },
] as const;

/** Legacy exports for chart components. */
export const DEMO_SPEND_SAVINGS_TREND = DEMO_CONTRACT_1_SPEND_TREND;
export const DEMO_RISK_VS_SAVINGS = DEMO_CONTRACT_1_RISK_VS_SAVINGS;
