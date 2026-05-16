import { AlertTriangle, CheckCircle, FlaskConical } from "lucide-react";
import { SensorCard } from "../components/SensorCard";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { useThresholds } from "../hooks/useThresholds";
import { getStatus } from "../utils/thresholds";
import { computeWaterSafetyScore } from "../utils/waterSafety";

function getHistoryValues(history, key) {
  return history
    .map((entry) => entry[key])
    .filter((value) => typeof value === "number" && !Number.isNaN(value))
    .slice(-10);
}

export function WaterQuality() {
  const { data } = useSensorData();
  const thresholds = useThresholds();
  const history = useHistoryData(50);
  const waterQuality = data?.water_quality || {};
  const waterSafety = computeWaterSafetyScore(waterQuality);

  const cards = [
    { label: "TDS", value: waterQuality.tds, unit: "ppm", status: getStatus("water_quality", "tds", waterQuality.tds, thresholds), icon: FlaskConical, history: getHistoryValues(history, "tds") },
    { label: "pH", value: waterQuality.ph, unit: "", status: getStatus("water_quality", "ph", waterQuality.ph, thresholds), icon: FlaskConical, digits: 2, history: getHistoryValues(history, "ph") },
    { label: "Conductivity", value: waterQuality.conductivity, unit: "µS/cm", status: getStatus("water_quality", "conductivity", waterQuality.conductivity, thresholds), icon: FlaskConical, history: [] },
    { label: "Salinity", value: waterQuality.salinity, unit: "ppt", status: getStatus("water_quality", "salinity", waterQuality.salinity, thresholds), icon: FlaskConical, digits: 3, history: [] },
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

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
        <div className="mb-4 flex items-center gap-3">
          <span
            className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: waterSafety.color }}
          >
            {waterSafety.score}
          </span>
          <p className="text-sm text-slate-400">Computed water safety score from live quality metrics</p>
        </div>

        {waterSafety.score === "SAFE" ? (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle size={16} />
            <span>All water quality parameters within safe limits.</span>
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-slate-300">
            {waterSafety.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                {waterSafety.score === "UNSAFE" ? (
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                )}
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SensorCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChart data={chartData} xKey="timeLabel" label="TDS Trend" dataKey="tds" color="#00d4ff" />
        <TrendChart data={chartData} xKey="timeLabel" label="pH Trend" dataKey="ph" color="#22c55e" />
      </div>
    </div>
  );
}
