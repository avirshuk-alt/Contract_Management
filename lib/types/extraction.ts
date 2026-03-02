/**
 * MRO Contract Extraction Payload – schema and types.
 * All fields support value + confidence + evidence; missing = "Not extracted".
 * Future LLM: use extraction instructions in comments below; do not guess.
 */

import { z } from "zod";

// ----- Evidence (citations) -----
export const evidenceSchema = z.object({
  quote: z.string(),
  page: z.number().nullable().optional(),
  section: z.string().nullable().optional(),
  source: z.enum(["pdf", "docx", "text", "unknown"]).optional(),
});
export type Evidence = z.infer<typeof evidenceSchema>;

// ----- Extracted field wrapper (value + confidence + evidence) -----
function extractedField<T extends z.ZodType>(valueSchema: T) {
  return z.object({
    value: valueSchema,
    confidence: z.number().min(0).max(1),
    evidence: z.array(evidenceSchema).default([]),
    notes: z.string().optional(),
  });
}

// ----- Key stats value types -----
const isoDateNull = z.union([z.string(), z.null()]); // ISO date string when present
const autoRenewalValue = z.object({
  enabled: z.boolean().nullable(),
  termMonths: z.number().nullable().optional(),
  noticeDays: z.number().nullable().optional(),
});
const paymentTermsValue = z.object({
  type: z.enum(["NET_DAYS", "OTHER"]).nullable(),
  netDays: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
});
const catalogDiscountsValue = z.object({
  summaryPct: z.number().nullable().optional(),
  byCategory: z
    .array(z.object({ category: z.string(), discountPct: z.number().nullable() }))
    .optional(),
}).nullable();
const revenueRebateValue = z.object({
  summaryPct: z.number().nullable().optional(),
  tiers: z
    .array(
      z.object({
        spendMin: z.number().nullable().optional(),
        spendMax: z.number().nullable().optional(),
        rebatePct: z.number().nullable().optional(),
      })
    )
    .optional(),
}).nullable();
const fillRateValue = z.object({
  pct: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
}).nullable();
const vmiValue = z.object({
  offered: z.boolean().nullable(),
  markupPct: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
}).nullable();
const vendingCostValue = z.object({
  amount: z.number().nullable().optional(),
  frequency: z.enum(["MONTH", "YEAR", "ONE_TIME"]).nullable().optional(),
  text: z.string().nullable().optional(),
}).optional();
const vendingMachinesValue = z.object({
  offered: z.boolean().nullable(),
  cost: vendingCostValue.optional(),
}).nullable();
const fixedPricingTermValue = z.object({
  months: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
}).nullable();
const invoicingOptionsValue = z.object({
  edi: z.boolean().nullable().optional(),
  pcard: z.boolean().nullable().optional(),
  perShipment: z.boolean().nullable().optional(),
  otherText: z.string().nullable().optional(),
}).nullable();

export const keyStatsSchema = z.object({
  // Dates: "Effective Date", "Commencement Date", "Term begins"; prefer explicit effective/commencement; fallback first date-labeled start.
  contractStartDate: extractedField(isoDateNull),
  // End date: "Expiration", "Term ends", "Initial term of X years from Effective Date" (if only duration, derive endDate).
  contractEndDate: extractedField(isoDateNull),
  autoRenewal: extractedField(autoRenewalValue),
  // Payment terms: parse "Net 30/45/60", "Due within X days"; if ambiguous store raw text.
  paymentTerms: extractedField(paymentTermsValue),
  lengthOfMSAYears: extractedField(z.number().nullable()),

  catalogDiscounts: extractedField(catalogDiscountsValue),
  revenueRebate: extractedField(revenueRebateValue),

  fillRateGuarantee: extractedField(fillRateValue),
  consignment: extractedField(z.boolean().nullable()),
  vmi: extractedField(vmiValue),
  vendingMachines: extractedField(vendingMachinesValue),
  inventoryBuyBack: extractedField(z.boolean().nullable()),
  itemLevelPricing: extractedField(z.boolean().nullable()),
  fixedPricingTerm: extractedField(fixedPricingTermValue),

  invoicingOptions: extractedField(invoicingOptionsValue),
});
export type KeyStats = z.infer<typeof keyStatsSchema>;

