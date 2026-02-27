// Mock LLM/Agent Layer
// This file contains deterministic mock functions that return realistic structured outputs.
// Easy to swap to a real API later by replacing these implementations.

export interface ContractTerms {
  supplierName: string;
  contractType: string;
  contractName: string;
  effectiveDate: string;
  endDate: string;
  renewalTerms: string;
  paymentTerms: string;
  invoiceCadence: string;
  terminationNoticeDays: number;
  deliverables: string[];
  milestones: Milestone[];
  serviceLevels: ServiceLevel[];
  obligations: Obligation[];
}

export interface Milestone {
  name: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
}

export interface ServiceLevel {
  metric: string;
  target: string;
  penalty: string;
}

export interface Obligation {
  id: string;
  obligation: string;
  owner: "Supplier" | "Client" | "Both";
  dueDate: string;
  status: "pending" | "completed" | "overdue" | "at-risk";
  evidenceLink?: string;
}

export interface ContractInsights {
  riskScore: number;
  riskByCategory: Record<string, number>;
  nonStandardTerms: NonStandardTerm[];
  negotiationSuggestions: string[];
  aiHighlights: string[];
}

export interface NonStandardTerm {
  term: string;
  explanation: string;
  risk: "low" | "medium" | "high";
}

export interface Clause {
  id: string;
  name: string;
  category: string;
  extractedText: string;
  interpretation: string;
  riskNotes: string;
  pageRef: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export interface Citation {
  page: string;
  section: string;
  text: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
}

// Mock extraction function - returns structured contract terms
export function extractContractTerms(contractId: string): ContractTerms {
  // This would normally call an LLM to extract from PDF
  const mockTerms: Record<string, ContractTerms> = {
    "contract-1": {
      supplierName: "Apex Supply Co.",
      contractType: "Master Service Agreement",
      contractName: "IT Infrastructure Support",
      effectiveDate: "2024-01-15",
      endDate: "2027-01-14",
      renewalTerms: "Auto-renewal for 1-year terms unless 90 days written notice",
      paymentTerms: "Net 45",
      invoiceCadence: "Monthly",
      terminationNoticeDays: 90,
      deliverables: [
        "24/7 Help Desk Support",
        "Network Monitoring",
        "Quarterly Security Audits",
        "Annual Infrastructure Review"
      ],
      milestones: [
        { name: "Q1 Security Audit", dueDate: "2025-03-31", status: "completed" },
        { name: "Q2 Security Audit", dueDate: "2025-06-30", status: "pending" },
        { name: "Annual Review", dueDate: "2025-12-15", status: "pending" }
      ],
      serviceLevels: [
        { metric: "Uptime", target: "99.9%", penalty: "5% credit per 0.1% below target" },
        { metric: "Response Time (Critical)", target: "< 15 minutes", penalty: "2% credit per incident" },
        { metric: "Resolution Time", target: "< 4 hours", penalty: "1% credit per hour delayed" }
      ],
      obligations: [
        { id: "obl-1", obligation: "Monthly performance report submission", owner: "Supplier", dueDate: "2025-03-05", status: "pending" },
        { id: "obl-2", obligation: "Quarterly business review meeting", owner: "Both", dueDate: "2025-03-31", status: "pending" },
        { id: "obl-3", obligation: "Annual insurance certificate renewal", owner: "Supplier", dueDate: "2025-01-15", status: "completed", evidenceLink: "/evidence/cert-2025.pdf" }
      ]
    },
    "contract-2": {
      supplierName: "GlobalTech Partners",
      contractType: "Statement of Work",
      contractName: "VMI & Inventory Services",
      effectiveDate: "2024-06-01",
      endDate: "2028-03-31",
      renewalTerms: "Subject to mutual agreement, 120 days advance discussion required",
      paymentTerms: "Net 180",
      invoiceCadence: "Weekly",
      terminationNoticeDays: 90,
      deliverables: [
        "Vendor Managed Inventory Services",
        "Semi-annual Inventory Optimization Reviews",
        "Real-time Stock Level Dashboard",
        "Annual Business Review"
      ],
      milestones: [
        { name: "H1 Inventory Review", dueDate: "2025-06-30", status: "pending" },
        { name: "H2 Inventory Review", dueDate: "2025-12-31", status: "pending" },
        { name: "Annual Business Review", dueDate: "2025-09-15", status: "pending" }
      ],
      serviceLevels: [
        { metric: "Stock Accuracy", target: "99.5%", penalty: "3% invoice reduction per 0.5% variance" },
        { metric: "Fill Rate", target: "98%", penalty: "2% credit per percentage point below" },
        { metric: "Delivery On-Time", target: "95%", penalty: "1.5% credit per percentage point below" }
      ],
      obligations: [
        { id: "obl-4", obligation: "Weekly inventory reconciliation report", owner: "Supplier", dueDate: "2025-02-28", status: "overdue" },
        { id: "obl-5", obligation: "Quarterly demand forecast submission", owner: "Client", dueDate: "2025-03-15", status: "at-risk" },
        { id: "obl-6", obligation: "Insurance documentation update", owner: "Supplier", dueDate: "2025-06-01", status: "pending" }
      ]
    },
    "contract-3": {
      supplierName: "SecureCloud Inc.",
      contractType: "Software License Agreement",
      contractName: "Enterprise Cloud Platform",
      effectiveDate: "2023-09-01",
      endDate: "2025-08-31",
      renewalTerms: "Annual renewal with 60 days notice, 5% price increase cap",
      paymentTerms: "Net 30",
      invoiceCadence: "Annual (prepaid)",
      terminationNoticeDays: 60,
      deliverables: [
        "Enterprise Cloud Platform License (500 seats)",
        "Premium Support Package",
        "Quarterly Feature Updates",
        "Security Compliance Certifications"
      ],
      milestones: [
        { name: "SOC 2 Audit Report", dueDate: "2025-03-15", status: "pending" },
        { name: "Annual License Review", dueDate: "2025-07-01", status: "pending" }
      ],
      serviceLevels: [
        { metric: "Platform Availability", target: "99.95%", penalty: "Service credits per SLA table" },
        { metric: "Support Response (P1)", target: "< 30 minutes", penalty: "Escalation to exec sponsor" }
      ],
      obligations: [
        { id: "obl-7", obligation: "Renewal decision communication", owner: "Client", dueDate: "2025-06-30", status: "pending" },
        { id: "obl-8", obligation: "Usage audit compliance", owner: "Both", dueDate: "2025-05-15", status: "pending" }
      ]
    }
  };
  
  return mockTerms[contractId] || mockTerms["contract-1"];
}

// Mock insights generation
export function generateInsights(terms: ContractTerms): ContractInsights {
  const riskScore = calculateRiskScore(terms);
  
  return {
    riskScore,
    riskByCategory: {
      "Payment Terms": terms.paymentTerms === "Net 180" ? 85 : terms.paymentTerms === "Net 45" ? 25 : 40,
      "Termination": terms.terminationNoticeDays >= 90 ? 45 : 20,
      "Service Levels": 35,
      "Liability": 40,
      "Compliance": 25,
      "Renewal": terms.renewalTerms.includes("Auto-renewal") ? 55 : 30
    },
    nonStandardTerms: generateNonStandardTerms(terms),
    negotiationSuggestions: generateNegotiationSuggestions(terms),
    aiHighlights: generateAIHighlights(terms)
  };
}

function calculateRiskScore(terms: ContractTerms): number {
  let score = 30; // Base score
  
  if (terms.paymentTerms === "Net 180") score += 25;
  else if (terms.paymentTerms === "Net 45") score += 5;
  else if (terms.paymentTerms === "Net 30") score += 0;
  
  if (terms.terminationNoticeDays >= 90) score += 10;
  if (terms.invoiceCadence === "Weekly") score += 5;
  if (terms.renewalTerms.includes("Auto-renewal")) score += 10;
  
  const overdueObligations = terms.obligations.filter(o => o.status === "overdue" || o.status === "at-risk").length;
  score += overdueObligations * 8;
  
  return Math.min(score, 100);
}

function generateNonStandardTerms(terms: ContractTerms): NonStandardTerm[] {
  const nonStandard: NonStandardTerm[] = [];
  
  if (terms.paymentTerms === "Net 180") {
    nonStandard.push({
      term: "Extended Payment Terms (Net 180)",
      explanation: "Payment terms significantly exceed industry standard of Net 30-60. This creates cash flow risk and may indicate supplier leverage.",
      risk: "high"
    });
  }
  
  if (terms.invoiceCadence === "Weekly") {
    nonStandard.push({
      term: "Weekly Invoicing Cadence",
      explanation: "Weekly invoicing is unusual and increases administrative overhead. Consider negotiating to monthly invoicing.",
      risk: "medium"
    });
  }
  
  if (terms.renewalTerms.includes("Auto-renewal")) {
    nonStandard.push({
      term: "Auto-Renewal Clause",
      explanation: "Contract automatically renews without explicit action. Set calendar reminders to evaluate before the notice period.",
      risk: "medium"
    });
  }
  
  if (terms.terminationNoticeDays >= 90) {
    nonStandard.push({
      term: "Extended Termination Notice (90+ days)",
      explanation: "Long termination notice period reduces flexibility. Standard is 30-60 days for most service agreements.",
      risk: "medium"
    });
  }
  
  return nonStandard;
}

function generateNegotiationSuggestions(terms: ContractTerms): string[] {
  const suggestions: string[] = [];
  
  if (terms.paymentTerms === "Net 180") {
    suggestions.push("Negotiate payment terms reduction to Net 60 with early payment discount incentive (e.g., 2% discount for Net 30)");
  }
  
  if (terms.invoiceCadence === "Weekly") {
    suggestions.push("Propose consolidating to monthly invoicing to reduce processing overhead");
  }
  
  if (terms.renewalTerms.includes("Auto-renewal")) {
    suggestions.push("Request removal of auto-renewal or extend notice period to 120 days");
  }
  
  if (terms.terminationNoticeDays >= 90) {
    suggestions.push("Seek reduction in termination notice to 60 days or add termination for convenience clause");
  }
  
  suggestions.push("Consider adding performance-based pricing adjustments tied to SLA achievement");
  suggestions.push("Request audit rights expansion to include subcontractor compliance verification");
  
  return suggestions;
}

function generateAIHighlights(terms: ContractTerms): string[] {
  const highlights: string[] = [];
  
  const endDate = new Date(terms.endDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 90) {
    highlights.push(`Contract expires in ${daysUntilExpiry} days - renewal action required`);
  }
  
  const overdueObligations = terms.obligations.filter(o => o.status === "overdue").length;
  const atRiskObligations = terms.obligations.filter(o => o.status === "at-risk").length;
  
  if (overdueObligations > 0) {
    highlights.push(`${overdueObligations} overdue obligation(s) require immediate attention`);
  }
  
  if (atRiskObligations > 0) {
    highlights.push(`${atRiskObligations} obligation(s) at risk of becoming overdue`);
  }
  
  if (terms.paymentTerms === "Net 180") {
    highlights.push("Unusually long payment terms detected - review cash flow impact");
  }
  
  highlights.push(`${terms.serviceLevels.length} SLAs tracked with penalty clauses`);
  
  return highlights;
}

// Mock clause extraction
export function extractClauses(contractId: string): Clause[] {
  return [
    {
      id: "clause-1",
      name: "Payment Terms",
      category: "Financial",
      extractedText: "All invoices shall be paid within the agreed payment period from date of receipt. Late payments shall accrue interest at 1.5% per month.",
      interpretation: "Standard payment clause with late payment penalties. Interest rate is slightly above market average.",
      riskNotes: "Ensure AP processes are aligned to avoid late payment interest charges.",
      pageRef: "p.12 Section 5.2"
    },
    {
      id: "clause-2",
      name: "Term & Termination",
      category: "Duration",
      extractedText: "This Agreement shall commence on the Effective Date and continue for the Initial Term. Either party may terminate with written notice as specified herein.",
      interpretation: "Clear termination provisions with specified notice periods. Exit costs may apply for early termination.",
      riskNotes: "Mark calendar for termination notice deadline. Review exit cost provisions before any termination action.",
      pageRef: "p.8 Section 3.1"
    },
    {
      id: "clause-3",
      name: "Deliverables",
      category: "Scope",
      extractedText: "Supplier shall provide the services and deliverables as described in Schedule A, meeting all specifications and quality standards defined therein.",
      interpretation: "Services are well-defined in schedule. Changes require formal change order process.",
      riskNotes: "Ensure Schedule A is comprehensive. Any scope gaps could lead to disputes or additional costs.",
      pageRef: "p.15 Section 6.1"
    },
    {
      id: "clause-4",
      name: "Service Level Agreement",
      category: "Performance",
      extractedText: "Supplier commits to meeting the service levels defined in Schedule B. Failure to meet SLAs shall result in service credits as specified.",
      interpretation: "SLAs are tied to service credits rather than termination rights. Credits may not fully compensate for business impact.",
      riskNotes: "Monitor SLA performance monthly. Consider negotiating termination rights for repeated SLA breaches.",
      pageRef: "p.18 Section 7.3"
    },
    {
      id: "clause-5",
      name: "Confidentiality",
      category: "Legal",
      extractedText: "Each party shall maintain the confidentiality of the other party's Confidential Information and shall not disclose such information without prior written consent.",
      interpretation: "Mutual confidentiality obligations with standard carve-outs for legal requirements.",
      riskNotes: "Ensure data handling procedures comply with these obligations. Review before any third-party sharing.",
      pageRef: "p.22 Section 9.1"
    },
    {
      id: "clause-6",
      name: "Change Control",
      category: "Governance",
      extractedText: "Any changes to the scope, schedule, or pricing shall be documented through a formal Change Order signed by authorized representatives of both parties.",
      interpretation: "Formal change management process required. No verbal or email modifications are binding.",
      riskNotes: "Maintain change order log. Ensure all scope changes are properly documented before work begins.",
      pageRef: "p.25 Section 10.2"
    },
    {
      id: "clause-7",
      name: "Compliance",
      category: "Legal",
      extractedText: "Supplier shall comply with all applicable laws, regulations, and industry standards, including but not limited to data protection and security requirements.",
      interpretation: "Broad compliance requirement places significant burden on supplier. Includes GDPR, SOC 2, etc.",
      riskNotes: "Request annual compliance certifications. Include right to audit in future negotiations.",
      pageRef: "p.28 Section 11.1"
    },
    {
      id: "clause-8",
      name: "Liability",
      category: "Legal",
      extractedText: "Neither party shall be liable for indirect, consequential, or punitive damages. Total liability shall not exceed the fees paid in the preceding 12 months.",
      interpretation: "Standard liability cap at 12 months of fees. Excludes indirect damages which may limit recovery options.",
      riskNotes: "Consider negotiating higher cap for critical services. Ensure adequate insurance coverage.",
      pageRef: "p.30 Section 12.4"
    },
    {
      id: "clause-9",
      name: "Pricing",
      category: "Financial",
      extractedText: "Fees shall be as set forth in Schedule C. Annual price adjustments shall not exceed the greater of 3% or CPI increase.",
      interpretation: "Price escalation is capped, providing budget predictability. CPI clause adds inflation protection.",
      riskNotes: "Track CPI trends. Budget for maximum allowed increase in financial planning.",
      pageRef: "p.10 Section 4.1"
    }
  ];
}

// Mock chat function
export function chatWithContract(question: string, terms: ContractTerms, clauses: Clause[]): ChatResponse {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes("terminate") || questionLower.includes("termination") || questionLower.includes("exit")) {
    return {
      answer: `This contract requires ${terms.terminationNoticeDays} days written notice for termination. The termination clause specifies that either party may terminate with proper notice. Review Section 3.1 for complete termination provisions and any applicable exit costs.`,
      citations: [
        { page: "p.8", section: "Section 3.1", text: "Term & Termination provisions" }
      ]
    };
  }
  
