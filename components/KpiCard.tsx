import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  loading?: boolean;
  error?: boolean;
  className?: string;
  accent?: "blue" | "green" | "amber" | "red";
}

const accentMap = {
  blue: "text-chart-1",
  green: "text-chart-2",
  amber: "text-chart-3",
  red: "text-chart-4",
};

export default function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  loading,
  error,
  className,
  accent = "blue",
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center bg-muted", accentMap[accent])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
      ) : error ? (
        <span className="text-sm text-destructive-foreground">Erro</span>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      )}
    </div>
  );
}
