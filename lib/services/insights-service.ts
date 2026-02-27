/**
 * Generate ContractInsights from contract + extracted data.
 * Mirrors mock-llm generateInsights for UI compatibility.
 */

export interface ContractInsights {
  riskScore: number;
  riskByCategory: Record<string, number>;
  nonStandardTerms: Array<{ term: string; explanation: string; risk: "low" | "medium" | "high" }>;
  negotiationSuggestions: string[];
  aiHighlights: string[];
}

interface TermsLike {
  paymentTerms?: string;
  renewalTerms?: string;
  terminationNoticeDays?: number;
  invoiceCadence?: string;
  obligations?: Array<{ status: string }>;
}

export function generateInsightsFromTerms(
  riskScore: number,
  terms: TermsLike
): ContractInsights {
  const riskByCategory: Record<string, number> = {
    "Payment Terms": terms.paymentTerms === "Net 180" ? 85 : terms.paymentTerms === "Net 45" ? 25 : 40,
    Termination: (terms.terminationNoticeDays ?? 0) >= 90 ? 45 : 20,
    "Service Levels": 35,
    Liability: 40,
    Compliance: 25,
    Renewal: terms.renewalTerms?.includes("Auto-renewal") ? 55 : 30,
  };

  const nonStandardTerms: ContractInsights["nonStandardTerms"] = [];
  if (terms.paymentTerms === "Net 180") {
    nonStandardTerms.push({
      term: "Extended Payment Terms (Net 180)",
      explanation: "Payment terms significantly exceed industry standard.",
      risk: "high",
    });
  }
  if ((terms.terminationNoticeDays ?? 0) >= 90) {
    nonStandardTerms.push({
      term: "Extended Termination Notice (90+ days)",
      explanation: "Long termination notice period reduces flexibility.",
      risk: "medium",
    });
  }

  const suggestions: string[] = [];
  if (terms.paymentTerms === "Net 180") {
    suggestions.push("Negotiate payment terms reduction to Net 60");
  }
  suggestions.push("Consider performance-based pricing adjustments");

  const overdueCount = terms.obligations?.filter(
    (o) => o.status === "overdue" || o.status === "at-risk"
  ).length ?? 0;
  const highlights: string[] = [];
  if (riskScore >= 55) highlights.push("Elevated risk - review non-standard terms");
  if (overdueCount > 0) highlights.push(`${overdueCount} obligation(s) require attention`);

  return {
    riskScore,
    riskByCategory,
    nonStandardTerms,
    negotiationSuggestions: suggestions,
    aiHighlights: highlights.length > 0 ? highlights : ["Contract analysis complete"],
  };
}
