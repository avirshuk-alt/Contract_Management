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

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(value: number): string {
  if (value === 0) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper to determine risk level from score
function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

// No demo data — use API/DB only. Empty arrays for type-safe imports.
export const contracts: Contract[] = [];
export const suppliers: Supplier[] = [];

// Dashboard KPIs (empty when no data)
export function getDashboardKPIs() {
  return {
    activeContracts: 0,
    expiringIn90Days: 0,
    highRiskClauses: 0,
    openObligations: 0,
  };
}

// Get contracts expiring soon (empty when no data)
export function getExpiringContracts(_days: number = 90): Contract[] {
  return [];
}

// Get high risk contracts (empty when no data)
export function getHighRiskContracts(): Contract[] {
  return [];
}

// Get recent uploads (empty when no data)
export function getRecentUploads(limit: number = 5): Contract[] {
  return [];
}

// AI Highlights (empty when no data)
export function getAIHighlights(): string[] {
  return [];
}

// Activity Log (no demo entries)
export const activityLog: ActivityLogItem[] = [];

// Contract type options for filters
export const contractTypes: ContractType[] = ["MSA", "SOW", "SLA", "NDA", "License", "Amendment"];

// Status options for filters
export const statusOptions: ContractStatus[] = ["active", "expiring", "expired", "draft", "under-review"];

// Risk level options for filters
export const riskLevels: RiskLevel[] = ["low", "medium", "high", "critical"];
