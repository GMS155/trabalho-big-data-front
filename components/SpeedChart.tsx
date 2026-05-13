"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TelemetryRecord } from "@/lib/api";

interface Props {
  data: TelemetryRecord[];
}

export default function SpeedChart({ data }: Props) {
  const chartData = data.map((r, i) => ({
    index: i,
    speed: r.speed,
    label: new Date(r.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 240)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "oklch(0.55 0.01 240)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "oklch(0.55 0.01 240)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          unit=" km/h"
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.16 0.005 240)",
            border: "1px solid oklch(0.24 0.005 240)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "oklch(0.94 0.005 240)",
          }}
          formatter={(v: number) => [`${v.toFixed(1)} km/h`, "Velocidade"]}
        />
        <Line
          type="monotone"
          dataKey="speed"
          stroke="oklch(0.6 0.2 220)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.6 0.2 220)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
