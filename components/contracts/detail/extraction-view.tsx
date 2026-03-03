"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContractExtractionPayload, Evidence } from "@/lib/types/extraction";

/** Format an extracted value for display (primitives vs objects). */
function formatValue(val: unknown): string {
  if (val == null) return "—";
  if (typeof val === "string") return val || "—";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
  if (typeof val === "object") {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(val)) {
      if (v == null) continue;
      if (typeof v === "object" && !Array.isArray(v) && v !== null) {
        parts.push(`${k}: ${formatValue(v)}`);
      } else {
        parts.push(`${k}: ${String(v)}`);
      }
    }
    return parts.length ? parts.join(" · ") : "—";
  }
  return String(val);
}

export interface ExtractionRow {
  section: string;
  field: string;
  value: string;
  evidence: Evidence[];
}

/** Flatten extraction payload into rows: section, field, value, evidence. */
export function flattenExtractionPayload(
  payload: ContractExtractionPayload | null | undefined
): ExtractionRow[] {
  if (!payload) return [];

  const rows: ExtractionRow[] = [];
  const push = (
    section: string,
    field: string,
    raw: { value: unknown; evidence?: Evidence[] }
  ) => {
    const valueStr = formatValue(raw.value);
    const evidence = raw.evidence ?? [];
    rows.push({ section, field, value: valueStr, evidence });
  };

  const ids = payload.contractIdentifiers;
  if (ids) {
    push("Document", "Contract title (from doc)", ids.contractTitleFromDoc);
    push("Document", "Supplier name (from doc)", ids.supplierNameFromDoc);
    push("Document", "Contract value (from doc)", ids.contractValueFromDoc);
  }

  const stats = payload.keyStats;
  if (stats) {
    const statLabels: Record<string, string> = {
      contractStartDate: "Contract start date",
      contractEndDate: "Contract end date",
      autoRenewal: "Auto renewal",
      paymentTerms: "Payment terms",
      lengthOfMSAYears: "MSA length (years)",
      catalogDiscounts: "Catalog discounts",
      revenueRebate: "Revenue rebate",
      fillRateGuarantee: "Fill rate guarantee",
      consignment: "Consignment",
      vmi: "VMI",
      vendingMachines: "Vending machines",
      inventoryBuyBack: "Inventory buy-back",
      itemLevelPricing: "Item-level pricing",
      fixedPricingTerm: "Fixed pricing term",
      invoicingOptions: "Invoicing options",
    };
    for (const [key, label] of Object.entries(statLabels)) {
      const entry = (stats as Record<string, { value: unknown; evidence?: Evidence[] }>)[key];
      if (entry) push("Key stats", label, entry);
    }
  }

  const terms = payload.keyTerms;
  if (terms) {
    const termLabels: Record<string, string> = {
      sitesCovered: "Sites covered",
      binManagement: "Bin management",
      expeditedService: "Expedited service",
      accountManagement: "Account management",
      spendDataReports: "Spend data reports",
      orderingEcommerce: "Ordering / e‑commerce",
    };
    for (const [key, label] of Object.entries(termLabels)) {
      const entry = (terms as Record<string, { value: unknown; evidence?: Evidence[] }>)[key];
      if (entry) push("Key terms", label, entry);
    }
  }

  const critical = payload.criticalTerms;
  if (critical) {
    const criticalLabels: Record<string, string> = {
      paymentTerms: "Payment terms (critical)",
      terminationExit: "Termination / exit",
      penaltiesDamages: "Penalties / damages",
      renewalTerms: "Renewal terms",
      liabilityIndemnity: "Liability / indemnity",
    };
    for (const [key, label] of Object.entries(criticalLabels)) {
      const entry = (critical as Record<string, { value: unknown; evidence?: Evidence[] }>)[key];
      if (entry) push("Critical terms", label, entry);
    }
  }

  return rows;
}

interface ExtractionViewProps {
  extraction: ContractExtractionPayload | null | undefined;
}

export function ExtractionView({ extraction }: ExtractionViewProps) {
  const rows = flattenExtractionPayload(extraction);

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-muted-foreground">
        No extraction data available. Run extraction on this contract to see fields and source paragraphs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        All values below are extracted from the contract document; source paragraph(s) are shown in the last column.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Section</TableHead>
            <TableHead className="min-w-[180px]">Field</TableHead>
            <TableHead className="min-w-[200px]">Value</TableHead>
            <TableHead className="min-w-[280px]">Source (from document)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={`${row.section}-${row.field}-${i}`}>
              <TableCell className="font-medium text-muted-foreground">{row.section}</TableCell>
              <TableCell>{row.field}</TableCell>
              <TableCell className="whitespace-normal">{row.value}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {row.evidence.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {row.evidence.map((e, j) => (
                      <li key={j}>
                        &ldquo;{e.quote}&rdquo;
                        {e.page != null ? ` (p. ${e.page})` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="italic">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
