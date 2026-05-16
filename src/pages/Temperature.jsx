import { ThermometerSun } from "lucide-react";
import { SensorCard } from "../components/SensorCard";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { useThresholds } from "../hooks/useThresholds";
import { getStatus } from "../utils/thresholds";

function getHistoryValues(history, key) {
  return history
    .map((entry) => entry[key])
    .filter((value) => typeof value === "number" && !Number.isNaN(value))
    .slice(-10);
}

export function Temperature() {
  const { data } = useSensorData();
  const thresholds = useThresholds();
  const history = useHistoryData(50);
  const temperature = data?.temperature || {};

  const cards = [
    { label: "Evaporator", value: temperature.evaporator, unit: "°C", status: getStatus("temperature", "evaporator", temperature.evaporator, thresholds), icon: ThermometerSun, history: getHistoryValues(history, "t_ev") },
    { label: "Condenser", value: temperature.condenser, unit: "°C", status: getStatus("temperature", "condenser", temperature.condenser, thresholds), icon: ThermometerSun, history: getHistoryValues(history, "t_co") },
    { label: "Compressor Inlet", value: temperature.comp_inlet, unit: "°C", status: temperature.comp_inlet > 40 ? "warning" : "normal", icon: ThermometerSun, history: [] },
    { label: "Compressor Outlet", value: temperature.comp_outlet, unit: "°C", status: getStatus("temperature", "comp_outlet", temperature.comp_outlet, thresholds), icon: ThermometerSun, history: getHistoryValues(history, "comp_outlet") },
    { label: "Solar Collector", value: temperature.solar_collector, unit: "°C", status: temperature.solar_collector > 90 ? "warning" : "normal", icon: ThermometerSun, history: getHistoryValues(history, "t_sc") },
    { label: "Feed Water", value: temperature.feed_water, unit: "°C", status: "normal", icon: ThermometerSun, history: [] },
    { label: "Purified Water", value: temperature.purified_water, unit: "°C", status: "normal", icon: ThermometerSun, history: [] },
  ];

  const chartData = history.map((entry) => ({
    timeLabel: entry.ts ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    t_ev: entry.t_ev ?? null,
    t_co: entry.t_co ?? null,
    t_sc: entry.t_sc ?? null,
  }));

  return (
    <div className="space-y-6 p-5">
      <div>
        <h3 className="text-2xl font-semibold text-slate-50">Temperature</h3>
        <p className="mt-1 text-sm text-slate-400">All seven temperature points and temperature history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SensorCard key={card.label} {...card} />
        ))}
      </div>

      <TrendChart
        data={chartData}
        xKey="timeLabel"
        label="Temperature Trends"
        series={[
          { dataKey: "t_ev", color: "#00d4ff", label: "Evaporator" },
          { dataKey: "t_co", color: "#22c55e", label: "Condenser" },
          { dataKey: "t_sc", color: "#f59e0b", label: "Solar Collector" },
        ]}
      />
    </div>
  );
}
