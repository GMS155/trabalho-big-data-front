import { SpeedingEvent } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: SpeedingEvent[];
}

export default function FuelTable({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.speeding_records - a.speeding_records);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
          <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">
            Vel. Máx.
          </TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">
            Registros
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((entry) => (
          <TableRow key={`${entry.VehId}-${entry.Trip}`} className="border-border">
            <TableCell className="font-mono text-xs text-foreground/80 py-2">
              {entry.VehId}
            </TableCell>
            <TableCell className="font-mono text-xs text-foreground/60 py-2">
              {entry.Trip}
            </TableCell>
            <TableCell className="text-right text-sm font-medium tabular-nums py-2">
              {entry.max_speed_kmh.toFixed(1)}
              <span className="text-muted-foreground text-xs ml-1">km/h</span>
            </TableCell>
            <TableCell className="text-right text-xs tabular-nums py-2 text-muted-foreground">
              {entry.speeding_records}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
