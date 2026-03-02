/**
 * Shared types for contract records (API responses and UI).
 */

export interface ContractRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  contractName: string;
  contractType: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  value: number;
  uploadedAt: string;
  lastAnalyzedAt: string | null;
  tags?: string[];
}
