"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { RiskBadge } from "@/components/risk-badge"
import { StatusBadge } from "@/components/status-badge"
import { AiBadge } from "@/components/ai-badge"
import { useContractStore } from "@/lib/store"
import { formatCurrency, formatDate, getDaysUntilExpiration } from "@/lib/seed-data"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  BarChart3,
} from "lucide-react"

export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { suppliers, contracts } = useContractStore()

  const supplier = suppliers.find((s) => s.id === id)
  const supplierContracts = contracts.filter((c) => c.supplierId === id)

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Supplier Not Found</h2>
        <p className="text-muted-foreground">
          The supplier you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/suppliers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers
        </Button>
      </div>
    )
  }

  const totalValue = supplierContracts.reduce((sum, c) => sum + c.annualValue, 0)
  const activeContracts = supplierContracts.filter((c) => c.status === "active")
  const expiringContracts = supplierContracts.filter(
    (c) => getDaysUntilExpiration(c.endDate) <= 90 && getDaysUntilExpiration(c.endDate) > 0
  )
  const highRiskContracts = supplierContracts.filter((c) => c.riskLevel === "high")

  const riskTrend = supplier.riskTrend

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{supplier.name}</h1>
            <RiskBadge level={supplier.riskLevel} />
          </div>
          <p className="text-muted-foreground">{supplier.category}</p>
        </div>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeContracts.length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Annual Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">across all contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
            {riskTrend === "improving" ? (
              <TrendingDown className="h-4 w-4 text-success" />
            ) : riskTrend === "worsening" ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{riskTrend}</div>
            <p className="text-xs text-muted-foreground">over last 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringContracts.length}</div>
            <p className="text-xs text-muted-foreground">within 90 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="contracts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="contracts" className="space-y-4">
              {supplierContracts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium">No Contracts</h3>
                    <p className="text-sm text-muted-foreground">
                      No contracts found for this supplier.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {supplierContracts.map((contract) => {
                    const daysUntil = getDaysUntilExpiration(contract.endDate)
                    return (
                      <Card key={contract.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/contracts/${contract.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {contract.title}
                                </Link>
                                <StatusBadge status={contract.status} />
                                <RiskBadge level={contract.riskLevel} size="sm" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {contract.type} | {formatCurrency(contract.annualValue)}/year
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  Expires: {formatDate(contract.endDate)}
                                  {daysUntil <= 90 && daysUntil > 0 && (
                                    <span className="ml-1 text-warning">
                                      ({daysUntil} days)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/contracts/${contract.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Supplier Analysis</CardTitle>
                    <AiBadge />
                  </div>
                  <CardDescription>
                    AI-generated insights about this supplier relationship
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {highRiskContracts.length > 0 && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                      <div>
                        <p className="font-medium text-destructive">High Risk Alert</p>
                        <p className="text-sm text-muted-foreground">
                          {highRiskContracts.length} contract(s) flagged as high risk.
                          Review liability caps, indemnification clauses, and termination
                          terms for potential exposure.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <div>
                      <p className="font-medium">Spending Pattern</p>
                      <p className="text-sm text-muted-foreground">
                        Annual spend of {formatCurrency(totalValue)} is within typical
                        range for {supplier.category} suppliers. Consider consolidating
                        contracts for better pricing leverage.
                      </p>
                    </div>
                  </div>
                  {expiringContracts.length > 0 && (
                    <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/5 p-4">
                      <Clock className="h-5 w-5 text-warning shrink-0" />
                      <div>
                        <p className="font-medium text-warning">Renewal Opportunity</p>
                        <p className="text-sm text-muted-foreground">
                          {expiringContracts.length} contract(s) expiring within 90 days.
                          Early renewal negotiations could yield 5-10% cost savings
                          based on market benchmarks.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">Relationship Score</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Contract compliance</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Payment history</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Issue resolution</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Relationship Timeline</CardTitle>
                  <CardDescription>Key events in your supplier relationship</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        date: "Feb 2026",
                        event: "Risk assessment updated",
                        detail: `Risk level: ${supplier.riskLevel}`,
                      },
                      {
                        date: "Jan 2026",
                        event: "Contract renewed",
                        detail: "MSA extended for 2 years",
                      },
                      {
                        date: "Dec 2025",
                        event: "Compliance audit completed",
                        detail: "All requirements met",
                      },
                      {
                        date: "Sep 2025",
                        event: "New contract added",
                        detail: "Additional services agreement",
                      },
                      {
                        date: "Jun 2025",
                        event: "Supplier onboarded",
                        detail: "Initial contract signed",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-20 shrink-0 text-sm text-muted-foreground">
                          {item.date}
                        </div>
                        <div className="relative flex-1 pb-4">
                          {index < 4 && (
                            <div className="absolute left-[5px] top-3 h-full w-px bg-border" />
                          )}
                          <div className="flex items-start gap-3">
                            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                            <div>
                              <p className="font-medium">{item.event}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.contactEmail}</span>
              </div>
              {supplier.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.contactPhone}</span>
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {supplier.website.replace("https://", "")}
                  </a>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{supplier.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Add New Contract
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Review
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{supplier.category}</Badge>
                <Badge variant="secondary">Verified</Badge>
                {supplier.riskLevel === "low" && (
                  <Badge variant="secondary">Preferred</Badge>
                )}
                {totalValue > 500000 && (
                  <Badge variant="secondary">Strategic</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
