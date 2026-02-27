"use client";

import { useState } from "react";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  DollarSign,
  AlertTriangle,
  Search,
  ChevronRight,
  Calendar,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { suppliers, contracts } from "@/lib/seed-data";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const riskTrendConfig = {
  improving: {
    icon: TrendingDown,
    label: "Improving",
    className: "text-success",
  },
  stable: {
    icon: Minus,
    label: "Stable",
    className: "text-muted-foreground",
  },
  declining: {
    icon: TrendingUp,
    label: "Declining",
    className: "text-destructive",
  },
};

const eventTypeConfig = {
  "contract-signed": {
    icon: FileText,
    className: "text-primary bg-primary/10",
  },
  renewal: {
    icon: Calendar,
    className: "text-warning bg-warning/10",
  },
  amendment: {
    icon: FileText,
    className: "text-chart-2 bg-chart-2/10",
  },
  issue: {
    icon: AlertTriangle,
    className: "text-destructive bg-destructive/10",
  },
  review: {
    icon: Calendar,
    className: "text-chart-3 bg-chart-3/10",
  },
};

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get contracts for selected supplier
  const supplierContracts = contracts.filter(
    (c) => c.supplierId === selectedSupplier.id
  );

  // Calculate aggregate risk
  const avgRiskScore =
    supplierContracts.length > 0
      ? Math.round(
          supplierContracts.reduce((acc, c) => acc + c.riskScore, 0) /
            supplierContracts.length
        )
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Suppliers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage supplier relationships and contract portfolios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier list */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            {filteredSuppliers.map((supplier) => {
              const TrendIcon = riskTrendConfig[supplier.riskTrend].icon;
              const isSelected = selectedSupplier.id === supplier.id;

              return (
                <button
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {supplier.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {supplier.industry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon
                        className={cn(
                          "h-4 w-4",
                          riskTrendConfig[supplier.riskTrend].className
                        )}
                      />
                      {isSelected && (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{supplier.contractCount} contracts</span>
                    <span>{formatCurrency(supplier.spendEstimate)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Supplier details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedSupplier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedSupplier.industry}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Spend</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(selectedSupplier.spendEstimate)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-chart-2" />
                    <span className="text-xs text-muted-foreground">Contracts</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedSupplier.contractCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-xs text-muted-foreground">Avg Risk</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{avgRiskScore}%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const TrendIcon = riskTrendConfig[selectedSupplier.riskTrend].icon;
                      return (
                        <TrendIcon
                          className={cn(
                            "h-4 w-4",
                            riskTrendConfig[selectedSupplier.riskTrend].className
                          )}
                        />
                      );
                    })()}
                    <span className="text-xs text-muted-foreground">Trend</span>
                  </div>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      riskTrendConfig[selectedSupplier.riskTrend].className
                    )}
                  >
                    {riskTrendConfig[selectedSupplier.riskTrend].label}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Primary Contact</p>
                    <p className="text-foreground font-medium">
                      {selectedSupplier.primaryContact}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${selectedSupplier.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedSupplier.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-foreground">{selectedSupplier.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top obligations */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Obligations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedSupplier.topObligations.map((obligation, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{obligation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract timeline */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Contract Events Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-4">
                  {selectedSupplier.events
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((event) => {
                      const config = eventTypeConfig[event.type];
                      const Icon = config.icon;

                      return (
                        <div key={event.id} className="relative flex gap-4 pl-0">
                          <div
                            className={cn(
                              "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background shrink-0",
                              config.className
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground">
                                {event.description}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(event.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
