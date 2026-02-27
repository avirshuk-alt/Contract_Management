"use client";

import { useState } from "react";
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContractPDFViewerProps {
  contractId: string;
}

// Mock PDF pages
const mockPages = [
  { page: 1, label: "Cover Page" },
  { page: 2, label: "Table of Contents" },
  { page: 3, label: "Definitions" },
  { page: 4, label: "Term & Duration" },
  { page: 5, label: "Pricing" },
  { page: 6, label: "Payment Terms" },
  { page: 7, label: "Deliverables" },
  { page: 8, label: "Service Levels" },
  { page: 9, label: "Termination" },
  { page: 10, label: "Confidentiality" },
  { page: 11, label: "Liability" },
  { page: 12, label: "Signatures" },
];

export function ContractPDFViewer({ contractId }: ContractPDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = mockPages.length;

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Document Preview
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main preview area */}
        <div className="relative aspect-[8.5/11] bg-secondary/50 rounded-lg border border-border overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm font-medium">
              {mockPages[currentPage - 1]?.label || "Page"} {currentPage}
            </p>
            <p className="text-xs mt-1 opacity-60">
              PDF Preview (Demo)
            </p>
          </div>
          
          {/* Mock content lines */}
          <div className="absolute inset-8 space-y-3 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-foreground rounded"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Page thumbnails */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Pages</p>
          <div className="grid grid-cols-4 gap-2">
            {mockPages.map((page) => (
              <button
                key={page.page}
                onClick={() => setCurrentPage(page.page)}
                className={cn(
                  "aspect-[8.5/11] rounded border text-xs flex items-center justify-center transition-colors",
                  currentPage === page.page
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {page.page}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
