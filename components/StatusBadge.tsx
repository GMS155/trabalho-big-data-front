"use client";

import { useEffect, useState } from "react";
import { getHealth, HealthResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StatusBadge() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        <span className="text-xs text-muted-foreground">Verificando...</span>
      </div>
    );
  }

  const healthy = data?.status === "healthy";
  const starting = data?.status === "starting";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
        healthy
          ? "bg-chart-2/10 border-chart-2/30 text-chart-2"
          : starting
          ? "bg-chart-3/10 border-chart-3/30 text-chart-3"
          : "bg-destructive/10 border-destructive/30 text-destructive-foreground"
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          healthy
            ? "bg-chart-2 animate-pulse"
            : starting
            ? "bg-chart-3 animate-pulse"
            : "bg-destructive"
        )}
      />
      {data ? (healthy ? "API Saudável" : "Iniciando") : "API Inacessível"}
    </div>
  );
}
