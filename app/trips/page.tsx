"use client";

import { useState } from "react";
import {
  getTripTimeline,
  getTripSummary,
  TripTimeline,
  TripSummary,
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SpeedChart from "@/components/SpeedChart";
import { Search } from "lucide-react";

export default function TripsPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<TripTimeline | null>(null);
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const tripId = Number(inputValue.trim());
    if (!inputValue.trim() || isNaN(tripId)) {
      setError("Digite um ID de viagem válido.");
      return;
    }
    setTimeline(null);
    setTripSummary(null);
    setError(null);
    setSelectedTrip(tripId);
    setLoadingRecords(true);
    try {
      const [tl, ts] = await Promise.all([
        getTripTimeline(tripId),
        getTripSummary(tripId),
      ]);
      if (!tl || tl.count === 0) {
        setError(`Viagem #${tripId} não encontrada.`);
      } else {
        setTimeline(tl);
        setTripSummary(ts);
      }
    } catch {
      setError(`Viagem #${tripId} não encontrada.`);
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Viagens</h1>
        <p className="text-sm text-muted-foreground">
          Telemetria detalhada por viagem
        </p>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              ID da Viagem
            </label>
            <input
              type="number"
              min="1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: 42"
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loadingRecords}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </form>
      </div>

      {error && (
        <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md px-4 py-2">
          {error}
        </p>
      )}

      {loadingRecords && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {timeline && (
        <>
          {/* Trip Summary Card */}
          {tripSummary && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-medium text-foreground mb-3">Resumo da Viagem #{tripSummary.trip_id}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-secondary rounded-md border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Veículo</p>
                  <p className="font-mono text-sm font-semibold text-foreground">#{tripSummary.veh_id}</p>
                </div>
                <div className="p-3 bg-secondary rounded-md border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Distância</p>
                  <p className="text-sm font-semibold text-foreground">{tripSummary.distance_km?.toFixed(2) ?? "—"} <span className="text-xs text-muted-foreground font-normal">km</span></p>
                </div>
                <div className="p-3 bg-secondary rounded-md border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vel. Média</p>
                  <p className="text-sm font-semibold text-foreground">{tripSummary.avg_speed?.toFixed(1) ?? "—"} <span className="text-xs text-muted-foreground font-normal">km/h</span></p>
                </div>
                <div className="p-3 bg-secondary rounded-md border border-border col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Início</p>
                  <p className="font-mono text-xs text-foreground">{new Date(tripSummary.start_time).toLocaleString("pt-BR")}</p>
                </div>
                <div className="p-3 bg-secondary rounded-md border border-border col-span-2 sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fim</p>
                  <p className="font-mono text-xs text-foreground">{new Date(tripSummary.end_time).toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Speed Chart */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium text-foreground mb-1">
              Velocidade ao Longo do Tempo
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {timeline.count} registros
            </p>
            <SpeedChart data={timeline} />
          </div>

          {/* Telemetry Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">
                Registros de Telemetria
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Timestamp</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">Velocidade</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">RPM</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">MAF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: Math.min(timeline.count, 200) }, (_, i) => (
                    <TableRow key={i} className="border-border text-xs">
                      <TableCell className="py-1.5 text-muted-foreground whitespace-nowrap">
                        {new Date(timeline.timestamps[i]).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">
                        {timeline.speed_kmh[i]?.toFixed(1) ?? "—"}
                        <span className="text-muted-foreground ml-1">km/h</span>
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">
                        {timeline.rpm[i]?.toFixed(0) ?? "—"}
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">
                        {timeline.maf_g_per_s[i]?.toFixed(2) ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {timeline.count > 200 && (
              <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
                Exibindo 200 de {timeline.count} registros
              </div>
            )}
          </div>
        </>
      )}

      {!loadingRecords && selectedTrip && !timeline && !error && (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
          Sem registros para a viagem #{selectedTrip}
        </div>
      )}
    </div>
  );
}
