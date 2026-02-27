"use client";

import Link from "next/link";
import { Upload, ArrowRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRecentUploads } from "@/lib/seed-data";

function formatRelativeTime(dateStr: string): string {
  const parts = dateStr.split(/[-T:Z]/);
  const dateUtc = Date.UTC(
    parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]),
    parseInt(parts[3] || "0"), parseInt(parts[4] || "0"), parseInt(parts[5] || "0")
  );
  const n = new Date();
  const todayUtc = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  const diffDays = Math.floor((todayUtc - dateUtc) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}

export function RecentUploads() {
  const contracts = getRecentUploads(5);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Recent Uploads</CardTitle>
        </div>
        <Link href="/contracts">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No recent uploads
          </p>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {contract.contractName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contract.supplierName} · {contract.contractType}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {formatRelativeTime(contract.uploadedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
