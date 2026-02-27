import { cn } from "@/lib/utils";
import type { ContractStatus } from "@/lib/seed-data";

interface StatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

const statusConfig: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-success/20 text-success",
  },
  expiring: {
    label: "Expiring",
    className: "bg-warning/20 text-warning",
  },
  expired: {
    label: "Expired",
    className: "bg-destructive/20 text-destructive",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  "under-review": {
    label: "Under Review",
    className: "bg-primary/20 text-primary",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
