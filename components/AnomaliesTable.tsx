import { Anomaly } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  data: Anomaly[];
}

export default function AnomaliesTable({ data }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground text-xs">Veículo</TableHead>
          <TableHead className="text-muted-foreground text-xs">Viagem</TableHead>
          <TableHead className="text-muted-foreground text-xs">Timestamp</TableHead>
          <TableHead className="text-muted-foreground text-xs">Métrica</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">Valor</TableHead>
          <TableHead className="text-muted-foreground text-xs text-right">Z-Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((a, i) => {
          const critical = Math.abs(a.z_score) > 3;
          return (
            <TableRow
              key={i}
              className={cn(
                "border-border",
                critical && "bg-destructive/5"
              )}
            >
              <TableCell className="font-mono text-xs py-2 text-foreground/80">
                {a.vehicle_id}
              </TableCell>
              <TableCell className="font-mono text-xs py-2 text-foreground/60">
                {a.trip_id}
              </TableCell>
              <TableCell className="text-xs py-2 text-muted-foreground">
                {new Date(a.timestamp).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell className="py-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    a.metric === "RPM"
                      ? "border-chart-1/50 text-chart-1"
                      : "border-chart-2/50 text-chart-2"
                  )}
                >
                  {a.metric}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums py-2">
                {a.value.toFixed(1)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm font-medium tabular-nums py-2",
                  critical ? "text-destructive-foreground" : "text-muted-foreground"
                )}
              >
                {a.z_score.toFixed(2)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