  if (questionLower.includes("payment") || questionLower.includes("pay") || questionLower.includes("invoice")) {
    return {
      answer: `Payment terms are ${terms.paymentTerms} from invoice date. Invoices are issued on a ${terms.invoiceCadence.toLowerCase()} basis. Late payments accrue interest at 1.5% per month as specified in the payment clause.`,
      citations: [
        { page: "p.12", section: "Section 5.2", text: "Payment Terms" },
        { page: "p.10", section: "Section 4.1", text: "Pricing and Invoicing" }
      ]
    };
  }
  
  if (questionLower.includes("renew") || questionLower.includes("renewal")) {
    return {
      answer: `Renewal terms: ${terms.renewalTerms}. The contract end date is ${terms.endDate}. Ensure to mark your calendar for the required notice period before making renewal decisions.`,
      citations: [
        { page: "p.8", section: "Section 3.2", text: "Renewal provisions" }
      ]
    };
  }
  
  if (questionLower.includes("sla") || questionLower.includes("service level") || questionLower.includes("performance")) {
    const slaText = terms.serviceLevels.map(s => `${s.metric}: ${s.target}`).join("; ");
    return {
      answer: `The contract includes ${terms.serviceLevels.length} service level commitments: ${slaText}. Each SLA has associated penalty clauses for non-compliance. Service credits are the primary remedy for SLA breaches.`,
      citations: [
        { page: "p.18", section: "Section 7.3", text: "Service Level Agreement" },
        { page: "Schedule B", section: "SLA Matrix", text: "Detailed SLA definitions" }
      ]
    };
  }
  
