/**
 * Extracts basic metadata (contract name, supplier, type) from contract text.
 * Uses heuristics + optional LLM when OPENAI_API_KEY is set.
 */

import { hasLlmExtractionConfigured } from "@/lib/services/llm-extraction";
import OpenAI from "openai";
import type { ContractType } from "@/lib/seed-data";

const CONTRACT_TYPES: ContractType[] = ["MSA", "SOW", "SLA", "NDA", "License", "Amendment"];

export interface ExtractedMetadata {
  contractName: string | null;
  supplierName: string | null;
  contractType: ContractType | null;
  effectiveDate: string | null;
  expiryDate: string | null;
}

function extractWithHeuristics(text: string, filename: string): ExtractedMetadata {
  const result: ExtractedMetadata = {
    contractName: null,
    supplierName: null,
    contractType: null,
    effectiveDate: null,
    expiryDate: null,
  };

  const firstPage = text.slice(0, 3000);
  const lower = firstPage.toLowerCase();

  // Contract name: look for title-like patterns (first lines, "Agreement", "Contract")
  const titlePatterns = [
    /^(?:MEMORANDUM\s+OF\s+)?(?:MASTER\s+)?(?:SERVICE\s+)?(?:SUPPLY\s+)?(?:THE\s+)?([A-Z][^\n]{20,120}?)(?:\s*$|\n|Agreement|Contract|Amendment|SOW|MSA)/m,
    /(?:agreement|contract)\s+between\s+(?:[^,]+),\s*(?:and|&)\s+([^\n,]+)/i,
    /^([A-Za-z0-9\s&\-']+(?:Agreement|Contract|Amendment|SOW|Statement of Work|MSA|SLA)[^\n]{0,60})/m,
    /(?:title|subject)[:\s]+([^\n]{10,100})/i,
  ];
  for (const re of titlePatterns) {
    const m = firstPage.match(re);
    if (m?.[1]) {
      const name = m[1].trim().replace(/\s+/g, " ").slice(0, 200);
      if (name.length > 10) {
        result.contractName = name;
        break;
      }
    }
  }
  if (!result.contractName) {
    result.contractName = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") || filename;
  }

  // Supplier: "between X and Y", "Supplier:", "Vendor:", "provided by"
  const supplierPatterns = [
    /(?:between|by and between)\s+(?:[^,]+,?\s+)?(?:\([^)]+\)\s+)?([A-Za-z0-9][A-Za-z0-9\s,&.'-]{5,80}?)(?:\s+and\s+|\s*,\s*)/i,
    /(?:supplier|vendor|contractor|provider)[:\s]+([A-Za-z0-9][A-Za-z0-9\s,&.'-]{5,80})/i,
    /(?:provided\s+by|services\s+of)[:\s]+([A-Za-z0-9][A-Za-z0-9\s,&.'-]{5,80})/i,
    /(?:company\s+name|entity)[:\s]+([A-Za-z0-9][A-Za-z0-9\s,&.'-]{5,80})/i,
  ];
  for (const re of supplierPatterns) {
    const m = firstPage.match(re);
    if (m?.[1]) {
      const name = m[1].trim().replace(/\s+/g, " ").slice(0, 100);
      if (name.length > 3 && !/^(the|this|such)$/i.test(name)) {
        result.supplierName = name;
        break;
      }
    }
  }

  // Contract type: keyword search
  const typeKeywords: Record<string, ContractType> = {
    "master service agreement": "MSA",
    "msa": "MSA",
    "statement of work": "SOW",
    "sow": "SOW",
    "service level agreement": "SLA",
    "sla": "SLA",
    "nondisclosure": "NDA",
    "nda": "NDA",
    "confidentiality agreement": "NDA",
    "license agreement": "License",
    "software license": "License",
    "amendment": "Amendment",
    "addendum": "Amendment",
    "change order": "Amendment",
  };
  for (const [kw, type] of Object.entries(typeKeywords)) {
    if (lower.includes(kw)) {
      result.contractType = type;
      break;
    }
  }
  if (!result.contractType) result.contractType = "MSA";

  // Dates: ISO and common formats
  const isoDateRegex = /\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g;
  const dates: string[] = [];
  let dm;
  while ((dm = isoDateRegex.exec(text)) !== null) {
    dates.push(`${dm[1]}-${dm[2]}-${dm[3]}`);
  }
  const usRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/gi;
  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  while ((dm = usRegex.exec(text)) !== null) {
    const month = dm[0].slice(0, 3).toLowerCase();
    dates.push(`${dm[3]}-${monthMap[month] || "01"}-${dm[2].padStart(2, "0")}`);
  }
  if (dates.length >= 2) {
    dates.sort();
    result.effectiveDate = dates[0];
    result.expiryDate = dates[dates.length - 1];
  } else if (dates.length === 1) {
    result.effectiveDate = dates[0];
  }

  return result;
}

async function extractWithLlm(text: string, filename: string): Promise<ExtractedMetadata | null> {
  if (!hasLlmExtractionConfigured()) return null;

  const truncated = text.length > 15000 ? text.slice(0, 15000) + "\n\n[Text truncated...]" : text;

  const prompt = `Extract basic metadata from this contract. Return ONLY valid JSON with these keys (use null if not found):
{
  "contractName": "string or null - the contract/title name",
  "supplierName": "string or null - the supplier/vendor/contractor company name",
  "contractType": "one of: MSA, SOW, SLA, NDA, License, Amendment",
  "effectiveDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null"
}

Contract text:
---
${truncated}
---

If you cannot determine a value, use null. For contractType, infer from content (e.g. Master Service Agreement -> MSA).`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") return null;

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const contractType = parsed.contractType;
    const validType =
      typeof contractType === "string" && CONTRACT_TYPES.includes(contractType as ContractType)
        ? (contractType as ContractType)
        : null;

    return {
      contractName:
        typeof parsed.contractName === "string" && parsed.contractName.trim()
          ? parsed.contractName.trim().slice(0, 200)
          : null,
      supplierName:
        typeof parsed.supplierName === "string" && parsed.supplierName.trim()
          ? parsed.supplierName.trim().slice(0, 100)
          : null,
      contractType: validType,
      effectiveDate:
        typeof parsed.effectiveDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.effectiveDate)
          ? parsed.effectiveDate
          : null,
      expiryDate:
        typeof parsed.expiryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.expiryDate)
          ? parsed.expiryDate
          : null,
    };
  } catch {
    return null;
  }
}

/**
 * Merge LLM result with heuristic fallbacks. Prefer LLM when it has a value.
 */
function mergeResults(
  heuristic: ExtractedMetadata,
  llm: ExtractedMetadata | null,
  filename: string
): ExtractedMetadata {
  if (!llm)
    return {
      ...heuristic,
      contractName: heuristic.contractName || filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    };

  return {
    contractName: llm.contractName ?? heuristic.contractName ?? filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    supplierName: llm.supplierName ?? heuristic.supplierName,
    contractType: llm.contractType ?? heuristic.contractType ?? "MSA",
    effectiveDate: llm.effectiveDate ?? heuristic.effectiveDate,
    expiryDate: llm.expiryDate ?? heuristic.expiryDate,
  };
}

/**
 * Extract metadata from contract text. Tries LLM first when API key is set, then heuristics.
 */
export async function extractMetadata(
  text: string,
  filename: string
): Promise<ExtractedMetadata> {
  const heuristic = extractWithHeuristics(text, filename);
  const llm = await extractWithLlm(text, filename);
  return mergeResults(heuristic, llm, filename);
}
