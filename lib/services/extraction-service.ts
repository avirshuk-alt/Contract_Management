/**
 * MVP extraction pipeline: extract text from PDF, derive basic fields.
 * Structured for future LLM integration.
 */

import { prisma } from "@/lib/db";
import type { ContractVersion } from "@prisma/client";

async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return { text: result.text, numPages: result.total };
}

function deriveFieldsFromText(text: string): {
  effectiveDate?: string;
  expiryDate?: string;
  paymentTerms?: string;
  renewalTerms?: string;
  terminationNoticeDays?: number;
} {
  const result: ReturnType<typeof deriveFieldsFromText> = {};

  // Match dates like 2024-01-15, Jan 15 2024, January 15, 2024
  const isoDateRegex = /\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g;
  const usDateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/gi;
  const dates: string[] = [];

  let m;
  while ((m = isoDateRegex.exec(text)) !== null) {
    dates.push(`${m[1]}-${m[2]}-${m[3]}`);
  }
  const usText = text;
  let usMatch;
  const usRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/gi;
  while ((usMatch = usRegex.exec(usText)) !== null) {
    const monthMap: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const month = usMatch[0].slice(0, 3).toLowerCase();
    const day = usMatch[1].padStart(2, "0");
    const year = usMatch[2];
    dates.push(`${year}-${monthMap[month] || "01"}-${day}`);
  }

  if (dates.length >= 2) {
    dates.sort();
    result.effectiveDate = dates[0];
    result.expiryDate = dates[dates.length - 1];
  } else if (dates.length === 1) {
    result.effectiveDate = dates[0];
  }

  // Payment terms
  if (/\bNet\s*(\d+)\b/i.test(text)) {
    const netMatch = text.match(/\bNet\s*(\d+)\b/i);
    if (netMatch) result.paymentTerms = `Net ${netMatch[1]}`;
  }
  if (/\bpayment\s+terms?\s*[:\-]?\s*(\w+(?:\s+\w+)?)/i.test(text)) {
    const pmMatch = text.match(/\bpayment\s+terms?\s*[:\-]?\s*([^\n.]+?)(?:\.|$)/i);
    if (pmMatch) result.paymentTerms = result.paymentTerms ?? pmMatch[1].trim().slice(0, 50);
  }

  // Renewal / termination
  if (/\b(\d+)\s*days?\s*(?:written\s+)?notice\b/i.test(text)) {
    const noticeMatch = text.match(/\b(\d+)\s*days?\s*(?:written\s+)?notice\b/i);
    if (noticeMatch) result.terminationNoticeDays = parseInt(noticeMatch[1], 10);
  }
  if (/\bauto[- ]?renew/i.test(text)) {
    result.renewalTerms = "Auto-renewal unless terminated with notice";
  }

  return result;
}

function extractClausesHeuristic(text: string): Array<{
  name: string;
  category: string;
  extractedText: string;
  interpretation: string;
  riskNotes: string;
  pageRef: string;
}> {
  const clauses: Array<{
    name: string;
    category: string;
    extractedText: string;
    interpretation: string;
    riskNotes: string;
    pageRef: string;
  }> = [];

  const sectionPatterns = [
    { name: "Payment Terms", category: "Financial", regex: /(?:payment\s+terms?|invoic(?:e|ing))[:\s]+([^\n]{50,300})/gi },
    { name: "Term & Termination", category: "Duration", regex: /(?:term(?:ination)?|duration)[:\s]+([^\n]{50,300})/gi },
    { name: "Confidentiality", category: "Legal", regex: /confidential(?:ity)?[:\s]+([^\n]{50,300})/gi },
    { name: "Liability", category: "Legal", regex: /(?:liability|limitation\s+of\s+damages)[:\s]+([^\n]{50,300})/gi },
    { name: "Compliance", category: "Legal", regex: /complian(?:ce)?[:\s]+([^\n]{50,300})/gi },
  ];

  for (const { name, category, regex } of sectionPatterns) {
    const match = text.match(regex);
    if (match) {
      const extractedText = match[0].slice(0, 500).trim();
      clauses.push({
        name,
        category,
        extractedText,
        interpretation: `Extracted from contract. Review for full context.`,
        riskNotes: "Automated extraction - manual review recommended.",
        pageRef: "See document",
      });
    }
  }

  if (clauses.length === 0) {
    clauses.push({
      name: "General Terms",
      category: "General",
      extractedText: text.slice(0, 500),
      interpretation: "Full text extraction. Consider manual clause identification.",
      riskNotes: "No structured clauses detected.",
      pageRef: "See document",
    });
  }

  return clauses;
}

