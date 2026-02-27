// Seed Demo Data for Supplier Contract Management App
// This file contains sample contracts, suppliers, and related data for the demo.

export type ContractStatus = "active" | "expiring" | "expired" | "draft" | "under-review";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ContractType = "MSA" | "SOW" | "SLA" | "NDA" | "License" | "Amendment";

export interface Contract {
  id: string;
  supplierId: string;
  supplierName: string;
  contractName: string;
  contractType: ContractType;
  effectiveDate: string;
  expiryDate: string;
  status: ContractStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  value: number;
  uploadedAt: string;
  lastAnalyzedAt: string;
  pdfUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  industry: string;
  spendEstimate: number;
  contractCount: number;
  riskTrend: "improving" | "stable" | "declining";
  primaryContact: string;
  email: string;
  location: string;
  topObligations: string[];
  events: SupplierEvent[];
}

export interface SupplierEvent {
  id: string;
  type: "contract-signed" | "renewal" | "amendment" | "issue" | "review";
  date: string;
  description: string;
}

export interface ActivityLogItem {
  id: string;
  contractId: string;
  action: "uploaded" | "extracted" | "insights-generated" | "agent-draft" | "reviewed" | "compared";
  timestamp: string;
  details: string;
}

// Parse date string as UTC to avoid timezone issues
function parseDate(dateStr: string): number {
  const parts = dateStr.split(/[-T:Z]/);
  return Date.UTC(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2]),
    parseInt(parts[3] || "0"),
    parseInt(parts[4] || "0"),
    parseInt(parts[5] || "0")
  );
}

