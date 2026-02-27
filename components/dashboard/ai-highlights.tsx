"use client";

import { Sparkles, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIBadge } from "@/components/ai-badge";
import { getAIHighlights } from "@/lib/seed-data";

export function AIHighlights() {
  const highlights = getAIHighlights();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-ai" />
          <CardTitle className="text-lg font-semibold">
            AI Highlights of the Week
          </CardTitle>
          <AIBadge />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 rounded-lg bg-ai/5 border border-ai/10"
            >
              <Lightbulb className="h-4 w-4 text-ai shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">
                {highlight}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Insights generated from analysis of {10} contracts
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