  if (questionLower.includes("liability") || questionLower.includes("damages")) {
    return {
      answer: "Liability is capped at fees paid in the preceding 12 months. Neither party is liable for indirect, consequential, or punitive damages. This is a standard liability structure but may limit recovery in case of significant service failures.",
      citations: [
        { page: "p.30", section: "Section 12.4", text: "Limitation of Liability" }
      ]
    };
  }
  
  // Default response
  return {
    answer: "Based on my analysis of the contract, I can help you understand specific terms, obligations, and risks. Try asking about payment terms, termination provisions, SLAs, renewal terms, or liability clauses for detailed information.",
    citations: []
  };
}

// Mock email drafting
export function agentDraftEmail(type: "renewal" | "obligation-followup" | "general", context: Record<string, string>): EmailDraft {
  if (type === "renewal") {
    return {
      subject: `Contract Renewal Discussion - ${context.contractName || "Service Agreement"}`,
      body: `Dear ${context.supplierName || "Partner"} Team,

I hope this message finds you well. As we approach the renewal period for our ${context.contractName || "service agreement"}, I wanted to initiate discussions regarding the continuation of our partnership.

Our current agreement is set to ${context.endDate ? `expire on ${context.endDate}` : "expire soon"}, and we would like to explore renewal options that address the following:

1. **Pricing Review**: Given our ongoing partnership, we would like to discuss potential volume-based adjustments or loyalty considerations.

2. **Service Enhancements**: We have identified opportunities to expand our collaboration in the following areas: ${context.enhancements || "[specific areas]"}.

3. **Terms Optimization**: Based on our experience, we would like to discuss adjustments to ${context.termsFocus || "payment terms and SLA structures"}.

Please let us know your availability for a call next week to discuss these points in detail. We value our partnership and look forward to continuing our collaboration.

Best regards,
[Your Name]
[Your Title]`
    };
  }
  
  if (type === "obligation-followup") {
    return {
      subject: `Action Required: ${context.obligation || "Outstanding Obligation"} - Due ${context.dueDate || "Soon"}`,
      body: `Dear ${context.supplierName || "Partner"} Team,

I am writing to follow up on an outstanding contractual obligation that requires your attention.

**Obligation**: ${context.obligation || "[Obligation description]"}
**Due Date**: ${context.dueDate || "[Due date]"}
**Status**: ${context.status || "Pending"}

As per our agreement, this deliverable is ${context.status === "overdue" ? "now overdue" : "approaching its due date"}. Please provide:

1. Current status update on this obligation
2. Expected completion/delivery date
3. Any supporting documentation or evidence of progress

If there are any challenges preventing timely completion, please let us know so we can discuss potential solutions together.

We appreciate your prompt attention to this matter.

Best regards,
[Your Name]
[Your Title]`
    };
  }
  
  return {
    subject: "Contract Inquiry",
    body: "Dear Team,\n\nI am writing regarding our current agreement...\n\nBest regards"
  };
}

