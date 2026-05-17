"use client";

import { useEffect, useState } from "react";
import { Car, Route, Gauge, Droplets, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import StatusBadge from "@/components/StatusBadge";
import FuelTable from "@/components/FuelTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStatsSummary,
  getSpeedingEvents,
  getHighRpm,
  StatsSummary,
  SpeedingEvent,
  HighRpmEvent,
} from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [speedingEvents, setSpeedingEvents] = useState<SpeedingEvent[]>([]);
  const [rpmEvents, setRpmEvents] = useState<HighRpmEvent[]>([]);

  const [loading, setLoading] = useState({ stats: true, speeding: true, rpm: true });
  const [errors, setErrors] = useState({ stats: false, speeding: false, rpm: false });

  useEffect(() => {
    getStatsSummary()
      .then(setStats)
      .catch(() => setErrors((e) => ({ ...e, stats: true })))
      .finally(() => setLoading((l) => ({ ...l, stats: false })));

    getSpeedingEvents()
      .then((d) => setSpeedingEvents(d.events.slice(0, 15)))
      .catch(() => setErrors((e) => ({ ...e, speeding: true })))
      .finally(() => setLoading((l) => ({ ...l, speeding: false })));

    getHighRpm()
      .then((d) => setRpmEvents(d.events.slice(0, 10)))
      .catch(() => setErrors((e) => ({ ...e, rpm: true })))
      .finally(() => setLoading((l) => ({ ...l, rpm: false })));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da telemetria</p>
        </div>
        <StatusBadge />
      </div>

      {/* KPI Cards — /stats/summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total de Veículos"
          value={stats ? stats.total_vehicles : "—"}
          icon={Car}
          loading={loading.stats}
          error={errors.stats}
          accent="blue"
        />
        <KpiCard
          title="Total de Viagens"
          value={stats ? stats.total_trips : "—"}
          icon={Route}
          loading={loading.stats}
          error={errors.stats}
          accent="blue"
        />
        <KpiCard
          title="Velocidade Média"
          value={stats ? stats.avg_speed.toFixed(1) : "—"}
          unit="km/h"
          icon={Gauge}
          loading={loading.stats}
          error={errors.stats}
          accent="blue"
        />
        <KpiCard
          title="Combustível Est."
          value={stats ? stats.total_fuel_estimated.toFixed(1) : "—"}
          unit="L"
          icon={Droplets}
          loading={loading.stats}
          error={errors.stats}
          accent="green"
        />
        <KpiCard
          title="Veículo Mais Infrator"
          value={stats?.top_speeding_vehicle ? `#${stats.top_speeding_vehicle.veh_id}` : "—"}
          unit={stats?.top_speeding_vehicle ? `${stats.top_speeding_vehicle.events} eventos` : undefined}
          icon={AlertTriangle}
          loading={loading.stats}
          error={errors.stats}
          accent="red"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alta Rotação Table */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium text-foreground mb-1">
            Alta Rotação — Top Eventos
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Viagens com mais amostras acima de 3500 RPM em movimento
          </p>
          {loading.rpm ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errors.rpm ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Não foi possível carregar os dados
            </div>
          ) : rpmEvents.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Sem dados disponíveis
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">RPM Máx.</TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">Amostras</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rpmEvents.map((entry) => (
                  <TableRow key={`${entry.VehId}-${entry.Trip}`} className="border-border">
                    <TableCell className="font-mono text-xs text-foreground/80 py-2">{entry.VehId}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground/60 py-2">{entry.Trip}</TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums py-2">
                      {entry.max_rpm.toFixed(0)}
                      <span className="text-muted-foreground text-xs ml-1">RPM</span>
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums py-2 text-muted-foreground">
                      {entry.high_rpm_samples}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Excesso de Velocidade Table */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium text-foreground mb-1">
            Excesso de Velocidade por Viagem
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Viagens com mais registros acima de 80 km/h
          </p>
          {loading.speeding ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errors.speeding ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Não foi possível carregar os dados
            </div>
          ) : speedingEvents.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Sem dados disponíveis
            </div>
          ) : (
            <FuelTable data={speedingEvents} />
          )}
        </div>
      </div>
    </div>
  );
}

