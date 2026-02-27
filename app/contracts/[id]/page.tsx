"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { AIBadge } from "@/components/ai-badge";
import { ContractOverview } from "@/components/contracts/detail/contract-overview";
import { ContractClauses } from "@/components/contracts/detail/contract-clauses";
import { ContractObligations } from "@/components/contracts/detail/contract-obligations";
import { ContractInsights } from "@/components/contracts/detail/contract-insights";
import { ContractChat } from "@/components/contracts/detail/contract-chat";
import { ContractPDFViewer } from "@/components/contracts/detail/contract-pdf-viewer";
import { ActivityTimeline } from "@/components/contracts/detail/activity-timeline";
import { CompareModal } from "@/components/contracts/detail/compare-modal";
import { RenewalAgentModal } from "@/components/contracts/detail/renewal-agent-modal";
import type { ContractTerms, ContractInsights as InsightsType, Clause, Obligation } from "@/lib/mock-llm";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ContractDetail {
  id: string;
  supplierName: string;
  contractName: string;
  contractType: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  value: number;
  documentId: string | null;
  latestVersionId: string | null;
  terms: ContractTerms | null;
  insights: InsightsType | null;
  clauses: Clause[];
  obligations: Obligation[];
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setContract(data))
      .catch(() => setContract(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading contract...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-foreground">Contract not found</h2>
        <p className="text-muted-foreground">The contract you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/contracts">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Button>
        </Link>
      </div>
    );
  }

  const terms = contract.terms ?? ({
    supplierName: contract.supplierName,
    contractType: contract.contractType,
    contractName: contract.contractName,
    effectiveDate: contract.effectiveDate,
    endDate: contract.expiryDate,
    renewalTerms: "See contract",
    paymentTerms: "See contract",
    invoiceCadence: "See contract",
    terminationNoticeDays: 30,
    deliverables: [],
    milestones: [],
    serviceLevels: [],
    obligations: contract.obligations,
  } as ContractTerms);

  const insights = contract.insights ?? {
    riskScore: contract.riskScore,
    riskByCategory: {},
    nonStandardTerms: [],
    negotiationSuggestions: [],
    aiHighlights: [],
  };

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/contracts"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Contracts
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              {contract.contractName}
            </h1>
            <StatusBadge status={contract.status as "active" | "expiring" | "expired" | "draft" | "under-review"} />
            <RiskBadge level={contract.riskLevel as "low" | "medium" | "high" | "critical"} score={contract.riskScore} showScore />
            <AIBadge size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {contract.supplierName}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {contract.contractType}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(contract.effectiveDate)} - {formatDate(contract.expiryDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsCompareOpen(true)}>
            <GitCompare className="mr-2 h-4 w-4" />
            Compare
          </Button>
          <Button onClick={() => setIsRenewalOpen(true)}>
            Draft Renewal Outreach
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <ContractPDFViewer contractId={id} documentId={contract.documentId} />
        </div>

        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-card border-border p-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-secondary">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="clauses">Clauses</TabsTrigger>
                <TabsTrigger value="obligations">Obligations</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="ask">Ask</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <ContractOverview terms={terms} insights={insights} />
              </TabsContent>

              <TabsContent value="clauses" className="mt-4">
                <ContractClauses clauses={contract.clauses} />
              </TabsContent>

              <TabsContent value="obligations" className="mt-4">
                <ContractObligations
                  obligations={contract.obligations}
                  supplierName={contract.supplierName}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <ContractInsights insights={insights} terms={terms} />
              </TabsContent>

              <TabsContent value="ask" className="mt-4">
                <ContractChat terms={terms} clauses={contract.clauses} />
              </TabsContent>
            </Tabs>
          </Card>

          <ActivityTimeline contractId={id} />
        </div>
      </div>

      <CompareModal
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        currentContractId={id}
        currentVersionId={contract.latestVersionId}
      />
      <RenewalAgentModal
        open={isRenewalOpen}
        onOpenChange={setIsRenewalOpen}
        contract={contract}
        terms={terms}
        insights={insights}
      />
    </div>
  );
}
