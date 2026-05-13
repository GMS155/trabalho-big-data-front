"use client";

import { useEffect, useState } from "react";
import { Car, AlertTriangle, Activity, Gauge, TrendingUp, TrendingDown } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import StatusBadge from "@/components/StatusBadge";
import FuelTable from "@/components/FuelTable";
import RpmBarChart from "@/components/RpmBarChart";
import {
  getVehicles,
  getSpeedingEvents,
  getFuelConsumption,
  getSpeedStats,
  getRpmRanking,
  SpeedStats,
  FuelEntry,
  RpmRankEntry,
} from "@/lib/api";

export default function DashboardPage() {
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [speedingCount, setSpeedingCount] = useState<number | null>(null);
  const [fuel, setFuel] = useState<FuelEntry[]>([]);
  const [speedStats, setSpeedStats] = useState<SpeedStats | null>(null);
  const [rpmRanking, setRpmRanking] = useState<RpmRankEntry[]>([]);

  const [loading, setLoading] = useState({
    vehicles: true,
    speeding: true,
    fuel: true,
    speed: true,
    rpm: true,
  });
  const [errors, setErrors] = useState({
    vehicles: false,
    speeding: false,
    fuel: false,
    speed: false,
    rpm: false,
  });

  useEffect(() => {
    getVehicles()
      .then((d) => setVehicleCount(d.vehicle_ids.length))
      .catch(() => setErrors((e) => ({ ...e, vehicles: true })))
      .finally(() => setLoading((l) => ({ ...l, vehicles: false })));

    getSpeedingEvents()
      .then((d) => setSpeedingCount(d.count))
      .catch(() => setErrors((e) => ({ ...e, speeding: true })))
      .finally(() => setLoading((l) => ({ ...l, speeding: false })));

    getFuelConsumption()
      .then((d) => setFuel(d.results.slice(0, 15)))
      .catch(() => setErrors((e) => ({ ...e, fuel: true })))
      .finally(() => setLoading((l) => ({ ...l, fuel: false })));

    getSpeedStats()
      .then(setSpeedStats)
      .catch(() => setErrors((e) => ({ ...e, speed: true })))
      .finally(() => setLoading((l) => ({ ...l, speed: false })));

    getRpmRanking()
      .then((d) => setRpmRanking(d.ranking.slice(0, 10)))
      .catch(() => setErrors((e) => ({ ...e, rpm: true })))
      .finally(() => setLoading((l) => ({ ...l, rpm: false })));
  }, []);

  const totalFuel = fuel.reduce((acc, f) => acc + f.fuel_liters_est, 0);

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

      {/* KPI Cards - Speed */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Velocidade Média"
          value={speedStats ? speedStats.avg_kmh.toFixed(1) : "—"}
          unit="km/h"
          icon={Gauge}
          loading={loading.speed}
          error={errors.speed}
          accent="blue"
        />
        <KpiCard
          title="Velocidade Mínima"
          value={speedStats ? speedStats.min_kmh.toFixed(1) : "—"}
          unit="km/h"
          icon={TrendingDown}
          loading={loading.speed}
          error={errors.speed}
          accent="green"
        />
        <KpiCard
          title="Velocidade Máxima"
          value={speedStats ? speedStats.max_kmh.toFixed(1) : "—"}
          unit="km/h"
          icon={TrendingUp}
          loading={loading.speed}
          error={errors.speed}
          accent="amber"
        />
        <KpiCard
          title="Total de Veículos"
          value={vehicleCount ?? "—"}
          icon={Car}
          loading={loading.vehicles}
          error={errors.vehicles}
          accent="blue"
        />
      </div>

      {/* KPI Cards - Events */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title="Eventos de Excesso de Velocidade"
          value={speedingCount ?? "—"}
          unit="eventos"
          icon={AlertTriangle}
          loading={loading.speeding}
          error={errors.speeding}
          accent="red"
        />
        <KpiCard
          title="Veículos Monitorados"
          value={vehicleCount ?? "—"}
          unit="ativos"
          icon={Activity}
          loading={loading.vehicles}
          error={errors.vehicles}
          accent="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RPM Ranking */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium text-foreground mb-1">
            Ranking de Eficiência RPM
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Média de RPM por veículo (menor = mais eficiente)
          </p>
          {loading.rpm ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errors.rpm ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Não foi possível carregar os dados
            </div>
          ) : rpmRanking.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Sem dados disponíveis
            </div>
          ) : (
            <RpmBarChart data={rpmRanking} />
          )}
        </div>

        {/* Fuel Table */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium text-foreground mb-1">
            Consumo de Combustível
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Estimativa por viagem via sensor MAF · Total: {loading.fuel ? "..." : totalFuel.toFixed(2) + " L"}
          </p>
          {loading.fuel ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errors.fuel ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Não foi possível carregar os dados
            </div>
          ) : fuel.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Sem dados disponíveis
            </div>
          ) : (
            <FuelTable data={fuel} />
          )}
        </div>
      </div>
    </div>
  );
}
