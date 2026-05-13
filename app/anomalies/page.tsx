"use client";

import { useEffect, useState } from "react";
import { getAnomalies, Anomaly } from "@/lib/api";
import AnomaliesTable from "@/components/AnomaliesTable";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "RPM" | "MAF">("all");

  useEffect(() => {
    getAnomalies()
      .then((d) => setAnomalies(d.anomalies))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? anomalies : anomalies.filter((a) => a.metric === filter);

  const criticalCount = anomalies.filter(
    (a) => Math.abs(a.z_score) > 3
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Anomalias</h1>
          <p className="text-sm text-muted-foreground">
            Detecção via z-score em RPM e MAF
          </p>
        </div>
        {!loading && !error && criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-sm text-destructive-foreground font-medium">
              {criticalCount} anomalia{criticalCount !== 1 ? "s" : ""} crítica{criticalCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        {(["all", "RPM", "MAF"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-card"
            }`}
          >
            {f === "all" ? "Todos" : f}
          </button>
        ))}
        {!loading && (
          <Badge variant="outline" className="text-xs border-border text-muted-foreground ml-auto">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Erro ao carregar anomalias. Verifique a API.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Nenhuma anomalia encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <AnomaliesTable data={filtered} />
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          Linhas em vermelho indicam z-score acima de 3 (anomalias críticas).
        </p>
      )}
    </div>
  );
}
