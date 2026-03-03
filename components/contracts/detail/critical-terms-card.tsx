"use client";

import { CreditCard, LogOut, Scale, RefreshCw, Shield, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CriticalTerms } from "@/lib/types/extraction";

const CONFIG: {
  key: keyof CriticalTerms;
  label: string;
  icon: typeof CreditCard;
  getSummary: (ct: CriticalTerms) => string | null;
}[] = [
  {
    key: "paymentTerms",
    label: "Payment terms",
    icon: CreditCard,
    getSummary: (ct) => ct.paymentTerms?.value?.summary ?? null,
  },
  {
    key: "terminationExit",
    label: "Termination / exit clause",
    icon: LogOut,
    getSummary: (ct) => ct.terminationExit?.value?.summary ?? null,
  },
  {
    key: "penaltiesDamages",
    label: "Penalties & liquidated damages",
    icon: AlertCircle,
    getSummary: (ct) => ct.penaltiesDamages?.value?.summary ?? null,
  },
  {
    key: "renewalTerms",
    label: "Renewal terms",
    icon: RefreshCw,
    getSummary: (ct) => ct.renewalTerms?.value?.summary ?? null,
  },
  {
    key: "liabilityIndemnity",
    label: "Liability cap & indemnification",
    icon: Shield,
    getSummary: (ct) => ct.liabilityIndemnity?.value?.summary ?? null,
  },
];

interface CriticalTermsCardProps {
  criticalTerms: CriticalTerms | null | undefined;
}

export function CriticalTermsCard({ criticalTerms }: CriticalTermsCardProps) {
  if (!criticalTerms) return null;

  const hasAny = CONFIG.some((c) => c.getSummary(criticalTerms));
  if (!hasAny) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        Critical terms (LLM-extracted)
      </h3>
      <div className="space-y-3">
        {CONFIG.map((item) => {
          const summary = item.getSummary(criticalTerms);
          const Icon = item.icon;
          if (!summary) return null;
          const field = criticalTerms[item.key];
          const value = field?.value as Record<string, unknown> | null;
          const confidence = field && "confidence" in field ? (field.confidence as number) : 0;

          return (
            <Card key={item.key} className="p-4 bg-card border-border">
              <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {item.label}
                    {confidence > 0 && (
                      <span className="ml-2 font-normal normal-case text-muted-foreground/80">
                        {Math.round(confidence * 100)}% confidence
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{summary}</p>
                  {value && typeof value === "object" && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {"netDays" in value && value.netDays != null && (
                        <span>Net {String(value.netDays)} days</span>
                      )}
                      {"noticeDays" in value && value.noticeDays != null && (
                        <span>{String(value.noticeDays)} days notice</span>
                      )}
                      {"latePayment" in value && value.latePayment && (
                        <span>Late: {String(value.latePayment)}</span>
                      )}
                      {"liabilityCap" in value && value.liabilityCap && (
                        <span>Cap: {String(value.liabilityCap)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
