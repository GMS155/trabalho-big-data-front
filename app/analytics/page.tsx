"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getSpeedingEvents,
  getTopRoutes,
  getLongStops,
  getFuelConsumption,
  SpeedingEvent,
  RouteEntry,
  StopEntry,
  FuelEntry,
} from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
      Sem dados disponíveis
    </div>
  );
}

export default function AnalyticsPage() {
  // Speeding
  const [threshold, setThreshold] = useState(80);
  const [pendingThreshold, setPendingThreshold] = useState(80);
  const [speedingEvents, setSpeedingEvents] = useState<SpeedingEvent[]>([]);
  const [loadingSpeeding, setLoadingSpeeding] = useState(false);
  const [errorSpeeding, setErrorSpeeding] = useState(false);

  // Routes
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [errorRoutes, setErrorRoutes] = useState(false);

  // Stops
  const [stops, setStops] = useState<StopEntry[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [errorStops, setErrorStops] = useState(false);

  // Fuel
  const [fuel, setFuel] = useState<FuelEntry[]>([]);
  const [loadingFuel, setLoadingFuel] = useState(true);
  const [errorFuel, setErrorFuel] = useState(false);

  const fetchSpeeding = useCallback(async (t: number) => {
    setLoadingSpeeding(true);
    setErrorSpeeding(false);
    try {
      const data = await getSpeedingEvents(t);
      setSpeedingEvents(data.events);
    } catch {
      setErrorSpeeding(true);
    } finally {
      setLoadingSpeeding(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeeding(threshold);
    getTopRoutes()
      .then((d) => setRoutes(d.routes))
      .catch(() => setErrorRoutes(true))
      .finally(() => setLoadingRoutes(false));
    getLongStops()
      .then((d) => setStops(d.stops))
      .catch(() => setErrorStops(true))
      .finally(() => setLoadingStops(false));
    getFuelConsumption()
      .then((d) => setFuel(d.fuel))
      .catch(() => setErrorFuel(true))
      .finally(() => setLoadingFuel(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyThreshold = () => {
    setThreshold(pendingThreshold);
    fetchSpeeding(pendingThreshold);
  };

  const fuelSorted = [...fuel].sort(
    (a, b) => b.estimated_fuel_liters - a.estimated_fuel_liters
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Análises</h1>
        <p className="text-sm text-muted-foreground">
          Insights de comportamento e eficiência
        </p>
      </div>

      <Tabs defaultValue="speeding">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="speeding" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
            Excesso de Vel.
          </TabsTrigger>
          <TabsTrigger value="routes" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
            Rotas
          </TabsTrigger>
          <TabsTrigger value="stops" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
            Paradas
          </TabsTrigger>
          <TabsTrigger value="fuel" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
            Combustível
          </TabsTrigger>
        </TabsList>

        {/* Speeding Tab */}
        <TabsContent value="speeding" className="space-y-4 mt-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Limite de velocidade
                </label>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {pendingThreshold} km/h
                </span>
              </div>
              <Slider
                min={60}
                max={120}
                step={5}
                value={[pendingThreshold]}
                onValueChange={([v]) => setPendingThreshold(v)}
                onValueCommit={([v]) => {
                  setPendingThreshold(v);
                  setThreshold(v);
                  fetchSpeeding(v);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>60 km/h</span>
                <span>120 km/h</span>
              </div>
              <button
                onClick={applyThreshold}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Aplicar filtro
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Eventos acima de {threshold} km/h
              </span>
              {!loadingSpeeding && (
                <Badge variant="outline" className="text-xs border-chart-4/40 text-chart-4">
                  {speedingEvents.length} eventos
                </Badge>
              )}
            </div>
            {loadingSpeeding ? (
              <LoadingState />
            ) : errorSpeeding ? (
              <ErrorState message="Erro ao carregar eventos" />
            ) : speedingEvents.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Timestamp</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Velocidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {speedingEvents.slice(0, 100).map((e, i) => (
                      <TableRow key={i} className="border-border text-xs">
                        <TableCell className="py-2 font-mono text-foreground/80">{e.vehicle_id}</TableCell>
                        <TableCell className="py-2 font-mono text-foreground/60">{e.trip_id}</TableCell>
                        <TableCell className="py-2 text-muted-foreground whitespace-nowrap">
                          {new Date(e.timestamp).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-chart-4 font-medium">
                          {e.speed.toFixed(1)} km/h
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="mt-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">
                Rotas mais frequentes
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Agrupadas por grade lat/lon
              </p>
            </div>
            {loadingRoutes ? (
              <LoadingState />
            ) : errorRoutes ? (
              <ErrorState message="Erro ao carregar rotas" />
            ) : routes.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">#</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Latitude</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Longitude</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Frequência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.slice(0, 50).map((r, i) => (
                      <TableRow key={i} className="border-border text-xs">
                        <TableCell className="py-2 text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-foreground/80">{r.lat.toFixed(5)}</TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-foreground/80">{r.lon.toFixed(5)}</TableCell>
                        <TableCell className="py-2 text-right tabular-nums font-medium text-chart-1">{r.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stops Tab */}
        <TabsContent value="stops" className="mt-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Paradas longas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Eventos com velocidade = 0
              </p>
            </div>
            {loadingStops ? (
              <LoadingState />
            ) : errorStops ? (
              <ErrorState message="Erro ao carregar paradas" />
            ) : stops.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Início</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Fim</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stops.map((s, i) => (
                      <TableRow key={i} className="border-border text-xs">
                        <TableCell className="py-2 font-mono text-foreground/80">{s.vehicle_id}</TableCell>
                        <TableCell className="py-2 text-muted-foreground whitespace-nowrap">
                          {new Date(s.start_time).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="py-2 text-muted-foreground whitespace-nowrap">
                          {new Date(s.end_time).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="py-2 text-right tabular-nums font-medium">
                          {Math.floor(s.duration_seconds / 60)}
                          <span className="text-muted-foreground ml-1">min</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Fuel Tab */}
        <TabsContent value="fuel" className="mt-4 space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium text-foreground mb-1">
              Consumo de Combustível por Veículo
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Estimativa em litros via sensor MAF
            </p>
            {loadingFuel ? (
              <LoadingState />
            ) : errorFuel ? (
              <ErrorState message="Erro ao carregar combustível" />
            ) : fuelSorted.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={fuelSorted} margin={{ left: 0, right: 16, top: 4, bottom: 40 }}>
                  <XAxis
                    dataKey="vehicle_id"
                    tick={{ fill: "oklch(0.55 0.01 240)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.55 0.01 240)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit=" L"
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.005 240)",
                      border: "1px solid oklch(0.24 0.005 240)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "oklch(0.94 0.005 240)",
                    }}
                    formatter={(v: number) => [`${v.toFixed(2)} L`, "Combustível"]}
                    cursor={{ fill: "oklch(0.20 0.005 240)" }}
                  />
                  <Bar dataKey="estimated_fuel_liters" radius={[4, 4, 0, 0]}>
                    {fuelSorted.map((_, i) => (
                      <Cell key={i} fill={`oklch(${0.6 - i * 0.03} 0.2 220)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
