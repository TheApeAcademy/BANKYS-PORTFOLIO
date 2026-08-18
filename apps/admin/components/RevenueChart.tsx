"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate, formatMoney } from "@zebraish/lib/format";
import type { RevenuePoint } from "@/lib/actions/dashboard";

export function RevenueChart({ points, currency }: { points: RevenuePoint[]; currency: string }) {
  const series = points
    .filter((p) => p.currency === currency)
    .map((p) => ({ date: p.period_start, revenue: Number(p.revenue) }));

  if (series.length === 0) {
    return <p className="py-10 text-center text-sm text-fg-muted">No revenue recorded yet in {currency}.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatDate(d)}
          tick={{ fontSize: 11, fill: "var(--color-fg-muted)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatMoney(v, currency)}
          tick={{ fontSize: 11, fill: "var(--color-fg-muted)" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatMoney(Number(value), currency)}
          labelFormatter={(d) => formatDate(String(d))}
          contentStyle={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
