import { prisma } from "@/lib/db";
import type {
  ContractType,
  ContractStatus,
  RiskLevel,
  ProcessingStatus,
  ActivityAction,
  ObligationOwner,
  ObligationStatus,
} from "@prisma/client";

export interface ContractListFilters {
  search?: string;
  contractType?: ContractType;
  status?: ContractStatus;
  riskLevel?: RiskLevel;
  sortBy?: "supplierName" | "contractName" | "expiryDate" | "uploadedAt" | "riskScore";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ContractListResult {
  contracts: Awaited<ReturnType<typeof getContractList>>["contracts"];
  total: number;
  page: number;
  limit: number;
}

export async function getContractList(filters: ContractListFilters = {}) {
  const {
    search,
    contractType,
    status,
    riskLevel,
    sortBy = "uploadedAt",
    sortOrder = "desc",
    page = 1,
    limit = 50,
  } = filters;

  const where: Record<string, unknown> = {};

  if (search?.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    where.OR = [
      { contractName: { contains: search.trim(), mode: "insensitive" } },
      { supplier: { name: { contains: search.trim(), mode: "insensitive" } } },
    ];
  }
  if (contractType) where.contractType = contractType;
  if (status) where.status = status;
  if (riskLevel) where.riskLevel = riskLevel;

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      include: { supplier: true },
      orderBy: sortBy === "supplierName" ? { supplier: { name: sortOrder } } : { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    contracts: contracts.map((c) => ({
      ...c,
      supplierName: c.supplier.name,
    })),
    total,
    page,
    limit,
  };
}

export async function getContractById(id: string) {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      supplier: true,
      documents: {
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            include: { clauses: true, obligations: true },
          },
        },
      },
    },
  });
  if (!contract) return null;

  const latestDoc = contract.documents[0];
  const latestVersion = latestDoc?.versions[0];

  return {
    ...contract,
    supplierName: contract.supplier.name,
    latestDocument: latestDoc
      ? {
          ...latestDoc,
          latestVersion: latestVersion
            ? {
                ...latestVersion,
                clauses: latestVersion.clauses,
                obligations: latestVersion.obligations,
              }
            : null,
        }
      : null,
  };
}

export async function addActivityEvent(
  contractId: string,
  action: ActivityAction,
  details: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  return prisma.activityEvent.create({
    data: { contractId, userId, action, details, metadata: metadata ?? undefined },
  });
}

export async function getActivityForContract(contractId: string) {
  return prisma.activityEvent.findMany({
    where: { contractId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
