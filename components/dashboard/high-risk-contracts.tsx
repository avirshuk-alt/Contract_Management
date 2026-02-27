"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import { AIBadge } from "@/components/ai-badge";
import { getHighRiskContracts } from "@/lib/seed-data";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function HighRiskContracts() {
  const contracts = getHighRiskContracts();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg font-semibold">High Risk</CardTitle>
          <AIBadge />
        </div>
        <Link href="/contracts?risk=high">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No high-risk contracts detected
          </p>
        ) : (
          <div className="space-y-3">
            {contracts.slice(0, 4).map((contract) => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {contract.contractName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contract.supplierName} · {formatCurrency(contract.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <RiskBadge
                      level={contract.riskLevel}
                      score={contract.riskScore}
                      showScore
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
