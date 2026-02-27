"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { getExpiringContracts } from "@/lib/seed-data";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDaysUntil(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(5, 7)) - 1;
  const d = parseInt(dateStr.slice(8, 10));
  const target = Date.UTC(y, m, d);
  const n = new Date();
  const todayUtc = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  const days = Math.ceil((target - todayUtc) / (1000 * 60 * 60 * 24));

  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""}`;
}

function formatDate(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(5, 7)) - 1;
  const d = parseInt(dateStr.slice(8, 10));
  return `${MONTHS[m]} ${d}, ${y}`;
}

export function ExpiringContracts() {
  const contracts = getExpiringContracts(180);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning" />
          <CardTitle className="text-lg font-semibold">Expiring Soon</CardTitle>
        </div>
        <Link href="/contracts?status=expiring">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No contracts expiring soon
          </p>
        ) : (
          <div className="space-y-3">
            {contracts.slice(0, 5).map((contract) => (
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
                      {contract.supplierName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-warning" suppressHydrationWarning>
                        {formatDaysUntil(contract.expiryDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(contract.expiryDate)}
                      </p>
                    </div>
                    <StatusBadge status={contract.status} />
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
