"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileText, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { UploadModal } from "@/components/contracts/upload-modal";
import {
  contractTypes,
  statusOptions,
  riskLevels,
  type ContractType,
  type ContractStatus,
  type RiskLevel,
} from "@/lib/seed-data";

interface ContractRow {
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
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number): string {
  if (value === 0) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContractType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (typeFilter !== "all") params.set("contractType", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (riskFilter !== "all") params.set("riskLevel", riskFilter);

    fetch(`/api/contracts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setContracts(data.contracts ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setContracts([]))
      .finally(() => setIsLoading(false));
  }, [searchQuery, typeFilter, statusFilter, riskFilter]);

  const handleUploadSuccess = (newContract: ContractRow) => {
    setContracts((prev) => [newContract, ...prev]);
    setTotal((t) => t + 1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Contract Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and analyze your supplier contracts
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Contract
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-[400px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contracts or suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>

          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as ContractType | "all")}
          >
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {contractTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ContractStatus | "all")}
          >
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={riskFilter}
            onValueChange={(v) => setRiskFilter(v as RiskLevel | "all")}
          >
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              {riskLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Contracts table */}
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">
                <div className="flex items-center gap-1">
                  Supplier
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">Contract Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Effective Date</TableHead>
              <TableHead className="text-muted-foreground">Expiry Date</TableHead>
              <TableHead className="text-muted-foreground">Value</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <p className="text-sm text-muted-foreground">Loading contracts...</p>
                </TableCell>
              </TableRow>
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No contracts found matching your filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow
                  key={contract.id}
                  className="border-border hover:bg-secondary/50 cursor-pointer"
                >
                  <TableCell>
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {contract.supplierName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="text-foreground hover:text-primary"
                    >
                      {contract.contractName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-secondary-foreground">
                      {contract.contractType}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contract.effectiveDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contract.expiryDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(contract.value)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={contract.status as ContractStatus} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={contract.riskLevel as "low" | "medium" | "high" | "critical"} score={contract.riskScore} showScore />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {contracts.length} of {total} contracts
      </p>

      {/* Upload modal */}
      <UploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
