"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ObligationEmailModal } from "./obligation-email-modal";
import { cn } from "@/lib/utils";
import type { Obligation } from "@/lib/mock-llm";

interface ContractObligationsProps {
  obligations: Obligation[];
  supplierName: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-muted-foreground bg-muted/50",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    className: "text-destructive bg-destructive/10",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    className: "text-warning bg-warning/10",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ContractObligations({ obligations, supplierName }: ContractObligationsProps) {
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleGenerateEmail = (obligation: Obligation) => {
    setSelectedObligation(obligation);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Obligations Tracker</h3>
          <p className="text-sm text-muted-foreground">
            {obligations.length} total obligations · {obligations.filter(o => o.status === "overdue" || o.status === "at-risk").length} require attention
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="text-muted-foreground">Obligation</TableHead>
              <TableHead className="text-muted-foreground">Owner</TableHead>
              <TableHead className="text-muted-foreground">Due Date</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Evidence</TableHead>
              <TableHead className="text-muted-foreground w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((obligation) => {
              const status = statusConfig[obligation.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={obligation.id} className="border-border">
                  <TableCell className="font-medium text-foreground max-w-[300px]">
                    {obligation.obligation}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded",
                        obligation.owner === "Supplier"
                          ? "bg-chart-1/10 text-chart-1"
                          : obligation.owner === "Client"
                          ? "bg-chart-2/10 text-chart-2"
                          : "bg-chart-3/10 text-chart-3"
                      )}
                    >
                      {obligation.owner}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(obligation.dueDate)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded",
                        status.className
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {obligation.evidenceLink ? (
                      <a
                        href={obligation.evidenceLink}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {obligation.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateEmail(obligation)}
                        className="h-8 px-2 text-xs"
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Follow-up
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedObligation && (
        <ObligationEmailModal
          open={isEmailModalOpen}
          onOpenChange={setIsEmailModalOpen}
          obligation={selectedObligation}
          supplierName={supplierName}
        />
      )}
    </div>
  );
}
