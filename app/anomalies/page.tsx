"use client";

import { useEffect, useState } from "react";
import { getHighRpm, HighRpmEvent } from "@/lib/api";
import AnomaliesTable from "@/components/AnomaliesTable";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function AnomaliesPage() {
  const [events, setEvents] = useState<HighRpmEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [threshold, setThreshold] = useState<3000 | 3500 | 4000 | 5000>(3500);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getHighRpm(threshold)
      .then((d) => setEvents(d.events))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [threshold]);

  const criticalCount = events.filter((a) => a.max_rpm > 5000).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Condução Agressiva</h1>
          <p className="text-sm text-muted-foreground">
            Viagens com rotação elevada em movimento
          </p>
        </div>
        {!loading && !error && criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30">
            <Zap className="w-4 h-4 text-destructive-foreground" />
            <span className="text-sm text-destructive-foreground font-medium">
              {criticalCount} evento{criticalCount !== 1 ? "s" : ""} crítico{criticalCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Threshold Filter */}
      <div className="flex items-center gap-2">
        {([3000, 3500, 4000, 5000] as const).map((t) => (
          <button
            key={t}
            onClick={() => setThreshold(t)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              threshold === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-card"
            }`}
          >
            &gt;{t} RPM
          </button>
        ))}
        {!loading && (
          <Badge variant="outline" className="text-xs border-border text-muted-foreground ml-auto">
            {events.length} resultado{events.length !== 1 ? "s" : ""}
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
            Erro ao carregar eventos. Verifique a API.
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Nenhum evento encontrado para este limiar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <AnomaliesTable data={events} />
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          Linhas em vermelho indicam RPM máximo acima de 5000 (eventos críticos).
        </p>
      )}
    </div>
  );
}
