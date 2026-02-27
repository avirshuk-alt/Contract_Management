"use client";

import { useState, useEffect } from "react";
import { GitCompare, ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ai-badge";
import { cn } from "@/lib/utils";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentContractId: string;
  currentVersionId?: string | null;
}

interface ContractOption {
  id: string;
  contractName: string;
  supplierName: string;
}

interface CompareResult {
  diff: string;
  changes: Array<{ added?: boolean; removed?: boolean; value: string; count?: number }>;
}

export function CompareModal({
  open,
  onOpenChange,
  currentContractId,
  currentVersionId,
}: CompareModalProps) {
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [currentContract, setCurrentContract] = useState<ContractOption | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCompareResult(null);
    setSelectedContractId("");
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => {
        const list = data.contracts ?? [];
        setContracts(list.filter((c: { id: string }) => c.id !== currentContractId));
        setCurrentContract(list.find((c: { id: string }) => c.id === currentContractId) ?? null);
      })
      .catch(() => setContracts([]));
  }, [open, currentContractId]);

  const handleCompare = async () => {
    if (!selectedContractId || !currentVersionId) return;

    setIsLoading(true);
    setCompareResult(null);

    try {
      const res = await fetch(
        `/api/contracts/${currentContractId}/compare?baseVersion=${currentVersionId}&otherContract=${selectedContractId}`
      );
      const data = await res.json();
      if (res.ok) {
        setCompareResult({ diff: data.diff, changes: data.changes ?? [] });
      }
    } catch {
      setCompareResult({ diff: "Comparison failed", changes: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <DialogTitle className="text-foreground">Compare Contracts</DialogTitle>
            <AIBadge />
          </div>
          <DialogDescription className="text-muted-foreground">
            Compare extracted text between contracts (unified diff)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Contract</p>
              <p className="text-sm font-medium text-foreground">
                {currentContract?.contractName}
              </p>
              <p className="text-xs text-muted-foreground">{currentContract?.supplierName}</p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

            <div className="flex-1">
              <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select contract to compare" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      <div>
                        <p className="font-medium">{contract.contractName}</p>
                        <p className="text-xs text-muted-foreground">{contract.supplierName}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!currentVersionId && (
            <p className="text-sm text-muted-foreground">
              No document version available for comparison. Upload a contract first.
            </p>
          )}

          {currentVersionId && !compareResult && (
            <div className="flex justify-center">
              <Button
                onClick={handleCompare}
                disabled={!selectedContractId || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <GitCompare className="mr-2 h-4 w-4" />
                    Compare Contracts
                  </>
                )}
              </Button>
            </div>
          )}

          {compareResult && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Text Diff</h4>
              <pre className="p-4 rounded-lg bg-secondary/30 border border-border text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono whitespace-pre-wrap">
                {compareResult.diff || "(No differences)"}
              </pre>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
