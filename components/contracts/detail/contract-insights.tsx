"use client";

import { AlertTriangle, TrendingUp, Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react";
import { AIBadge } from "@/components/ai-badge";
import { cn } from "@/lib/utils";
import type { ContractInsights as InsightsType, ContractTerms } from "@/lib/mock-llm";

interface ContractInsightsProps {
  insights: InsightsType;
  terms: ContractTerms;
}

const riskColors: Record<string, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

export function ContractInsights({ insights, terms }: ContractInsightsProps) {
  // Calculate risk category levels
  const riskCategories = Object.entries(insights.riskByCategory).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <div className="flex items-start gap-6 p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="text-center">
          <div
            className={cn(
              "text-4xl font-bold",
              insights.riskScore >= 70
                ? "text-destructive"
                : insights.riskScore >= 40
                ? "text-warning"
                : "text-success"
            )}
          >
            {insights.riskScore}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Overall Assessment</span>
            <AIBadge />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insights.riskScore >= 70
              ? "This contract has elevated risk levels that require attention. Review non-standard terms and consider renegotiation."
              : insights.riskScore >= 40
              ? "This contract has moderate risk levels. Some terms are non-standard and should be monitored."
              : "This contract has a healthy risk profile with mostly standard terms and manageable obligations."}
          </p>
        </div>
      </div>

      {/* Risk Heatmap by Category */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Risk Heatmap</h3>
          <AIBadge />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {riskCategories.map(([category, score]) => (
            <div
              key={category}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        score >= 70 ? "bg-destructive" : score >= 40 ? "bg-warning" : "bg-success"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Standard Terms */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Non-Standard Terms</h3>
          <AIBadge />
        </div>
        {insights.nonStandardTerms.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm text-foreground">
              No significant non-standard terms detected in this contract.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.nonStandardTerms.map((term, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border",
                  term.risk === "high"
                    ? "bg-destructive/5 border-destructive/20"
                    : term.risk === "medium"
                    ? "bg-warning/5 border-warning/20"
                    : "bg-secondary/30 border-border"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded",
                      term.risk === "high"
                        ? "bg-destructive/20 text-destructive"
                        : term.risk === "medium"
                        ? "bg-warning/20 text-warning"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {term.risk.toUpperCase()} RISK
                  </span>
                  <span className="text-sm font-medium text-foreground">{term.term}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Negotiation Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-ai" />
          <h3 className="text-lg font-semibold text-foreground">Negotiation Suggestions</h3>
          <AIBadge />
        </div>
        <div className="space-y-2">
          {insights.negotiationSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-ai/5 border border-ai/10"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ai/20 text-xs font-medium text-ai shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
