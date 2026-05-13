"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RpmRankEntry } from "@/lib/api";

interface Props {
  data: RpmRankEntry[];
}

const COLORS = [
  "oklch(0.6 0.2 220)",
  "oklch(0.58 0.19 220)",
  "oklch(0.56 0.18 220)",
  "oklch(0.54 0.17 220)",
  "oklch(0.52 0.16 220)",
];

export default function RpmBarChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.avg_rpm - b.avg_rpm);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "oklch(0.55 0.01 240)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="VehId"
          type="category"
          width={50}
          tick={{ fill: "oklch(0.55 0.01 240)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.16 0.005 240)",
            border: "1px solid oklch(0.24 0.005 240)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "oklch(0.94 0.005 240)",
          }}
          formatter={(value: number) => [value.toFixed(0) + " RPM", "Média"]}
          cursor={{ fill: "oklch(0.20 0.005 240)" }}
        />
        <Bar dataKey="avg_rpm" radius={[0, 4, 4, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
