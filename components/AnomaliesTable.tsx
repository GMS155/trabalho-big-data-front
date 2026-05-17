import { HighRpmEvent } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Props {
  data: HighRpmEvent[];
}

export default function AnomaliesTable({ data }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
          <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">Amostras</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">RPM Máx.</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">RPM Médio</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">Vel. Média</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((a, i) => {
          const critical = a.max_rpm > 5000;
          return (
            <TableRow
              key={i}
              className={cn("border-border", critical && "bg-destructive/5")}
            >
              <TableCell className="font-mono text-xs py-2 text-foreground/80">
                {a.VehId}
              </TableCell>
              <TableCell className="font-mono text-xs py-2 text-foreground/60">
                {a.Trip}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums py-2 text-muted-foreground">
                {a.high_rpm_samples}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm font-medium tabular-nums py-2",
                  critical ? "text-destructive-foreground" : "text-chart-1"
                )}
              >
                {a.max_rpm.toFixed(0)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums py-2 text-foreground/80">
                {a.avg_rpm.toFixed(0)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums py-2 text-muted-foreground">
                {a.avg_speed_kmh.toFixed(1)} km/h
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
