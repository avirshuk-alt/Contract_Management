import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/seed-data";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
}

const riskConfig: Record<
  RiskLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-success/20 text-success",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/20 text-warning",
  },
  high: {
    label: "High",
    className: "bg-destructive/20 text-destructive",
  },
  critical: {
    label: "Critical",
    className: "bg-destructive/30 text-destructive",
  },
};

export function RiskBadge({ level, score, showScore = false, className }: RiskBadgeProps) {
  const config = riskConfig[level];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
      {showScore && score !== undefined && (
        <span className="opacity-75">({score})</span>
      )}
    </span>
  );
}
