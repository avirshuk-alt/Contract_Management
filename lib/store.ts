// Local state store for demo persistence
// Uses in-memory storage with React state management via SWR

import { Contract, contracts as seedContracts, suppliers as seedSuppliers, activityLog as seedActivityLog, Supplier, ActivityLogItem } from "./seed-data";

// In-memory store (simulates localStorage/database)
let contractsStore: Contract[] = [...seedContracts];
let suppliersStore: Supplier[] = [...seedSuppliers];
let activityLogStore: ActivityLogItem[] = [...seedActivityLog];

// Contract operations
export function getAllContracts(): Contract[] {
  return [...contractsStore];
}

export function getContractById(id: string): Contract | undefined {
  return contractsStore.find(c => c.id === id);
}

export function addContract(contract: Omit<Contract, "id" | "uploadedAt" | "lastAnalyzedAt">): Contract {
  const newContract: Contract = {
    ...contract,
    id: `contract-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
    lastAnalyzedAt: new Date().toISOString()
  };
  
  contractsStore = [newContract, ...contractsStore];
  
  // Add activity log entries
  addActivityLogItem({
    contractId: newContract.id,
    action: "uploaded",
    details: `${newContract.contractName} uploaded`
  });
  
  // Simulate extraction delay
  setTimeout(() => {
    addActivityLogItem({
      contractId: newContract.id,
      action: "extracted",
      details: "Contract terms extracted successfully"
    });
  }, 1000);
  
  // Simulate insights generation delay
  setTimeout(() => {
    addActivityLogItem({
      contractId: newContract.id,
      action: "insights-generated",
      details: `Risk analysis completed - Score: ${newContract.riskScore}/100`
    });
  }, 2000);
  
  return newContract;
}

export function updateContract(id: string, updates: Partial<Contract>): Contract | undefined {
  const index = contractsStore.findIndex(c => c.id === id);
  if (index === -1) return undefined;
  
  contractsStore[index] = { ...contractsStore[index], ...updates };
  return contractsStore[index];
}

// Supplier operations
export function getAllSuppliers(): Supplier[] {
  return [...suppliersStore];
}

export function getSupplierById(id: string): Supplier | undefined {
  return suppliersStore.find(s => s.id === id);
}

// Activity log operations
export function getActivityLog(): ActivityLogItem[] {
  return [...activityLogStore].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getActivityLogForContract(contractId: string): ActivityLogItem[] {
  return activityLogStore
    .filter(a => a.contractId === contractId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addActivityLogItem(item: Omit<ActivityLogItem, "id" | "timestamp">): ActivityLogItem {
  const newItem: ActivityLogItem = {
    ...item,
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  
  activityLogStore = [newItem, ...activityLogStore];
  return newItem;
}

// Reset store (for testing)
export function resetStore(): void {
  contractsStore = [...seedContracts];
  suppliersStore = [...seedSuppliers];
  activityLogStore = [...seedActivityLog];
}

// React hook for components expecting store shape (e.g. suppliers page)
export function useContractStore() {
  const suppliers = suppliersStore.map((s) => ({
    ...s,
    riskLevel: "low" as const,
    category: s.industry,
    contactEmail: s.email,
    contactPhone: null as string | null,
    website: null as string | null,
    address: s.location,
  }));
  const contracts = contractsStore.map((c) => ({
    ...c,
    title: c.contractName,
    annualValue: c.value,
    endDate: c.expiryDate,
    type: c.contractType,
  }));
  return { suppliers, contracts };
}
