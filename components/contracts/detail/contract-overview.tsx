"use client";

import { Sparkles, Calendar, CreditCard, Clock, RefreshCw, FileText, Bell } from "lucide-react";
import { AIBadge } from "@/components/ai-badge";
import type { ContractTerms, ContractInsights } from "@/lib/mock-llm";

interface ContractOverviewProps {
  terms: ContractTerms;
  insights: ContractInsights;
}

const keyTermsConfig = [
  { key: "effectiveDate", label: "Effective Date", icon: Calendar },
  { key: "endDate", label: "End Date", icon: Calendar },
  { key: "renewalTerms", label: "Renewal Terms", icon: RefreshCw },
  { key: "paymentTerms", label: "Payment Terms", icon: CreditCard },
  { key: "invoiceCadence", label: "Invoice Cadence", icon: FileText },
  { key: "terminationNoticeDays", label: "Termination Notice", icon: Bell },
];

export function ContractOverview({ terms, insights }: ContractOverviewProps) {
  // Generate executive summary bullets based on contract data
  const executiveSummary = [
    `${terms.contractType} agreement with ${terms.supplierName} for ${terms.contractName.toLowerCase()}.`,
    `Contract term: ${terms.effectiveDate} to ${terms.endDate} (${calculateMonths(terms.effectiveDate, terms.endDate)} months).`,
    `Payment terms are ${terms.paymentTerms} with ${terms.invoiceCadence.toLowerCase()} invoicing.`,
    `Includes ${terms.serviceLevels.length} service level commitments with penalty clauses.`,
    `${terms.obligations.length} tracked obligations across both parties.`,
    `${terms.terminationNoticeDays} days written notice required for termination.`,
    `Overall risk score: ${insights.riskScore}/100 based on AI analysis.`,
    insights.nonStandardTerms.length > 0
      ? `${insights.nonStandardTerms.length} non-standard term(s) identified requiring attention.`
      : "No significant non-standard terms detected.",
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-ai" />
          <h3 className="text-lg font-semibold text-foreground">Executive Summary</h3>
          <AIBadge />
        </div>
        <ul className="space-y-2">
          {executiveSummary.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground/90">
              <span className="text-primary mt-1.5">•</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Terms Grid */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Key Terms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyTermsConfig.map((item) => {
            const Icon = item.icon;
            let value = terms[item.key as keyof ContractTerms];
            
            // Format specific values
            if (item.key === "terminationNoticeDays") {
              value = `${value} days`;
            } else if (item.key === "effectiveDate" || item.key === "endDate") {
              value = formatDate(value as string);
            }

            return (
              <div
                key={item.key}
                className="p-4 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {String(value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Deliverables</h3>
        <div className="space-y-2">
          {terms.deliverables.map((deliverable, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {index + 1}
              </div>
              <span className="text-sm text-foreground">{deliverable}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Levels */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Service Levels</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Metric</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Target</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Penalty</th>
              </tr>
            </thead>
            <tbody>
              {terms.serviceLevels.map((sla, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-3 px-3 text-foreground font-medium">{sla.metric}</td>
                  <td className="py-3 px-3 text-foreground">{sla.target}</td>
                  <td className="py-3 px-3 text-muted-foreground">{sla.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calculateMonths(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  return months;
}