function todayUTC(): number {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

// Helper to calculate days until expiry
function daysUntil(date: string): number {
  return Math.ceil((parseDate(date) - todayUTC()) / (1000 * 60 * 60 * 24));
}

export function getDaysUntilExpiration(dateStr: string): number {
  return daysUntil(dateStr);
}

// Helper to determine risk level from score
function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

// Sample Contracts - Based on actual GEHC contracts
export const contracts: Contract[] = [
  {
    id: "contract-1",
    supplierId: "supplier-1",
    supplierName: "Disco Hi-Tec America Inc.",
    contractName: "Capital Equipment Services Extension Agreement",
    contractType: "Amendment",
    effectiveDate: "2025-09-25",
    expiryDate: "2027-03-01",
    status: "active",
    riskScore: 28,
    riskLevel: "low",
    value: 1500000,
    uploadedAt: "2026-01-12T09:00:00Z",
    lastAnalyzedAt: "2026-01-12T09:05:00Z",
    pdfUrl: "/contracts/disco-extension-agreement.pdf"
  },
  {
    id: "contract-2",
    supplierId: "supplier-2",
    supplierName: "W.W. Grainger, Inc.",
    contractName: "MRO Materials Supply Agreement (Duplicate Contract)",
    contractType: "MSA",
    effectiveDate: "2022-11-17",
    expiryDate: "2026-03-31",
    status: "expiring",
    riskScore: 42,
    riskLevel: "medium",
    value: 23917000,
    uploadedAt: "2022-11-20T14:30:00Z",
    lastAnalyzedAt: "2026-01-15T10:00:00Z",
    pdfUrl: "/contracts/grainger-duplicate-contract.pdf"
  },
  {
    id: "contract-3",
    supplierId: "supplier-2",
    supplierName: "W.W. Grainger, Inc.",
    contractName: "Amendment 21 - MRO Supply Agreement",
    contractType: "Amendment",
    effectiveDate: "2024-02-01",
    expiryDate: "2025-03-31",
    status: "expiring",
    riskScore: 55,
    riskLevel: "high",
    value: 23917000,
    uploadedAt: "2024-02-05T10:15:00Z",
    lastAnalyzedAt: "2026-01-15T10:05:00Z",
    pdfUrl: "/contracts/grainger-amendment-21.pdf"
  },
  {
    id: "contract-4",
    supplierId: "supplier-3",
    supplierName: "NuSource",
    contractName: "Supply Agreement (Goods and/or Services)",
    contractType: "MSA",
    effectiveDate: "2023-03-09",
    expiryDate: "2028-03-09",
    status: "active",
    riskScore: 32,
    riskLevel: "low",
    value: 4500000,
    uploadedAt: "2023-03-10T16:00:00Z",
    lastAnalyzedAt: "2026-01-15T10:10:00Z",
    pdfUrl: "/contracts/nusource-supply-agreement.pdf"
  },
  {
    id: "contract-5",
    supplierId: "supplier-4",
    supplierName: "Fastenal Company",
    contractName: "Strategic Supplier Alliance Agreement #102496",
    contractType: "MSA",
    effectiveDate: "2010-03-19",
    expiryDate: "2025-12-31",
    status: "expiring",
    riskScore: 48,
    riskLevel: "medium",
    value: 2000000,
    uploadedAt: "2010-03-22T11:30:00Z",
    lastAnalyzedAt: "2026-01-15T10:15:00Z",
    pdfUrl: "/contracts/fastenal-ssaa-102496.pdf"
  },
  {
    id: "contract-6",
    supplierId: "supplier-4",
    supplierName: "Fastenal Company",
    contractName: "Amendment 6 - SSAA Extension #102496",
    contractType: "Amendment",
    effectiveDate: "2024-03-08",
    expiryDate: "2025-12-31",
    status: "expiring",
    riskScore: 38,
    riskLevel: "medium",
    value: 2000000,
    uploadedAt: "2024-06-24T08:45:00Z",
    lastAnalyzedAt: "2026-01-15T10:20:00Z",
    pdfUrl: "/contracts/fastenal-amendment-6.pdf"
  },
  {
    id: "contract-7",
    supplierId: "supplier-2",
    supplierName: "W.W. Grainger, Inc.",
    contractName: "OSEL Extension Letter 2026",
    contractType: "Amendment",
    effectiveDate: "2026-01-01",
    expiryDate: "2026-03-31",
    status: "expiring",
    riskScore: 62,
    riskLevel: "high",
    value: 23917000,
    uploadedAt: "2026-01-02T13:20:00Z",
    lastAnalyzedAt: "2026-01-15T10:25:00Z",
    pdfUrl: "/contracts/grainger-osel-2026.pdf"
  }
];

// Sample Suppliers - Based on actual GEHC suppliers
export const suppliers: Supplier[] = [
  {
    id: "supplier-1",
    name: "Disco Hi-Tec America Inc.",
    industry: "Capital Equipment Services",
    spendEstimate: 1500000,
    contractCount: 1,
    riskTrend: "stable",
    primaryContact: "Shinji Ueno",
    email: "shinji@discousa.com",
    location: "Santa Clara, CA",
    topObligations: [
      "Capital equipment maintenance per SOW schedule",
      "Quarterly service performance review",
      "Annual insurance certificate renewal",
      "Compliance with GEHC Privacy and Data Protection Appendix"
    ],
    events: [
      { id: "evt-1", type: "contract-signed", date: "2022-03-01", description: "Capital Equipment Services Agreement signed" },
      { id: "evt-2", type: "amendment", date: "2025-09-25", description: "Extension Agreement executed through March 2027" },
      { id: "evt-3", type: "review", date: "2025-12-15", description: "Q4 business review completed" }
    ]
  },
  {
    id: "supplier-2",
    name: "W.W. Grainger, Inc.",
    industry: "MRO Supply & Distribution",
    spendEstimate: 23917000,
    contractCount: 3,
    riskTrend: "stable",
    primaryContact: "Penelope Jones",
    email: "penelope.jones@grainger.com",
    location: "Lake Forest, IL",
    topObligations: [
      "Volume target achievement: $23.9M by March 2025",
      "Quarterly pricing review per Amendment 21",
      "Monthly spend reporting",
      "Compliance with GE HealthCare procurement policies"
    ],
    events: [
      { id: "evt-4", type: "contract-signed", date: "2010-06-01", description: "Original MRO Supply Agreement signed" },
      { id: "evt-5", type: "amendment", date: "2022-11-17", description: "Duplicate Contract for GE Healthcare separation" },
      { id: "evt-6", type: "amendment", date: "2024-02-01", description: "Amendment 21 - Term extended to March 2025" },
      { id: "evt-7", type: "amendment", date: "2026-01-01", description: "OSEL Extension through March 2026" },
      { id: "evt-8", type: "renewal", date: "2026-03-31", description: "Contract renewal decision due" }
    ]
  },
  {
    id: "supplier-3",
    name: "NuSource",
    industry: "Industrial Supply",
    spendEstimate: 4500000,
    contractCount: 1,
    riskTrend: "improving",
    primaryContact: "Project Manager",
    email: "gehc.support@nusource.com",
    location: "Phoenix, AZ",
    topObligations: [
      "Services per Statement of Work specifications",
      "24-month warranty on Deliverables",
      "Monthly performance reporting",
      "Compliance with GEHC Integrity Guide"
    ],
    events: [
      { id: "evt-9", type: "contract-signed", date: "2023-03-09", description: "Supply Agreement executed - 5 year term" },
      { id: "evt-10", type: "review", date: "2025-09-01", description: "Annual business review completed" }
    ]
  },
  {
    id: "supplier-4",
    name: "Fastenal Company",
    industry: "Industrial Fasteners & MRO",
    spendEstimate: 2000000,
    contractCount: 2,
    riskTrend: "stable",
    primaryContact: "Bill Reichenbacher",
    email: "sales@fastenal.com",
    location: "Winona, MN",
    topObligations: [
      "Annual deflation targets per SSAA",
      "Global inventory management",
      "Quarterly Obsolete Products notification",
      "Compliance with GEHC PMQR requirements"
    ],
    events: [
      { id: "evt-11", type: "contract-signed", date: "2010-03-19", description: "Strategic Supplier Alliance Agreement #102496 signed" },
      { id: "evt-12", type: "amendment", date: "2024-06-24", description: "Amendment 6 - Extended to December 2025" },
      { id: "evt-13", type: "renewal", date: "2025-12-31", description: "Contract renewal decision due" }
    ]
  }
];

// Dashboard KPIs
export function getDashboardKPIs() {
  const today = todayUTC();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const activeContracts = contracts.filter(c => c.status === "active" || c.status === "expiring").length;
  const expiringIn90Days = contracts.filter(c => {
    const expiry = parseDate(c.expiryDate);
    return expiry <= today + ninetyDaysMs && expiry > today;
  }).length;
  const highRiskClauses = contracts.filter(c => c.riskLevel === "high" || c.riskLevel === "critical").length;
  const openObligations = 8;

  return {
    activeContracts,
    expiringIn90Days,
    highRiskClauses,
    openObligations
  };
}

// Get contracts expiring soon
export function getExpiringContracts(days: number = 90): Contract[] {
  const today = todayUTC();
  const rangeMs = days * 24 * 60 * 60 * 1000;

  return contracts
    .filter(c => {
      const expiry = parseDate(c.expiryDate);
      return expiry <= today + rangeMs && expiry > today;
    })
    .sort((a, b) => parseDate(a.expiryDate) - parseDate(b.expiryDate));
}

// Get high risk contracts
export function getHighRiskContracts(): Contract[] {
  return contracts
    .filter(c => c.riskLevel === "high" || c.riskLevel === "critical")
    .sort((a, b) => b.riskScore - a.riskScore);
}

// Get recent uploads
export function getRecentUploads(limit: number = 5): Contract[] {
  return [...contracts]
    .sort((a, b) => parseDate(b.uploadedAt) - parseDate(a.uploadedAt))
    .slice(0, limit);
}

// AI Highlights of the Week
export function getAIHighlights(): string[] {
  return [
    "Grainger OSEL extension expires March 31, 2026 - renewal negotiations recommended",
    "Fastenal SSAA #102496 expires December 2025 - 4 contracts affected",
    "Grainger aggregate spend: $23.9M volume target tracking",
    "NuSource Supply Agreement on track - expires March 2028",
    "Disco Hi-Tec extension provides coverage through March 2027"
  ];
}

// Activity Log
export const activityLog: ActivityLogItem[] = [
  { id: "act-1", contractId: "contract-7", action: "uploaded", timestamp: "2026-01-02T13:20:00Z", details: "Grainger OSEL Extension Letter 2026 uploaded" },
  { id: "act-2", contractId: "contract-7", action: "extracted", timestamp: "2026-01-02T13:22:00Z", details: "Extension terms extracted - through March 31, 2026" },
  { id: "act-3", contractId: "contract-7", action: "insights-generated", timestamp: "2026-01-02T13:25:00Z", details: "Risk analysis completed - Score: 62/100 (expiring soon)" },
  { id: "act-4", contractId: "contract-1", action: "uploaded", timestamp: "2026-01-12T09:00:00Z", details: "Disco Hi-Tec Extension Agreement uploaded" },
  { id: "act-5", contractId: "contract-1", action: "extracted", timestamp: "2026-01-12T09:02:00Z", details: "Contract terms extracted - Capital Equipment Services" },
  { id: "act-6", contractId: "contract-1", action: "insights-generated", timestamp: "2026-01-12T09:05:00Z", details: "Risk analysis completed - Score: 28/100" },
  { id: "act-7", contractId: "contract-2", action: "agent-draft", timestamp: "2026-01-15T10:00:00Z", details: "Renewal outreach email drafted for Grainger" },
  { id: "act-8", contractId: "contract-5", action: "reviewed", timestamp: "2026-01-20T14:30:00Z", details: "Fastenal SSAA reviewed - expires Dec 2025" }
];

// Contract type options for filters
export const contractTypes: ContractType[] = ["MSA", "SOW", "SLA", "NDA", "License", "Amendment"];

// Status options for filters
export const statusOptions: ContractStatus[] = ["active", "expiring", "expired", "draft", "under-review"];

// Risk level options for filters
export const riskLevels: RiskLevel[] = ["low", "medium", "high", "critical"];
