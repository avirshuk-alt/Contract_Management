import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function AIBadge({ className, size = "sm" }: AIBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-ai/20 font-medium text-ai",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      <Sparkles className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      AI
    </span>
  );
}

export { AIBadge as AiBadge };
