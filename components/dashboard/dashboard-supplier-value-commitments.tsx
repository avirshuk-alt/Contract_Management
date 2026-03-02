"use client";

import type { SupplierValueCommitment } from "@/lib/dashboard-view-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DashboardSupplierValueCommitments({
  commitments,
  isDemo,
}: {
  commitments: SupplierValueCommitment[];
  isDemo?: boolean;
}) {
  if (commitments.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Supplier value commitments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No supplier value commitments extracted. Upload a contract with stated continuous improvement or savings commitments to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Supplier value commitments</CardTitle>
        {isDemo && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {commitments.map((c, i) => (
            <li key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium text-foreground">{c.title}</span>
                {c.isDemoSource && <Badge variant="outline" className="text-[10px]">Demo</Badge>}
              </div>
              {c.details && <p className="text-sm text-muted-foreground">{c.details}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {c.target && <span>Target: {c.target}</span>}
                {c.cadence && <span>Cadence: {c.cadence}</span>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
