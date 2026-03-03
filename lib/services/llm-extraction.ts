/**
 * LLM-powered MRO contract extraction.
 * Uses OpenAI to extract structured ContractExtractionPayload from contract text.
 * Falls back gracefully when API key is missing or extraction fails.
 */

import OpenAI from "openai";
import type { ContractExtractionPayload } from "@/lib/types/extraction";
import { contractExtractionPayloadSchema } from "@/lib/types/extraction";

const EXTRACTOR_VERSION = "llm-v1";

function emptyCriticalField<T>(value: T) {
  return { value, confidence: 0, evidence: [] as { quote: string; page?: number }[] };
}

function ensureCriticalTerms(parsed: unknown): unknown {
  const o = parsed as Record<string, unknown>;
  if (o && typeof o === "object" && o.criticalTerms && typeof o.criticalTerms === "object") return parsed;
  const ct = {
    paymentTerms: emptyCriticalField<{ summary: string; netDays?: number; rawText?: string } | null>(null),
    terminationExit: emptyCriticalField<{ summary: string; noticeDays?: number; conditions?: string } | null>(null),
    penaltiesDamages: emptyCriticalField<{ summary: string; latePayment?: string; breach?: string } | null>(null),
    renewalTerms: emptyCriticalField<{ summary: string; autoRenewal?: boolean; noticeDays?: number } | null>(null),
    liabilityIndemnity: emptyCriticalField<{ summary: string; liabilityCap?: string; indemnificationScope?: string } | null>(null),
  };
  return { ...o, criticalTerms: ct };
}

function emptyIdField(value: string | null) {
  return { value, confidence: 0, evidence: [] as { quote: string; page?: number }[] };
}

function ensureContractIdentifiers(parsed: unknown): unknown {
  const o = parsed as Record<string, unknown>;
  if (o && typeof o === "object" && o.contractIdentifiers && typeof o.contractIdentifiers === "object") return parsed;
  return { ...o, contractIdentifiers: { contractTitleFromDoc: emptyIdField(null), supplierNameFromDoc: emptyIdField(null), contractValueFromDoc: emptyIdField(null) } };
}

function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

/** Returns true if OPENAI_API_KEY is set and non-empty. */
export function hasLlmExtractionConfigured(): boolean {
  return !!getApiKey();
}

const EXTRACTION_SYSTEM_PROMPT = `You are an expert in MRO (Maintenance, Repair, and Operations) supplier contracts. You understand master service agreements, supply agreements, amendments, pricing, rebates, SLAs, termination, and liability clauses typical in this space.

Your task: Extract structured data from the contract text. For every non-null value you extract, you MUST provide evidence: an array of one or more { "quote": "exact sentence or paragraph from the document that supports this value", "page": number or null }. The quote is the source paragraph from the doc—copy it verbatim so users can cite the contract. Do not guess or infer; use null if not found. Confidence is 0-1 (1 = explicitly stated in the quote).

Return ONLY valid JSON with this structure. Every field has: value, confidence, evidence (array of {quote, page?}). For any non-null value, evidence must contain at least one quote from the document.

contractIdentifiers: (from document text)
  contractTitleFromDoc: {value: string|null (agreement/contract title as stated in doc), confidence: number, evidence: [{quote: "source paragraph"}]},
  supplierNameFromDoc: {value: string|null (supplier/vendor name as in doc), confidence: number, evidence: [{quote: "source paragraph"}]},
  contractValueFromDoc: {value: string|null (contract value/amount if stated, e.g. "USD 1.5M" or raw text), confidence: number, evidence: [{quote: "source paragraph"}]}

keyStats: (each with value, confidence, evidence: [{quote, page?}])
  contractStartDate, contractEndDate (YYYY-MM-DD or null), autoRenewal, paymentTerms, lengthOfMSAYears, catalogDiscounts, revenueRebate, fillRateGuarantee, consignment, vmi, vendingMachines, inventoryBuyBack, itemLevelPricing, fixedPricingTerm, invoicingOptions
  (Use same nested value shapes as before; evidence must cite the source paragraph for each.)

keyTerms: sitesCovered, binManagement, expeditedService, accountManagement, spendDataReports, orderingEcommerce (each with value, confidence, evidence)

criticalTerms: (REQUIRED—these 5 high-impact clauses; for each, evidence must include the source paragraph from the doc)
  paymentTerms: {value: {summary, netDays?, rawText?}|null, confidence, evidence: [{quote: "exact clause or sentence"}]},
  terminationExit: {value: {summary, noticeDays?, conditions?}|null, confidence, evidence: [{quote: "exact clause"}]},
  penaltiesDamages: {value: {summary, latePayment?, breach?}|null, confidence, evidence: [{quote: "exact clause"}]},
  renewalTerms: {value: {summary, autoRenewal?, noticeDays?}|null, confidence, evidence: [{quote: "exact clause"}]},
  liabilityIndemnity: {value: {summary, liabilityCap?, indemnificationScope?}|null, confidence, evidence: [{quote: "exact clause"}]}

derived: {daysUntilExpiry: number|null, isExpired: boolean|null, paymentTermsDays: number|null, discountDepthScore: number|null, serviceCoverageScore: number|null}

valueCommitments: {initiatives: [{title, details?, target?, cadence?}]}|null

opportunities: [] (leave empty)

meta: {extractedAt: ISO date string, extractorVersion: "llm-v1", overallConfidence: number 0-1}`;

