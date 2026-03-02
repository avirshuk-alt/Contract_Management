"use client";

/**
 * Dashboard — contract-specific MRO view.
 * Always renders: header, contract selector, KPI row, Key Terms, charts, opportunities.
 * No empty-only state. When 0 contracts, UI-only demo contracts (CONTRACT_DEMO_1, CONTRACT_DEMO_2) are shown in the dropdown.
 * Uploads exist only on /contracts.
 */

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ContractSelector } from "@/components/dashboard/contract-selector";
import { DashboardKPICards } from "@/components/dashboard/dashboard-kpi-cards";
import { DashboardKeyTerms } from "@/components/dashboard/dashboard-key-terms";
import {
  DashboardDiscountRebateChart,
  DashboardCapabilityHeatmap,
  DashboardSpendSavingsChart,
  DashboardRiskVsSavingsChart,
} from "@/components/dashboard/dashboard-charts";
import { DashboardOpportunities } from "@/components/dashboard/dashboard-opportunities";
import { DashboardSupplierValueCommitments } from "@/components/dashboard/dashboard-supplier-value-commitments";
import type { ContractExtractionPayload } from "@/lib/types/extraction";
import { buildDashboardViewModel } from "@/lib/dashboard-view-model";
import {
  CONTRACT_DEMO_1,
  CONTRACT_DEMO_2,
  DEMO_CONTRACT_1_PAYLOAD,
  DEMO_CONTRACT_2_PAYLOAD,
  DEMO_CONTRACT_OPTIONS,
  DEMO_CONTRACT_1_SPEND_TREND,
  DEMO_CONTRACT_2_SPEND_TREND,
  DEMO_CONTRACT_1_RISK_VS_SAVINGS,
  DEMO_CONTRACT_2_RISK_VS_SAVINGS,
} from "@/lib/dashboard-demo-data";

const STUB_EXTRACTOR_VERSION = "stub-v1";

interface ContractListItem {
  id: string;
  contractName: string;
  supplierName: string;
  uploadedAt: string;
}

interface ContractDetail {
  id: string;
  contractName: string;
  supplierName: string;
  uploadedAt: string;
  extraction: ContractExtractionPayload | null;
}

function isDemoContractId(id: string): id is typeof CONTRACT_DEMO_1 | typeof CONTRACT_DEMO_2 {
  return id === CONTRACT_DEMO_1 || id === CONTRACT_DEMO_2;
}

function isStubOrMissingExtraction(payload: ContractExtractionPayload | null): boolean {
  if (!payload) return true;
  return payload.meta?.extractorVersion === STUB_EXTRACTOR_VERSION || payload.meta?.overallConfidence === 0;
}

function getDemoPayloadForId(id: string): ContractExtractionPayload {
  return id === CONTRACT_DEMO_2 ? DEMO_CONTRACT_2_PAYLOAD : DEMO_CONTRACT_1_PAYLOAD;
}

