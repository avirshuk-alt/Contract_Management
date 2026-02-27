import { KPICards } from "@/components/dashboard/kpi-cards";
import { ExpiringContracts } from "@/components/dashboard/expiring-contracts";
import { HighRiskContracts } from "@/components/dashboard/high-risk-contracts";
import { RecentUploads } from "@/components/dashboard/recent-uploads";
import { AIHighlights } from "@/components/dashboard/ai-highlights";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your contract portfolio and AI-powered insights
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <ExpiringContracts />
          <HighRiskContracts />
          <RecentUploads />
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          <AIHighlights />
        </div>
      </div>
    </div>
  );
}
