import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDailyStats } from "../hooks/useDailyStats";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #00d4ff",
  borderRadius: "12px",
  color: "#e2e8f0",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
};

export function DailyStatsChart() {
  const { dailyStats, loading } = useDailyStats();

  const chartData = dailyStats.map((entry) => ({
    ...entry,
    dayLabel: entry.date,
    avg_pwr: entry.avg_pwr ?? null,
    avg_tds: entry.avg_tds ?? null,
  }));

  return (
    <section className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Daily Stats</p>
          <h3 className="text-base font-semibold text-slate-100">Average Power and TDS by Day</h3>
        </div>
        <div className="h-3 w-3 rounded-full bg-cyan-400" />
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500">
          Loading daily statistics...
        </div>
      ) : chartData.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500">
          No daily statistics available yet.
        </div>
      ) : (
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="dayLabel"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
                minTickGap={20}
              />
              <YAxis yAxisId="left" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: "#1e293b" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#94a3b8" }} />
              <Legend />
              <Bar yAxisId="left" dataKey="avg_pwr" name="Avg Power" fill="#00d4ff" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="avg_tds" name="Avg TDS" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}