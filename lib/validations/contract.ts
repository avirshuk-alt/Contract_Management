import { z } from "zod";

const contractTypeEnum = z.enum(["MSA", "SOW", "SLA", "NDA", "License", "Amendment"]);
const statusEnum = z.enum(["active", "expiring", "expired", "draft", "under_review", "under-review"]);
const riskLevelEnum = z.enum(["low", "medium", "high", "critical"]);

export const createContractSchema = z.object({
  contractName: z.string().min(1).max(500),
  supplierId: z.string().optional(),
  supplierName: z.string().min(1).max(200),
  contractType: contractTypeEnum,
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().min(0).default(0),
  tags: z.array(z.string()).optional().default([]),
});

export const updateContractSchema = z.object({
  status: statusEnum.optional(),
  riskScore: z.number().min(0).max(100).optional(),
  riskLevel: riskLevelEnum.optional(),
  value: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  contractName: z.string().min(1).max(500).optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const listContractsSchema = z.object({
  search: z.string().optional(),
  contractType: contractTypeEnum.optional(),
  status: statusEnum.optional(),
  riskLevel: riskLevelEnum.optional(),
  sortBy: z.enum(["supplierName", "contractName", "expiryDate", "uploadedAt", "riskScore"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ListContractsInput = z.infer<typeof listContractsSchema>;
