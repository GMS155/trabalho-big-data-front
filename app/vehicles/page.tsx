"use client";

import { useEffect, useState } from "react";
import { Search, ChevronRight, X, Clock, Car } from "lucide-react";
import { getVehicles, getVehicleTrips, Trip } from "@/lib/api";
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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(false);

  useEffect(() => {
    getVehicles()
      .then((d) => setVehicles(d.vehicles))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleVehicleClick = async (vehId: number) => {
    setSelectedVehicle(vehId);
    setTrips([]);
    setTripsLoading(true);
    setTripsError(false);
    try {
      const data = await getVehicleTrips(vehId);
      setTrips(data.trips);
    } catch {
      setTripsError(true);
    } finally {
      setTripsLoading(false);
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

      {/* Trips Dialog */}
      <Dialog
        open={selectedVehicle !== null}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      >
        <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Viagens — Veículo {selectedVehicle}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
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
                    key={trip.trip_id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-md border border-border"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-mono text-xs text-foreground/80">
                          Viagem #{trip.trip_id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Dia {trip.day_num}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
