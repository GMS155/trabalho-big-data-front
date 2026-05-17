"use client";

import { useEffect, useState } from "react";
import { Search, ChevronRight, X, Clock, Car, MapPin, Gauge, BarChart2, Zap, Droplets, AlertTriangle } from "lucide-react";
import { getVehicles, getVehicleTrips, getVehicleLastPosition, getVehicleSummary, VehicleTrip, LastPosition, VehicleSummary } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    getVehicles()
      .then((d) => setVehicles(d.vehicles))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleVehicleClick = async (vehId: number) => {
    setSelectedVehicle(vehId);
    setTrips([]);
    setLastPosition(null);
    setSummary(null);
    setTripsLoading(true);
    setTripsError(false);
    setPositionLoading(true);
    setPositionError(false);
    setSummaryLoading(true);
    setSummaryError(false);

    try {
      const data = await getVehicleTrips(vehId);
      setTrips(data.trips);
    } catch {
      setTripsError(true);
    } finally {
      setTripsLoading(false);
    }

    try {
      const pos = await getVehicleLastPosition(vehId);
      setLastPosition(pos);
    } catch {
      setPositionError(true);
    } finally {
      setPositionLoading(false);
    }

    try {
      const s = await getVehicleSummary(vehId);
      setSummary(s);
    } catch {
      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  const filtered = vehicles.filter((v) =>
    String(v).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Veículos</h1>
        <p className="text-sm text-muted-foreground">
          Lista de veículos monitorados
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar veículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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
            Erro ao carregar veículos. Verifique a API.
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {filtered.length} veículo{filtered.length !== 1 ? "s" : ""}
              </span>
              {search && (
                <span className="text-xs text-muted-foreground">
                  filtrado de {vehicles.length}
                </span>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">
                    ID do Veículo
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">
                    Ação
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground text-sm py-10"
                    >
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((vehId) => (
                    <TableRow
                      key={vehId}
                      className="border-border cursor-pointer hover:bg-secondary/50"
                      onClick={() => handleVehicleClick(vehId)}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
                            <Car className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="font-mono text-sm text-foreground/80">
                            {vehId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          Ver viagens
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {/* Vehicle Dialog */}
      <Dialog
        open={selectedVehicle !== null}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      >
        <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Veículo {selectedVehicle}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="trips" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full">
              <TabsTrigger value="trips" className="flex-1 gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Viagens
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex-1 gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                Resumo
              </TabsTrigger>
              <TabsTrigger value="position" className="flex-1 gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Última Posição
              </TabsTrigger>
            </TabsList>

            {/* Viagens tab */}
            <TabsContent value="trips" className="flex-1 overflow-auto mt-3">
              {tripsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tripsError ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Erro ao carregar viagens
                </p>
              ) : trips.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma viagem encontrada
                </p>
              ) : (
                <div className="space-y-2 pr-1">
                  {trips.map((trip) => (
                    <div
                      key={trip.trip}
                      className="flex items-center justify-between p-3 bg-secondary rounded-md border border-border"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-mono text-xs text-foreground/80">
                            Viagem #{trip.trip}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Dia {trip.day}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Resumo tab */}
            <TabsContent value="summary" className="flex-1 overflow-auto mt-3">
              {summaryLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : summaryError || !summary ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sem dados de resumo disponíveis
                </p>
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
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Velocidade Média</p>
                      <p className="text-sm text-foreground font-medium">{summary.avg_speed?.toFixed(1) ?? "—"} km/h</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">RPM Médio</p>
                      <p className="text-sm text-foreground font-medium">{summary.avg_rpm?.toFixed(0) ?? "—"} RPM</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-md border border-border flex items-center gap-2.5">
                    <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Combustível Estimado</p>
                      <p className="text-sm text-foreground font-medium">{summary.estimated_fuel?.toFixed(2) ?? "—"} L</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Última Posição tab */}
            <TabsContent value="position" className="flex-1 overflow-auto mt-3">{positionLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : positionError || !lastPosition ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sem dados de posição disponíveis
                </p>
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
                      <p className="text-sm text-foreground font-medium">
                        {new Date(lastPosition.timestamp * 1000).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
