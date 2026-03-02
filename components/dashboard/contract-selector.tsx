"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_CONTRACT_OPTIONS } from "@/lib/dashboard-demo-data";

export interface ContractOption {
  id: string;
  contractName: string;
  supplierName: string;
  uploadedAt: string;
}

/**
 * Compact contract selector for Dashboard header (top-right).
 * Data source: same backend as Contracts Library (/api/contracts).
 * When backend returns 0 contracts, injects UI-only CONTRACT_DEMO_1 and CONTRACT_DEMO_2 (not persisted).
 * No upload behavior.
 */
export function ContractSelector({
  contracts,
  selectedId,
  displayList,
}: {
  contracts: ContractOption[];
  selectedId: string | null;
  /** When 0 contracts from backend, pass demo options here so dropdown always shows entries. */
  displayList: ContractOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSelect = (id: string) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.set("contractId", id);
    router.push(`/dashboard?${next.toString()}`);
  };

  const label = (c: ContractOption) =>
    c.contractName && c.supplierName
      ? `${c.contractName} — ${c.supplierName}`
      : c.contractName || c.supplierName || "Unnamed contract";

  if (displayList.length === 0) {
    return null;
  }

  return (
    <Select
      value={selectedId ?? undefined}
      onValueChange={(v) => v && onSelect(v)}
    >
      <SelectTrigger className="w-[240px]" size="sm">
        <SelectValue placeholder="Select contract…" />
      </SelectTrigger>
      <SelectContent>
        {displayList.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {label(c)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