// ----- Key terms -----
const binManagementValue = z.object({
  offered: z.boolean().nullable(),
  markupText: z.string().nullable().optional(),
}).nullable();
const expeditedServiceValue = z.object({
  offered: z.boolean().nullable(),
  termsText: z.string().nullable().optional(),
}).nullable();
const accountManagementValue = z.object({
  description: z.string().nullable().optional(),
}).nullable();
const spendDataReportsValue = z.object({
  frequency: z.enum(["MONTHLY", "QUARTERLY", "ON_DEMAND", "OTHER"]).nullable().optional(),
  description: z.string().nullable().optional(),
}).nullable();
const orderingEcommerceValue = z.object({
  optionsText: z.string().nullable().optional(),
}).nullable();

export const keyTermsSchema = z.object({
  sitesCovered: extractedField(z.array(z.string()).nullable()),
  binManagement: extractedField(binManagementValue),
  expeditedService: extractedField(expeditedServiceValue),
  accountManagement: extractedField(accountManagementValue),
  spendDataReports: extractedField(spendDataReportsValue),
  orderingEcommerce: extractedField(orderingEcommerceValue),
});
export type KeyTerms = z.infer<typeof keyTermsSchema>;

// ----- Derived (computed only when source exists) -----
export const derivedSchema = z.object({
  daysUntilExpiry: z.number().nullable(),
  isExpired: z.boolean().nullable(),
  paymentTermsDays: z.number().nullable(),
  discountDepthScore: z.number().nullable(),
  serviceCoverageScore: z.number().nullable(),
});
export type Derived = z.infer<typeof derivedSchema>;

// ----- Opportunity -----
export const opportunityLeverSchema = z.enum([
  "Pricing (discounts/rebates)",
  "Payment terms",
  "Service levels (fill rate/SLA)",
  "VMI / inventory optimization",
  "Vending fees",
  "Invoicing / AP process",
  "Other terms",
]);
export type OpportunityLever = z.infer<typeof opportunityLeverSchema>;

export const estimatedSavingsRangeSchema = z.object({
  low: z.number().nullable().optional(),
  high: z.number().nullable().optional(),
  basisText: z.string().nullable().optional(),
});
export const opportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(["Pricing", "Service", "Operations", "Terms"]),
  lever: z.string().optional(), // maps to OpportunityLever for filtering
  rationale: z.string(),
  prerequisitesMissing: z.array(z.string()),
  estimatedSavingsRange: estimatedSavingsRangeSchema.nullable(),
  confidence: z.number().min(0).max(1),
  status: z.enum(["New", "In Review", "Accepted", "Rejected"]),
  evidence: z.array(evidenceSchema),
});
export type Opportunity = z.infer<typeof opportunitySchema>;

// ----- Value commitments (supplier-stated; optional) -----
export const valueCommitmentInitiativeSchema = z.object({
  title: z.string(),
  details: z.string().optional(),
  target: z.string().optional(),
  cadence: z.string().optional(),
  evidence: z.array(evidenceSchema).optional(),
});
export const valueCommitmentsSchema = z.object({
  initiatives: z.array(valueCommitmentInitiativeSchema),
}).nullable().optional();
export type ValueCommitmentInitiative = z.infer<typeof valueCommitmentInitiativeSchema>;
export type ValueCommitments = z.infer<typeof valueCommitmentsSchema>;

// ----- Full payload -----
export const contractExtractionPayloadSchema = z.object({
  meta: z.object({
    extractedAt: z.string(),
    extractorVersion: z.string(),
    overallConfidence: z.number().min(0).max(1),
  }),
  keyStats: keyStatsSchema,
  keyTerms: keyTermsSchema,
  derived: derivedSchema,
  valueCommitments: valueCommitmentsSchema,
  opportunities: z.array(opportunitySchema),
});
export type ContractExtractionPayload = z.infer<typeof contractExtractionPayloadSchema>;
