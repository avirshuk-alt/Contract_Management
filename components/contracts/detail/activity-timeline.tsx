"use client";

import { useState, useEffect } from "react";
import { Upload, FileSearch, Sparkles, Mail, Eye, GitCompare, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  contractId: string;
}

interface ActivityItem {
  id: string;
  contractId: string;
  action: string;
  timestamp: string;
  details: string;
}

const actionConfig: Record<string, { icon: typeof Upload; label: string; colorClass: string }> = {
  uploaded: {
    icon: Upload,
    label: "Uploaded",
    colorClass: "text-primary bg-primary/10",
  },
  extracted: {
    icon: FileSearch,
    label: "Terms Extracted",
    colorClass: "text-chart-2 bg-chart-2/10",
  },
  "insights-generated": {
    icon: Sparkles,
    label: "Insights Generated",
    colorClass: "text-ai bg-ai/10",
  },
  "agent-draft": {
    icon: Mail,
    label: "Email Drafted",
    colorClass: "text-success bg-success/10",
  },
  reviewed: {
    icon: Eye,
    label: "Reviewed",
    colorClass: "text-muted-foreground bg-muted",
  },
  compared: {
    icon: GitCompare,
    label: "Compared",
    colorClass: "text-chart-3 bg-chart-3/10",
  },
  status_change: {
    icon: Eye,
    label: "Status Updated",
    colorClass: "text-muted-foreground bg-muted",
  },
  risk_updated: {
    icon: Sparkles,
    label: "Risk Updated",
    colorClass: "text-warning bg-warning/10",
  },
  version_added: {
    icon: Upload,
    label: "Version Added",
    colorClass: "text-primary bg-primary/10",
  },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityTimeline({ contractId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contracts/${contractId}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch(() => setActivities([]))
      .finally(() => setIsLoading(false));
  }, [contractId]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading activity...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity recorded yet
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {activities.map((activity) => {
                const config = actionConfig[activity.action] ?? {
                  icon: CheckCircle2,
                  label: activity.action,
                  colorClass: "text-muted-foreground bg-muted",
                };
                const Icon = config.icon;

                return (
                  <div key={activity.id} className="relative flex gap-4 pl-0">
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background",
                        config.colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {config.label}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
