"use client";

import type { KeyStats, KeyTerms } from "@/lib/types/extraction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function cellVal(value: string | null | undefined, fallback = "Not extracted"): string {
  if (value == null || value === "") return fallback;
  return String(value);
}

function formatBool(b: boolean | null | undefined): string {
  if (b == null) return "Not extracted";
  return b ? "Yes" : "No";
}

export function DashboardKeyTerms({
  keyStats,
  keyTerms,
  isDemo,
}: {
  keyStats: KeyStats;
  keyTerms: KeyTerms;
  isDemo?: boolean;
}) {
  const services = [
    { label: "Consignment", value: formatBool(keyStats.consignment.value) },
    {
      label: "VMI",
      value:
        keyStats.vmi.value?.offered == null
          ? "Not extracted"
          : formatBool(keyStats.vmi.value.offered),
    },
    {
      label: "Vending machines",
      value:
        keyStats.vendingMachines.value?.offered == null
          ? "Not extracted"
          : formatBool(keyStats.vendingMachines.value.offered),
    },
    {
      label: "Bin management",
      value:
        keyTerms.binManagement.value?.offered == null
          ? "Not extracted"
          : formatBool(keyTerms.binManagement.value.offered),
    },
    {
      label: "Expedited service",
      value:
        keyTerms.expeditedService.value?.offered == null
          ? "Not extracted"
          : formatBool(keyTerms.expeditedService.value.offered),
    },
    { label: "Inventory buy-back", value: formatBool(keyStats.inventoryBuyBack.value) },
    { label: "Item-level pricing", value: formatBool(keyStats.itemLevelPricing.value) },
  ];

  const pricingTerms = [
    {
      label: "Fixed pricing term",
      value:
        keyStats.fixedPricingTerm.value?.months != null
          ? `${keyStats.fixedPricingTerm.value.months} mo`
          : keyStats.fixedPricingTerm.value?.text ?? "Not extracted",
    },
    {
      label: "Invoicing (EDI)",
      value:
        keyStats.invoicingOptions.value?.edi == null
          ? "Not extracted"
          : formatBool(keyStats.invoicingOptions.value.edi),
    },
    {
      label: "Invoicing (P-card)",
      value:
        keyStats.invoicingOptions.value?.pcard == null
          ? "Not extracted"
          : formatBool(keyStats.invoicingOptions.value.pcard),
    },
  ];

  const otherTerms = [
    {
      label: "Sites covered",
      value:
        Array.isArray(keyTerms.sitesCovered.value) && keyTerms.sitesCovered.value.length > 0
          ? keyTerms.sitesCovered.value.join(", ")
          : "Not extracted",
    },
    {
      label: "Account management",
      value: cellVal(keyTerms.accountManagement.value?.description ?? null),
    },
    {
      label: "Spend data reports",
      value:
        keyTerms.spendDataReports.value?.frequency != null
          ? keyTerms.spendDataReports.value.frequency
          : cellVal(keyTerms.spendDataReports.value?.description ?? null),
    },
    {
      label: "Ordering / e-commerce",
      value: cellVal(keyTerms.orderingEcommerce.value?.optionsText ?? null),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Services &amp; capabilities</CardTitle>
          {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {services.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                  <td className="py-2 font-medium">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Pricing &amp; terms</CardTitle>
          {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {pricingTerms.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                  <td className="py-2 font-medium">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Other terms</CardTitle>
          {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {otherTerms.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                  <td className="py-2 font-medium">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