function extractObligationsHeuristic(text: string): Array<{
  obligation: string;
  owner: "Supplier" | "Client" | "Both";
  dueDate: string | null;
  status: "pending" | "completed" | "overdue" | "at-risk";
}> {
  const obligations: Array<{
    obligation: string;
    owner: "Supplier" | "Client" | "Both";
    dueDate: string | null;
    status: "pending" | "completed" | "overdue" | "at-risk";
  }> = [];

  const obligationKeywords = [
    "shall provide", "shall deliver", "shall submit", "shall maintain",
    "must provide", "must deliver", "agree to", "responsible for",
    "obligation to", "required to", "shall notify", "shall pay",
  ];

  const sentences = text.split(/[.!?]\s+/);
  for (const sent of sentences) {
    const lower = sent.toLowerCase();
    if (obligationKeywords.some((k) => lower.includes(k)) && sent.length > 30) {
      let owner: "Supplier" | "Client" | "Both" = "Both";
      if (/\b(supplier|vendor|party\s+b)\b/i.test(sent)) owner = "Supplier";
      else if (/\b(client|customer|party\s+a|buyer)\b/i.test(sent)) owner = "Client";

      obligations.push({
        obligation: sent.trim().slice(0, 300),
        owner,
        dueDate: null,
        status: "pending",
      });
    }
  }

  if (obligations.length === 0) {
    obligations.push({
      obligation: "Review contract obligations - automated extraction did not find specific obligations.",
      owner: "Both",
      dueDate: null,
      status: "pending",
    });
  }

  return obligations.slice(0, 10);
}

export async function runExtractionPipeline(versionId: string): Promise<ContractVersion | null> {
  const version = await prisma.contractVersion.findUnique({
    where: { id: versionId },
    include: { document: true },
  });
  if (!version) return null;

  await prisma.contractVersion.update({
    where: { id: versionId },
    data: { processingStatus: "PROCESSING" },
  });

  try {
    const { readFile } = await import("@/lib/storage");
    const buffer = await readFile(version.document.storagePath);
    const { text } = await extractTextFromPdf(buffer);

    const derived = deriveFieldsFromText(text);
    const clauses = extractClausesHeuristic(text);
    const obligations = extractObligationsHeuristic(text);

    await prisma.contractVersion.update({
      where: { id: versionId },
      data: {
        extractedText: text.slice(0, 100_000),
        extractedData: {
          ...derived,
          deliverables: [],
          milestones: [],
          serviceLevels: [],
        },
        processingStatus: "DONE",
      },
    });

    await prisma.clause.deleteMany({ where: { versionId } });
    await prisma.obligation.deleteMany({ where: { versionId } });

    for (let i = 0; i < clauses.length; i++) {
      await prisma.clause.create({
        data: {
          versionId,
          ...clauses[i],
          sortOrder: i,
        },
      });
    }

    for (let i = 0; i < obligations.length; i++) {
      await prisma.obligation.create({
        data: {
          versionId,
          obligation: obligations[i].obligation,
          owner: obligations[i].owner,
          dueDate: obligations[i].dueDate ? new Date(obligations[i].dueDate) : null,
          status: obligations[i].status,
          sortOrder: i,
        },
      });
    }

    return prisma.contractVersion.findUnique({ where: { id: versionId } });
  } catch (err) {
    await prisma.contractVersion.update({
      where: { id: versionId },
      data: { processingStatus: "FAILED" },
    });
    throw err;
  }
}
