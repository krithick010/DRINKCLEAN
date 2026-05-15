import { FlaskConical } from "lucide-react";
import { SensorCard } from "../components/SensorCard";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { getStatus } from "../utils/thresholds";

export function WaterQuality() {
  const { data } = useSensorData();
  const history = useHistoryData(50);
  const waterQuality = data?.water_quality || {};

  const tds = Number(waterQuality.tds) || 0;
  const ph = Number(waterQuality.ph) || 0;
  const safe = tds < 500 && ph >= 6.5 && ph <= 8.5;
  const caution = !safe && (tds < 1000 && ph >= 5.5 && ph <= 9.5);
  const verdict = safe ? "SAFE" : caution ? "CAUTION" : "UNSAFE";

  const cards = [
    { label: "TDS", value: waterQuality.tds, unit: "ppm", status: getStatus("water_quality", "tds", waterQuality.tds), icon: FlaskConical },
    { label: "pH", value: waterQuality.ph, unit: "", status: getStatus("water_quality", "ph", waterQuality.ph), icon: FlaskConical, digits: 2 },
    { label: "Conductivity", value: waterQuality.conductivity, unit: "µS/cm", status: "normal", icon: FlaskConical },
    { label: "Salinity", value: waterQuality.salinity, unit: "ppt", status: "normal", icon: FlaskConical, digits: 3 },
  ];

  const chartData = history.map((entry) => ({
    timeLabel: entry.ts ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    tds: entry.tds ?? null,
    ph: entry.ph ?? null,
  }));

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div>
        <h3 className="text-2xl font-semibold">Water Quality</h3>
        <p className="mt-1 text-sm text-slate-400">TDS, pH, conductivity, and salinity monitoring.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SensorCard key={card.label} {...card} />
        ))}
      </div>

      <div className={`rounded-xl border px-4 py-3 text-sm ${safe ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : caution ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
        Water quality verdict: {verdict}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChart data={chartData} xKey="timeLabel" label="TDS Trend" dataKey="tds" color="#00d4ff" />
        <TrendChart data={chartData} xKey="timeLabel" label="pH Trend" dataKey="ph" color="#22c55e" />
      </div>
    </div>
  );
}
