"use client";

import { useState, useMemo } from "react";
import type { DashboardOpportunity } from "@/lib/dashboard-view-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPPORTUNITY_LEVER_OPTIONS = [
  "All",
  "Pricing (discounts/rebates)",
  "Payment terms",
  "Service levels (fill rate/SLA)",
  "VMI / inventory optimization",
  "Vending fees",
  "Invoicing / AP process",
  "Other terms",
] as const;

export function DashboardOpportunities({
  opportunities,
  isDemo,
}: {
  opportunities: DashboardOpportunity[];
  isDemo?: boolean;
}) {
  const [selectedLever, setSelectedLever] = useState<string>("All");

  const filtered = useMemo(() => {
    if (selectedLever === "All") return opportunities;
    return opportunities.filter((o) => o.lever === selectedLever);
  }, [opportunities, selectedLever]);

  if (opportunities.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Optional opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No opportunities generated yet. Extract more contract data to see rules-based suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-base">Optional opportunities</CardTitle>
        {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="opportunity-lever" className="text-sm font-medium text-foreground">
            Opportunity lever
          </label>
          <Select value={selectedLever} onValueChange={setSelectedLever}>
            <SelectTrigger id="opportunity-lever" className="w-[220px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {OPPORTUNITY_LEVER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          {filtered.map((opp, idx) => (
            <div
              key={opp.id ?? idx}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-medium text-foreground">{opp.title}</h4>
                <div className="flex items-center gap-2">
                  {isDemo && <Badge variant="outline" className="text-[10px]">Demo</Badge>}
                  <Badge variant="secondary" className="text-xs">
                    {opp.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {opp.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(opp.confidence * 100)}% conf.
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{opp.rationale}</p>
              {opp.prerequisitesMissing.length > 0 && (
                <p className="text-xs text-amber-600">
                  Needs more data: {opp.prerequisitesMissing.join(", ")}
                </p>
              )}
              {opp.estimatedSavingsRange != null &&
                (opp.estimatedSavingsRange.low != null || opp.estimatedSavingsRange.high != null) && (
                  <p className="text-xs text-muted-foreground">
                    Est. savings:{" "}
                    {opp.estimatedSavingsRange.low != null || opp.estimatedSavingsRange.high != null
                      ? `$${opp.estimatedSavingsRange.low ?? "?"}–$${opp.estimatedSavingsRange.high ?? "?"}`
                      : opp.estimatedSavingsRange.basisText ?? ""}
                  </p>
                )}
              {opp.evidence.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">Evidence</summary>
                  <ul className="mt-1 list-disc list-inside space-y-0.5">
                    {opp.evidence.slice(0, 3).map((e, i) => (
                      <li key={i}>
                        &ldquo;{e.quote.slice(0, 80)}
                        {e.quote.length > 80 ? "…" : ""}&rdquo;
                        {e.page != null ? ` (p.${e.page})` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No opportunities match the selected lever.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
