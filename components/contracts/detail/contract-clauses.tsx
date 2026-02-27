"use client";

import { useState } from "react";
import { FileText, AlertTriangle, Lightbulb, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIBadge } from "@/components/ai-badge";
import type { Clause } from "@/lib/mock-llm";

interface ContractClausesProps {
  clauses: Clause[];
}

export function ContractClauses({ clauses }: ContractClausesProps) {
  const [selectedClause, setSelectedClause] = useState<Clause | null>(clauses[0] || null);

  return (
    <div className="flex gap-4 h-[500px]">
      {/* Clause navigator */}
      <div className="w-48 shrink-0 border-r border-border pr-4 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Clause Navigator
        </p>
        <div className="space-y-1">
          {clauses.map((clause) => (
            <button
              key={clause.id}
              onClick={() => setSelectedClause(clause)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedClause?.id === clause.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/80 hover:bg-secondary"
              )}
            >
              {clause.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clause details */}
      <div className="flex-1 overflow-y-auto">
        {selectedClause ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedClause.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {selectedClause.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Reference: {selectedClause.pageRef}
              </p>
            </div>

            {/* Extracted text */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Extracted Text</span>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  &quot;{selectedClause.extractedText}&quot;
                </p>
              </div>
            </div>

            {/* Plain-English interpretation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium text-foreground">Plain-English Interpretation</span>
                <AIBadge />
              </div>
              <div className="p-4 rounded-lg bg-chart-2/5 border border-chart-2/20">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {selectedClause.interpretation}
                </p>
              </div>
            </div>

            {/* Risk notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Risk Notes</span>
                <AIBadge />
              </div>
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {selectedClause.riskNotes}
                </p>
              </div>
            </div>

            {/* Quick tip */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-ai/5 border border-ai/20">
              <Lightbulb className="h-5 w-5 text-ai shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">AI Tip</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review this clause carefully before renewal. Consider negotiating adjustments
                  based on your operational experience during the current contract term.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a clause from the navigator to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
