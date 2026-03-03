"use client";

import type { ContractExtractionPayload, Derived } from "@/lib/types/extraction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const EMPTY_MSG = "Not enough extracted data to chart this yet.";

function hasChartData(payload: ContractExtractionPayload): boolean {
  const c = payload.keyStats.catalogDiscounts.value;
  const r = payload.keyStats.revenueRebate.value;
  return (
    (c != null && (c.summaryPct != null || (c.byCategory?.length ?? 0) > 0)) ||
    (r != null && (r.summaryPct != null || (r.tiers?.length ?? 0) > 0))
  );
}

export function DashboardDiscountRebateChart({
  payload,
  isDemo,
}: {
  payload: ContractExtractionPayload;
  isDemo?: boolean;
}) {
  if (!hasChartData(payload)) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Discount &amp; rebate breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  const catalog = payload.keyStats.catalogDiscounts.value;
  const rebate = payload.keyStats.revenueRebate.value;
  const bars: { name: string; discount: number; rebate: number; fill: string }[] = [];

  if (catalog?.byCategory?.length) {
    catalog.byCategory.forEach((cat) => {
      bars.push({
        name: cat.category.slice(0, 12),
        discount: cat.discountPct ?? 0,
        rebate: 0,
        fill: "hsl(var(--chart-1))",
      });
    });
  } else if (catalog?.summaryPct != null) {
    bars.push({
      name: "Catalog",
      discount: catalog.summaryPct,
      rebate: 0,
      fill: "hsl(var(--chart-1))",
    });
  }

  if (rebate?.tiers?.length) {
    rebate.tiers.forEach((t, i) => {
      bars.push({
        name: `Tier ${i + 1}`,
        discount: 0,
        rebate: rebate.tiers![i].rebatePct ?? 0,
        fill: "hsl(var(--chart-2))",
      });
    });
  } else if (rebate?.summaryPct != null && bars.length === 0) {
    bars.push({
      name: "Rebate",
      discount: 0,
      rebate: rebate.summaryPct,
      fill: "hsl(var(--chart-2))",
    });
  }

  if (bars.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Discount &amp; rebate breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Discount &amp; rebate breakdown</CardTitle>
        {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
              <Legend />
              <Bar dataKey="discount" name="Discount %" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="rebate" name="Rebate %" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const CAPABILITY_KEYS = [
  { key: "consignment", label: "Consignment" },
  { key: "vmi", label: "VMI" },
  { key: "vending", label: "Vending" },
  { key: "binManagement", label: "Bin mgmt" },
  { key: "expedited", label: "Expedited" },
  { key: "itemLevelPricing", label: "Item pricing" },
] as const;

export function DashboardCapabilityHeatmap({ payload, isDemo }: { payload: ContractExtractionPayload; isDemo?: boolean }) {
  const offered: Record<string, number> = {};
  let hasAny = false;
  const v = payload.keyStats;
  const kt = payload.keyTerms;
  if (v.consignment.value !== null && v.consignment.value !== undefined) {
    offered.consignment = v.consignment.value ? 1 : 0;
    hasAny = true;
  }
  if (v.vmi.value?.offered !== null && v.vmi.value?.offered !== undefined) {
    offered.vmi = v.vmi.value.offered ? 1 : 0;
    hasAny = true;
  }
  if (v.vendingMachines.value?.offered !== null && v.vendingMachines.value?.offered !== undefined) {
    offered.vending = v.vendingMachines.value.offered ? 1 : 0;
    hasAny = true;
  }
  if (kt.binManagement.value?.offered !== null && kt.binManagement.value?.offered !== undefined) {
    offered.binManagement = kt.binManagement.value.offered ? 1 : 0;
    hasAny = true;
  }
  if (kt.expeditedService.value?.offered !== null && kt.expeditedService.value?.offered !== undefined) {
    offered.expedited = kt.expeditedService.value.offered ? 1 : 0;
    hasAny = true;
  }
  if (v.itemLevelPricing.value !== null && v.itemLevelPricing.value !== undefined) {
    offered.itemLevelPricing = v.itemLevelPricing.value ? 1 : 0;
    hasAny = true;
  }

  if (!hasAny) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Capability heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  const data = CAPABILITY_KEYS.map(({ key, label }) => ({
    name: label,
    value: offered[key] ?? -1,
  }));

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Capability heatmap</CardTitle>
        {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.map((d) => (
            <div
              key={d.name}
              className={`
                rounded-md border p-2 text-center text-sm
                ${d.value === 1 ? "bg-green-500/20 border-green-500/50" : d.value === 0 ? "bg-amber-500/20 border-amber-500/50" : "bg-muted/50 border-border text-muted-foreground"}
              `}
            >
              <span className="font-medium">{d.name}</span>
              <span className="block text-xs mt-0.5">
                {d.value === 1 ? "Yes" : d.value === 0 ? "No" : "Not extracted"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPricingTermSummary({
  payload,
  derived,
}: {
  payload: ContractExtractionPayload;
  derived: Derived;
}) {
  const pt = payload.keyStats.paymentTerms.value;
  const netDays = pt?.netDays ?? derived.paymentTermsDays ?? null;
  const fixedTerm = payload.keyStats.fixedPricingTerm.value;
  const itemLevel = payload.keyStats.itemLevelPricing.value;

  const hasAny =
    netDays != null || fixedTerm?.months != null || (itemLevel !== null && itemLevel !== undefined);

  if (!hasAny) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Pricing / term summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Pricing / term summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {netDays != null && (
          <p>
            <span className="text-muted-foreground">Payment terms:</span> Net {netDays} days
          </p>
        )}
        {fixedTerm?.months != null && (
          <p>
            <span className="text-muted-foreground">Fixed pricing term:</span> {fixedTerm.months}{" "}
            months
          </p>
        )}
        {itemLevel !== null && itemLevel !== undefined && (
          <p>
            <span className="text-muted-foreground">Item-level pricing:</span>{" "}
            {itemLevel ? "Yes" : "No"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardExpiryWidget({ derived }: { derived: Derived }) {
  const days = derived.daysUntilExpiry;
  const isExpired = derived.isExpired;

  if (days === null && isExpired === null) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Expiry timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  const label =
    isExpired === true ? "Expired" : typeof days === "number" ? `${days} days until expiry` : "—";

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Expiry timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-lg font-semibold ${isExpired ? "text-destructive" : typeof days === "number" && days <= 90 ? "text-amber-600" : "text-foreground"}`}
        >
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

/** Spend/Savings trend chart. Uses view model spendTrend when provided, else demo when isDemo. */
export function DashboardSpendSavingsChart({
  payload,
  isDemo,
  spendTrend,
}: {
  payload: ContractExtractionPayload;
  isDemo?: boolean;
  spendTrend?: Array<{ month: string; spendUSD: number; savingsUSD: number }>;
}) {
  const data = spendTrend?.length
    ? spendTrend.map((s) => ({ month: s.month, spend: s.spendUSD, savings: s.savingsUSD }))
    : null;

  if (!data || data.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Spend / savings trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Spend / savings trend</CardTitle>
        {isDemo && (
          <Badge variant="secondary" className="text-[10px]">Demo</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="spend" name="Spend ($K)" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
              <Area type="monotone" dataKey="savings" name="Savings ($K)" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/** Contract metrics by category (factual scores only). Uses view model riskVsSavings when provided, else demo when isDemo. */
export function DashboardRiskVsSavingsChart({
  isDemo,
  riskVsSavings,
}: {
  isDemo?: boolean;
  riskVsSavings?: Array<{ category?: string; riskScore: number; savingsUSD: number }>;
}) {
  const raw = riskVsSavings?.length ? riskVsSavings : [];
  const data = raw.map((r: { category?: string; riskScore: number; savingsUSD?: number; savingsPotential?: number }) => ({
    category: r.category ?? "",
    riskScore: r.riskScore,
    contractScore: r.savingsUSD ?? r.savingsPotential ?? 0,
  }));

  if (!data.length) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Contract metrics by category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{EMPTY_MSG}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Contract metrics by category</CardTitle>
        {isDemo && (
          <Badge variant="secondary" className="text-[10px]">Demo</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="riskScore" name="Risk score" fill="hsl(var(--chart-1))" radius={[0, 2, 2, 0]} />
              <Bar dataKey="contractScore" name="Contract score" fill="hsl(var(--chart-2))" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
