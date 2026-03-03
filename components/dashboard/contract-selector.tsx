"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export interface ContractOption {
  id: string;
  contractName: string;
  supplierName: string;
  uploadedAt: string;
}

/**
 * Compact contract selector for Dashboard header.
 * Data source: /api/contracts. Parent shows empty state when 0 contracts.
 */
export function ContractSelector({
  selectedId,
  displayList,
}: {
  contracts: ContractOption[];
  selectedId: string | null;
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
