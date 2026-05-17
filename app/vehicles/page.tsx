"use client";

import { useState } from "react";
import { Search, Clock, Car, MapPin, Gauge, BarChart2, Zap, Droplets } from "lucide-react";
import { getVehicleTrips, getVehicleLastPosition, getVehicleSummary, VehicleTrip, LastPosition, VehicleSummary } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VehiclesPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);

  const [trips, setTrips] = useState<VehicleTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(false);

  const [lastPosition, setLastPosition] = useState<LastPosition | null>(null);
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionError, setPositionError] = useState(false);

  const [summary, setSummary] = useState<VehicleSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const vehId = Number(inputValue.trim());
    if (!inputValue.trim() || isNaN(vehId)) {
      setError("Digite um ID de veiculo valido.");
      return;
    }
    setError(null);
    setSelectedVehicle(null);
    setTrips([]);
    setLastPosition(null);
    setSummary(null);
    setLoading(true);
    setTripsLoading(true);
    setTripsError(false);
    setPositionLoading(true);
    setPositionError(false);
    setSummaryLoading(true);
    setSummaryError(false);

    const [tripsResult, posResult, sumResult] = await Promise.allSettled([
      getVehicleTrips(vehId),
      getVehicleLastPosition(vehId),
      getVehicleSummary(vehId),
    ]);

    if (
      tripsResult.status === "rejected" &&
      posResult.status === "rejected" &&
      sumResult.status === "rejected"
    ) {
      setError(`Veiculo #${vehId} nao encontrado.`);
      setLoading(false);
      setTripsLoading(false);
      setPositionLoading(false);
      setSummaryLoading(false);
      return;
    }

    setSelectedVehicle(vehId);

    if (tripsResult.status === "fulfilled") setTrips(tripsResult.value.trips);
    else setTripsError(true);
    setTripsLoading(false);

    if (posResult.status === "fulfilled") setLastPosition(posResult.value);
    else setPositionError(true);
    setPositionLoading(false);

    if (sumResult.status === "fulfilled") setSummary(sumResult.value);
    else setSummaryError(true);
    setSummaryLoading(false);

    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Veiculos</h1>
        <p className="text-sm text-muted-foreground">Consulta detalhada por veiculo</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              ID do Veiculo
            </label>
            <input
              type="number"
              min="1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: 7"
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
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

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && selectedVehicle !== null && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Veiculo #{selectedVehicle}</h2>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1 gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                Resumo
              </TabsTrigger>
              <TabsTrigger value="trips" className="flex-1 gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Viagens
              </TabsTrigger>
              <TabsTrigger value="position" className="flex-1 gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Ultima Posicao
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-3">
              {summaryLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : summaryError || !summary ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados de resumo disponiveis</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary rounded-md border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Viagens</p>
                      <p className="text-xl font-semibold text-foreground tabular-nums">{summary.total_trips}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-md border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Anomalias</p>
                      <p className="text-xl font-semibold text-foreground tabular-nums">{summary.anomalies}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Gauge className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Velocidade Media</p>
                      <p className="text-sm text-foreground font-medium">{summary.avg_speed?.toFixed(1) ?? "---"} km/h</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">RPM Medio</p>
                      <p className="text-sm text-foreground font-medium">{summary.avg_rpm?.toFixed(0) ?? "---"} RPM</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Combustivel Estimado</p>
                      <p className="text-sm text-foreground font-medium">{summary.estimated_fuel?.toFixed(2) ?? "---"} L</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trips" className="mt-3">
              {tripsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tripsError ? (
                <p className="text-sm text-muted-foreground text-center py-8">Erro ao carregar viagens</p>
              ) : trips.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma viagem encontrada</p>
              ) : (
                <div className="space-y-2">
                  {trips.map((trip) => (
                    <div key={trip.trip} className="flex items-center gap-2.5 p-3 bg-secondary rounded-md border border-border">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-mono text-xs text-foreground/80">Viagem #{trip.trip}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Dia {trip.day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="position" className="mt-3">
              {positionLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : positionError || !lastPosition ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados de posicao disponiveis</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary rounded-md border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Latitude</p>
                      <p className="font-mono text-sm text-foreground">{lastPosition.lat.toFixed(6)}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-md border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Longitude</p>
                      <p className="font-mono text-sm text-foreground">{lastPosition.lon.toFixed(6)}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Gauge className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Velocidade</p>
                      <p className="text-sm text-foreground font-medium">{lastPosition.speed.toFixed(1)} km/h</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Timestamp</p>
                      <p className="text-sm text-foreground font-medium">{new Date(lastPosition.timestamp * 1000).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
