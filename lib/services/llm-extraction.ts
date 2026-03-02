/**
 * LLM-powered MRO contract extraction.
 * Uses OpenAI to extract structured ContractExtractionPayload from contract text.
 * Falls back gracefully when API key is missing or extraction fails.
 */

import OpenAI from "openai";
import type { ContractExtractionPayload } from "@/lib/types/extraction";
import { contractExtractionPayloadSchema } from "@/lib/types/extraction";

const EXTRACTOR_VERSION = "llm-v1";

function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

/** Returns true if OPENAI_API_KEY is set and non-empty. */
export function hasLlmExtractionConfigured(): boolean {
  return !!getApiKey();
}

const EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting structured data from MRO (Maintenance, Repair, Operations) supplier contracts. Extract only what is explicitly stated in the text. Do not guess or infer. Use null for any value not found.

Return a JSON object with this exact structure. Each extracted field has: value, confidence (0-1), evidence (array of {quote, page?}).

keyStats: {
  contractStartDate: {value: "YYYY-MM-DD"|null, confidence: number, evidence: [{quote:string}]},
  contractEndDate: {value: "YYYY-MM-DD"|null, confidence: number, evidence: []},
  autoRenewal: {value: {enabled: boolean|null, termMonths?: number, noticeDays?: number}, confidence: number, evidence: []},
  paymentTerms: {value: {type: "NET_DAYS"|"OTHER"|null, netDays?: number, text?: string}, confidence: number, evidence: []},
  lengthOfMSAYears: {value: number|null, confidence: number, evidence: []},
  catalogDiscounts: {value: {summaryPct?: number, byCategory?: [{category:string, discountPct:number|null}]}|null, confidence: number, evidence: []},
  revenueRebate: {value: {summaryPct?: number, tiers?: [{spendMin?, spendMax?, rebatePct?}]}|null, confidence: number, evidence: []},
  fillRateGuarantee: {value: {pct?: number, text?: string}|null, confidence: number, evidence: []},
  consignment: {value: boolean|null, confidence: number, evidence: []},
  vmi: {value: {offered: boolean|null, markupPct?: number, text?: string}|null, confidence: number, evidence: []},
  vendingMachines: {value: {offered: boolean|null, cost?: {amount?: number, frequency?: string, text?: string}}|null, confidence: number, evidence: []},
  inventoryBuyBack: {value: boolean|null, confidence: number, evidence: []},
  itemLevelPricing: {value: boolean|null, confidence: number, evidence: []},
  fixedPricingTerm: {value: {months?: number, text?: string}|null, confidence: number, evidence: []},
  invoicingOptions: {value: {edi?: boolean, pcard?: boolean, perShipment?: boolean, otherText?: string}|null, confidence: number, evidence: []}
}

keyTerms: {
  sitesCovered: {value: string[]|null, confidence: number, evidence: []},
  binManagement: {value: {offered: boolean|null, markupText?: string}|null, confidence: number, evidence: []},
  expeditedService: {value: {offered: boolean|null, termsText?: string}|null, confidence: number, evidence: []},
  accountManagement: {value: {description?: string}|null, confidence: number, evidence: []},
  spendDataReports: {value: {frequency?: "MONTHLY"|"QUARTERLY"|"ON_DEMAND"|"OTHER", description?: string}|null, confidence: number, evidence: []},
  orderingEcommerce: {value: {optionsText?: string}|null, confidence: number, evidence: []}
}

derived: {daysUntilExpiry: number|null, isExpired: boolean|null, paymentTermsDays: number|null, discountDepthScore: number|null, serviceCoverageScore: number|null}

valueCommitments: {initiatives: [{title:string, details?: string, target?: string, cadence?: string}]}|null

opportunities: [] (leave empty; will be computed separately)

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
    const result = contractExtractionPayloadSchema.safeParse(parsed);
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
