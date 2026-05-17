"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getSpeedingEvents,
  getHighRpm,
  SpeedingEvent,
  HighRpmEvent,
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

  // High RPM
  const [rpmThreshold, setRpmThreshold] = useState(3500);
  const [pendingRpmThreshold, setPendingRpmThreshold] = useState(3500);
  const [rpmEvents, setRpmEvents] = useState<HighRpmEvent[]>([]);
  const [loadingRpm, setLoadingRpm] = useState(true);
  const [errorRpm, setErrorRpm] = useState(false);

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

  const fetchRpm = useCallback(async (t: number) => {
    setLoadingRpm(true);
    setErrorRpm(false);
    try {
      const data = await getHighRpm(t);
      setRpmEvents(data.events);
    } catch {
      setErrorRpm(true);
    } finally {
      setLoadingRpm(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeeding(threshold);
    fetchRpm(rpmThreshold);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <TabsTrigger value="rpm" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
            Alta Rotação
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
                onClick={() => { setThreshold(pendingThreshold); fetchSpeeding(pendingThreshold); }}
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
                      <TableHead className="text-muted-foreground text-xs">Dia</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Vel. Máx.</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {speedingEvents.slice(0, 100).map((e, i) => (
                      <TableRow key={i} className="border-border text-xs">
                        <TableCell className="py-2 font-mono text-foreground/80">{e.VehId}</TableCell>
                        <TableCell className="py-2 font-mono text-foreground/60">{e.Trip}</TableCell>
                        <TableCell className="py-2 text-muted-foreground">{e.DayNum}</TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-chart-4 font-medium">
                          {e.max_speed_kmh.toFixed(1)} km/h
                        </TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-muted-foreground">
                          {e.speeding_records}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* High RPM Tab */}
        <TabsContent value="rpm" className="space-y-4 mt-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Limiar de RPM
                </label>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {pendingRpmThreshold} RPM
                </span>
              </div>
              <Slider
                min={2000}
                max={6000}
                step={500}
                value={[pendingRpmThreshold]}
                onValueChange={([v]) => setPendingRpmThreshold(v)}
                onValueCommit={([v]) => {
                  setPendingRpmThreshold(v);
                  setRpmThreshold(v);
                  fetchRpm(v);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2000 RPM</span>
                <span>6000 RPM</span>
              </div>
              <button
                onClick={() => { setRpmThreshold(pendingRpmThreshold); fetchRpm(pendingRpmThreshold); }}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Aplicar filtro
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Viagens com RPM acima de {rpmThreshold}
              </span>
              {!loadingRpm && (
                <Badge variant="outline" className="text-xs border-chart-1/40 text-chart-1">
                  {rpmEvents.length} eventos
                </Badge>
              )}
            </div>
            {loadingRpm ? (
              <LoadingState />
            ) : errorRpm ? (
              <ErrorState message="Erro ao carregar eventos de alta rotação" />
            ) : rpmEvents.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">Amostras</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">RPM Máx.</TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">RPM Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rpmEvents.slice(0, 100).map((e, i) => (
                      <TableRow key={i} className="border-border text-xs">
                        <TableCell className="py-2 font-mono text-foreground/80">{e.VehId}</TableCell>
                        <TableCell className="py-2 font-mono text-foreground/60">{e.Trip}</TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-muted-foreground">{e.high_rpm_samples}</TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-chart-1 font-medium">
                          {e.max_rpm.toFixed(0)}
                        </TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-foreground/80">
                          {e.avg_rpm.toFixed(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