function getDemoChartOverrides(id: string) {
  const spendTrend = id === CONTRACT_DEMO_2 ? DEMO_CONTRACT_2_SPEND_TREND : DEMO_CONTRACT_1_SPEND_TREND;
  const riskVsSavings = id === CONTRACT_DEMO_2 ? DEMO_CONTRACT_2_RISK_VS_SAVINGS : DEMO_CONTRACT_1_RISK_VS_SAVINGS;
  return { spendTrend, riskVsSavings };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const contractIdFromUrl = searchParams?.get("contractId") ?? null;

  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/contracts?limit=500");
      const data = await res.json();
      const list = (data.contracts ?? []) as ContractListItem[];
      setContracts(list);
      return list;
    } catch {
      setContracts([]);
      return [];
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchContractDetail = useCallback(async (id: string) => {
    if (isDemoContractId(id)) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/contracts/${id}`);
      if (!res.ok) {
        setSelectedContract(null);
        return;
      }
      const data = (await res.json()) as ContractDetail;
      setSelectedContract(data);
    } catch {
      setSelectedContract(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const displayList: ContractListItem[] =
    contracts.length > 0
      ? contracts
      : DEMO_CONTRACT_OPTIONS.map((o) => ({
          id: o.id,
          contractName: o.contractName,
          supplierName: o.supplierName,
          uploadedAt: o.uploadedAt,
        }));

  const effectiveId =
    contractIdFromUrl && displayList.some((c) => c.id === contractIdFromUrl)
      ? contractIdFromUrl
      : displayList[0]?.id ?? CONTRACT_DEMO_1;

  useEffect(() => {
    if (effectiveId && !contractIdFromUrl) {
      window.history.replaceState(
        null,
        "",
        `/dashboard?contractId=${encodeURIComponent(effectiveId)}`
      );
    }
    if (effectiveId && !isDemoContractId(effectiveId)) {
      fetchContractDetail(effectiveId);
    } else if (isDemoContractId(effectiveId)) {
      setLoadingDetail(false);
    }
  }, [effectiveId, contractIdFromUrl, fetchContractDetail]);

  let payload: ContractExtractionPayload;
  let isDemoSource: boolean;
  let showExtractionPendingBanner: boolean;

  if (isDemoContractId(effectiveId)) {
    payload = getDemoPayloadForId(effectiveId);
    isDemoSource = true;
    showExtractionPendingBanner = false;
  } else if (selectedContract?.extraction && !isStubOrMissingExtraction(selectedContract.extraction)) {
    payload = selectedContract.extraction;
    isDemoSource = false;
    showExtractionPendingBanner = false;
  } else {
    payload = getDemoPayloadForId(CONTRACT_DEMO_1);
    isDemoSource = true;
    showExtractionPendingBanner = !!selectedContract && !selectedContract.extraction;
  }

  const chartOverrides = isDemoContractId(effectiveId) ? getDemoChartOverrides(effectiveId) : undefined;
  const viewModel = buildDashboardViewModel(payload, {
    isDemoSource,
    showExtractionPendingBanner,
    chartOverrides,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contract-specific MRO dashboard driven by extracted data
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <ContractSelector
            contracts={contracts}
            selectedId={effectiveId}
            displayList={displayList}
          />
          {payload.meta?.extractedAt && !isDemoSource && (
            <span className="text-xs text-muted-foreground">
              Last extracted: {new Date(payload.meta.extractedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {showExtractionPendingBanner && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          Extraction pending — demo values shown.
        </div>
      )}

      {!isDemoContractId(effectiveId) && loadingDetail && !selectedContract && (
        <p className="text-sm text-muted-foreground">Loading contract…</p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Key statistics</h2>
        <DashboardKPICards keyStats={payload.keyStats} isDemo={viewModel.keyStats.isDemoSource} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Key contract terms</h2>
        <DashboardKeyTerms
          keyStats={payload.keyStats}
          keyTerms={payload.keyTerms}
          isDemo={viewModel.keyStats.isDemoSource}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Supplier value commitments</h2>
        <DashboardSupplierValueCommitments
          commitments={viewModel.supplierValueCommitments}
          isDemo={viewModel.supplierValueCommitments[0]?.isDemoSource ?? isDemoSource}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1">Contract performance summary</h2>
        <p className="text-sm text-muted-foreground mb-4">Factual contract metrics derived from terms and pricing schedules.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardDiscountRebateChart payload={payload} isDemo={viewModel.charts.isDemoSource} />
          <DashboardSpendSavingsChart
            payload={payload}
            isDemo={viewModel.charts.isDemoSource}
            spendTrend={viewModel.charts.spendTrend}
          />
          <DashboardCapabilityHeatmap payload={payload} isDemo={viewModel.charts.isDemoSource} />
          <DashboardRiskVsSavingsChart
            isDemo={viewModel.charts.isDemoSource}
            riskVsSavings={viewModel.charts.riskVsSavings}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Optional opportunities
        </h2>
        <DashboardOpportunities
          opportunities={viewModel.opportunities}
          isDemo={viewModel.opportunities[0]?.isDemoSource ?? isDemoSource}
        />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