// Contract comparison
export interface ContractComparison {
  termChanges: TermChange[];
  clauseDeltas: ClauseDelta[];
  riskImpact: RiskImpact;
}

export interface TermChange {
  term: string;
  contractA: string;
  contractB: string;
  impact: "favorable" | "neutral" | "unfavorable";
}

export interface ClauseDelta {
  clauseName: string;
  changeType: "added" | "removed" | "modified";
  description: string;
}

export interface RiskImpact {
  overallChange: "increased" | "decreased" | "unchanged";
  scoreChange: number;
  summary: string;
}

export function compareContracts(contractAId: string, contractBId: string): ContractComparison {
  const termsA = extractContractTerms(contractAId);
  const termsB = extractContractTerms(contractBId);
  
  const termChanges: TermChange[] = [
    {
      term: "Payment Terms",
      contractA: termsA.paymentTerms,
      contractB: termsB.paymentTerms,
      impact: termsA.paymentTerms === "Net 30" && termsB.paymentTerms === "Net 180" ? "unfavorable" : 
              termsA.paymentTerms === "Net 180" && termsB.paymentTerms === "Net 30" ? "favorable" : "neutral"
    },
    {
      term: "Termination Notice",
      contractA: `${termsA.terminationNoticeDays} days`,
      contractB: `${termsB.terminationNoticeDays} days`,
      impact: termsA.terminationNoticeDays > termsB.terminationNoticeDays ? "favorable" : 
              termsA.terminationNoticeDays < termsB.terminationNoticeDays ? "unfavorable" : "neutral"
    },
    {
      term: "Invoice Cadence",
      contractA: termsA.invoiceCadence,
      contractB: termsB.invoiceCadence,
      impact: "neutral"
    },
    {
      term: "Contract Duration",
      contractA: `${termsA.effectiveDate} to ${termsA.endDate}`,
      contractB: `${termsB.effectiveDate} to ${termsB.endDate}`,
      impact: "neutral"
    }
  ];
  
  const clauseDeltas: ClauseDelta[] = [
    {
      clauseName: "Auto-Renewal",
      changeType: termsA.renewalTerms.includes("Auto-renewal") !== termsB.renewalTerms.includes("Auto-renewal") ? "modified" : "modified",
      description: `Contract A: ${termsA.renewalTerms.includes("Auto-renewal") ? "Includes" : "No"} auto-renewal. Contract B: ${termsB.renewalTerms.includes("Auto-renewal") ? "Includes" : "No"} auto-renewal.`
    },
    {
      clauseName: "SLA Structure",
      changeType: "modified",
      description: `Contract A has ${termsA.serviceLevels.length} SLAs. Contract B has ${termsB.serviceLevels.length} SLAs.`
    }
  ];
  
  const insightsA = generateInsights(termsA);
  const insightsB = generateInsights(termsB);
  const scoreChange = insightsB.riskScore - insightsA.riskScore;
  
  return {
    termChanges,
    clauseDeltas,
    riskImpact: {
      overallChange: scoreChange > 5 ? "increased" : scoreChange < -5 ? "decreased" : "unchanged",
      scoreChange,
      summary: scoreChange > 5 
        ? "Contract B carries higher overall risk due to less favorable terms."
        : scoreChange < -5 
        ? "Contract B has improved risk profile with more favorable terms."
        : "Risk profiles are comparable between the two contracts."
    }
  };
}

// Suggested questions for Ask the Contract
export const suggestedQuestions = [
  "What are the termination provisions and notice requirements?",
  "What are the payment terms and late payment penalties?",
  "How do the SLA commitments work and what are the penalties?",
  "What are the renewal terms and auto-renewal provisions?",
  "What is the liability cap and limitation of damages?"
];
