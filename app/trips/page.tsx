"use client";

import { useEffect, useState } from "react";
import {
  getVehicles,
  getVehicleTrips,
  getTripTelemetry,
  Trip,
  TelemetryRecord,
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
import { ChevronDown } from "lucide-react";

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-secondary border border-border rounded-md px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [vehicles, setVehicles] = useState<number[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [records, setRecords] = useState<TelemetryRecord[]>([]);

  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVehicles()
      .then((d) => setVehicles(d.vehicles))
      .catch(() => setError("Não foi possível carregar veículos."))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const handleVehicleChange = async (vehIdStr: string) => {
    const vehId = Number(vehIdStr);
    setSelectedVehicle(vehId);
    setSelectedTrip(null);
    setRecords([]);
    setTrips([]);
    setLoadingTrips(true);
    setError(null);
    try {
      const data = await getVehicleTrips(vehId);
      setTrips(data.trips);
    } catch {
      setError("Erro ao carregar viagens.");
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleTripChange = async (tripIdStr: string) => {
    const tripId = Number(tripIdStr);
    setSelectedTrip(tripId);
    setRecords([]);
    setLoadingRecords(true);
    setError(null);
    try {
      const data = await getTripTelemetry(tripId);
      setRecords(data);
    } catch {
      setError("Erro ao carregar telemetria.");
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

      {/* Selectors */}
      <div className="bg-card border border-border rounded-lg p-4 grid sm:grid-cols-2 gap-4">
        <SelectField
          label="Veículo"
          value={selectedVehicle !== null ? String(selectedVehicle) : ""}
          onChange={handleVehicleChange}
          options={vehicles.map((v) => ({ value: String(v), label: String(v) }))}
          placeholder={loadingVehicles ? "Carregando..." : "Selecione um veículo"}
          disabled={loadingVehicles}
        />
        <SelectField
          label="Viagem"
          value={selectedTrip !== null ? String(selectedTrip) : ""}
          onChange={handleTripChange}
          options={trips.map((t) => ({
            value: String(t.trip_id),
            label: `Viagem #${t.trip_id} — Dia ${t.day_num}`,
          }))}
          placeholder={
            selectedVehicle === null
              ? "Selecione um veículo primeiro"
              : loadingTrips
              ? "Carregando..."
              : "Selecione uma viagem"
          }
          disabled={selectedVehicle === null || loadingTrips}
        />
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

      {records.length > 0 && (
        <>
          {/* Speed Chart */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium text-foreground mb-1">
              Velocidade ao Longo do Tempo
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {records.length} registros
            </p>
            <SpeedChart data={records} />
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
                    <TableHead className="text-muted-foreground text-xs text-right">Lat</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">Lon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 200).map((r, i) => (
                    <TableRow key={i} className="border-border text-xs">
                      <TableCell className="py-1.5 text-muted-foreground whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">
                        {r.speed.toFixed(1)}
                        <span className="text-muted-foreground ml-1">km/h</span>
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">
                        {r.rpm.toFixed(0)}
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">
                        {r.maf.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums text-muted-foreground">
                        {r.lat.toFixed(5)}
                      </TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums text-muted-foreground">
                        {r.lon.toFixed(5)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {records.length > 200 && (
              <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
                Exibindo 200 de {records.length} registros
              </div>
            )}
          </div>
        </>
      )}

      {!loadingRecords && selectedTrip && records.length === 0 && !error && (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
          Sem registros para esta viagem
        </div>
      )}
    </div>
  );
}
