"use client";

import type { KeyStats } from "@/lib/types/extraction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatVal<T>(value: T | null, format: (v: T) => string): string {
  if (value === null || value === undefined) return "Not extracted";
  return format(value);
}

function formatDate(s: string | null): string {
  if (!s) return "Not extracted";
  try {
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

function formatPercent(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n}%`;
}

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return String(n);
}

function formatBool(b: boolean | null | undefined): string {
  if (b == null) return "Not extracted";
  return b ? "Yes" : "No";
}

export function DashboardKPICards({ keyStats, isDemo }: { keyStats: KeyStats; isDemo?: boolean }) {
  const items: { label: string; value: string; confidence: number }[] = [
    {
      label: "Contract start",
      value: formatVal(keyStats.contractStartDate.value, (s) => formatDate(s)),
      confidence: keyStats.contractStartDate.confidence,
    },
    {
      label: "Contract end",
      value: formatVal(keyStats.contractEndDate.value, (s) => formatDate(s)),
      confidence: keyStats.contractEndDate.confidence,
    },
    {
      label: "Auto-renewal",
      value:
        keyStats.autoRenewal.value?.enabled == null
          ? "Not extracted"
          : formatBool(keyStats.autoRenewal.value.enabled),
      confidence: keyStats.autoRenewal.confidence,
    },
    {
      label: "Payment terms",
      value:
        keyStats.paymentTerms.value?.type === "NET_DAYS" &&
        keyStats.paymentTerms.value?.netDays != null
          ? `Net ${keyStats.paymentTerms.value.netDays}`
          : keyStats.paymentTerms.value?.text ?? "Not extracted",
      confidence: keyStats.paymentTerms.confidence,
    },
    {
      label: "MSA length (years)",
      value: formatVal(keyStats.lengthOfMSAYears.value, formatNumber),
      confidence: keyStats.lengthOfMSAYears.confidence,
    },
    {
      label: "Catalog discount",
      value:
        keyStats.catalogDiscounts.value?.summaryPct != null
          ? formatPercent(keyStats.catalogDiscounts.value.summaryPct)
          : "Not extracted",
      confidence: keyStats.catalogDiscounts.confidence,
    },
    {
      label: "Revenue rebate",
      value:
        keyStats.revenueRebate.value?.summaryPct != null
          ? formatPercent(keyStats.revenueRebate.value.summaryPct)
          : "Not extracted",
      confidence: keyStats.revenueRebate.confidence,
    },
    {
      label: "Fill rate guarantee",
      value:
        keyStats.fillRateGuarantee.value?.pct != null
          ? formatPercent(keyStats.fillRateGuarantee.value.pct)
          : keyStats.fillRateGuarantee.value?.text ?? "Not extracted",
      confidence: keyStats.fillRateGuarantee.confidence,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              {isDemo && <Badge variant="secondary" className="text-[10px] shrink-0">Demo</Badge>}
            </div>
            <p className="text-sm font-semibold text-foreground mt-1 truncate" title={item.value}>
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.value === "Not extracted" ? "—" : `${Math.round(item.confidence * 100)}% conf.`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
