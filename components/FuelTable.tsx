import { FuelEntry } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: FuelEntry[];
}

export default function FuelTable({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.fuel_liters_est - a.fuel_liters_est);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
          <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">
            Consumo Est.
          </TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">
            MAF Médio
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
              {entry.fuel_liters_est.toFixed(4)}
              <span className="text-muted-foreground text-xs ml-1">L</span>
            </TableCell>
            <TableCell className="text-right text-xs tabular-nums py-2 text-muted-foreground">
              {entry.avg_maf_g_per_s.toFixed(2)} g/s
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
