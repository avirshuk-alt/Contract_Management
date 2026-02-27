"use client";

import { FileText, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardKPIs } from "@/lib/seed-data";

const kpiConfig = [
  {
    key: "activeContracts",
    label: "Active Contracts",
    icon: FileText,
    colorClass: "text-primary bg-primary/10",
  },
  {
    key: "expiringIn90Days",
    label: "Expiring in 90 Days",
    icon: Clock,
    colorClass: "text-warning bg-warning/10",
  },
  {
    key: "highRiskClauses",
    label: "High-Risk Clauses",
    icon: AlertTriangle,
    colorClass: "text-destructive bg-destructive/10",
  },
  {
    key: "openObligations",
    label: "Open Obligations",
    icon: CheckSquare,
    colorClass: "text-chart-2 bg-chart-2/10",
  },
];

export function KPICards() {
  const kpis = getDashboardKPIs();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiConfig.map((item) => {
        const Icon = item.icon;
        const value = kpis[item.key as keyof typeof kpis];

        return (
          <Card key={item.key} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-3xl font-semibold text-foreground mt-1" suppressHydrationWarning>
                    {value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${item.colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
