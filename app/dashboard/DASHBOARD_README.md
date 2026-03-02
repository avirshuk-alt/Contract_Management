# Dashboard

Contract-specific MRO dashboard. The dashboard **always** renders: header, contract selector (top-right), KPI row, Key Terms, charts, and Operational Opportunities. There is no full-page empty state.

## Contract selector

- **Data source:** Same backend as Contracts Library (`/api/contracts`).
- **When 0 contracts:** Two UI-only demo entries are injected: **CONTRACT_DEMO_1** (Demo Contract A — Acme MRO) and **CONTRACT_DEMO_2** (Demo Contract B — Beta Supplies). They are not persisted. Default selection is CONTRACT_DEMO_1; URL is updated to `?contractId=CONTRACT_DEMO_1`.
- **When contracts exist:** Real contracts are listed. Selecting one loads its extraction. If extraction is null or stub, demo fallback is shown and a banner appears: **"Extraction pending — demo values shown."**

## Demo Mode / data resolution

- **Demo contract selected (CONTRACT_DEMO_1 or CONTRACT_DEMO_2):** Always render that contract’s demo dataset. No banner.
- **Real contract with extraction (meaningful payload):** Render real values. No banner.
- **Real contract with null or stub extraction:** Render demo fallback dataset and show **"Extraction pending — demo values shown."** banner. Fields use `isDemoSource` so the UI can show a "Demo" badge.

## View model

A single **DashboardViewModel** (`lib/dashboard-view-model.ts`) feeds the UI. It includes:

- **keyStats:** startDate, endDate, termLengthMonths, paymentTermsText, avgCatalogDiscountPct, rebateSummaryPct, fillRatePct, vmiMarkupPct, vendingMonthlyCost, consignment, invoicingSummaryText, extractionConfidencePct, isDemoSource.
- **charts:** discountByCategory, rebateTiers, spendTrend, riskVsSavings, capabilityMatrix, isDemoSource.
- **opportunities:** title, category, rationale, estimatedSavingsRange, confidence, status, isDemoSource.
- **showExtractionPendingBanner:** When true, the page shows the extraction-pending banner.

## Demo datasets

Two fully populated demo contracts in `lib/dashboard-demo-data.ts`:

- **CONTRACT_DEMO_1:** Net 45, 12% discount, vending, consignment, 98% fill, 2.5% rebate, full opportunities and chart data.
- **CONTRACT_DEMO_2:** Net 30, 8% discount, no vending, no consignment, 95% fill, 1.5% rebate, different spend trend and risk distribution.

Switching the dropdown between them updates KPIs and charts.

## Stub extraction

- **DB:** `contract.extraction` (JSON) stores the extraction payload.
- **Stub endpoint:** `POST /api/contracts/[id]/extract` runs the stub extractor (no LLM), populates the schema with nulls, and persists to `contract.extraction`. Existing stub extraction code and schema are unchanged.

## Uploads

Uploading exists **only** on the Contracts Library page (`/contracts`). The Dashboard has no Upload button.