/**
 * Extracts ContractExtractionPayload from contract text using OpenAI.
 * Returns null if API key is missing, extraction fails, or output is invalid.
 * Never leaks API key in error messages.
 */
export async function extractWithLlm(
  text: string,
  metadata?: { effectiveDate?: string; expiryDate?: string }
): Promise<ContractExtractionPayload | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const truncated = text.length > 100_000 ? text.slice(0, 100_000) + "\n\n[Text truncated...]" : text;
  const userContent = [
    "Extract MRO contract data from this contract text. Return ONLY valid JSON, no markdown.",
    metadata?.effectiveDate ? `Known effective date from metadata: ${metadata.effectiveDate}` : null,
    metadata?.expiryDate ? `Known expiry date from metadata: ${metadata.expiryDate}` : null,
    "---\n" + truncated,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return null;
    }

    const parsed = JSON.parse(content) as unknown;
    let withDefaults = ensureCriticalTerms(parsed);
    withDefaults = ensureContractIdentifiers(withDefaults);
    const result = contractExtractionPayloadSchema.safeParse(withDefaults);
    if (!result.success) {
      return null;
    }

    const payload = result.data;
    payload.meta = {
      extractedAt: new Date().toISOString(),
      extractorVersion: EXTRACTOR_VERSION,
      overallConfidence: payload.meta?.overallConfidence ?? 0.5,
    };

    if (metadata?.effectiveDate && (!payload.keyStats.contractStartDate.value || payload.keyStats.contractStartDate.confidence < 0.5)) {
      payload.keyStats.contractStartDate = {
        value: metadata.effectiveDate,
        confidence: 0.5,
        evidence: [],
      };
    }
    if (metadata?.expiryDate && (!payload.keyStats.contractEndDate.value || payload.keyStats.contractEndDate.confidence < 0.5)) {
      payload.keyStats.contractEndDate = {
        value: metadata.expiryDate,
        confidence: 0.5,
        evidence: [],
      };
    }

    const expiryDate = payload.keyStats.contractEndDate.value ?? metadata?.expiryDate ?? null;
    if (expiryDate) {
      const end = new Date(expiryDate);
      payload.derived.daysUntilExpiry = Math.floor((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      payload.derived.isExpired = end < new Date();
    }
    const netDays = payload.keyStats.paymentTerms.value?.netDays;
    if (typeof netDays === "number") {
      payload.derived.paymentTermsDays = netDays;
    }

    return payload;
  } catch {
    return null;
  }
}
