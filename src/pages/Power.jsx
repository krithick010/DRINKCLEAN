import { Power as PowerIcon, Zap } from "lucide-react";
import { SensorCard } from "../components/SensorCard";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";

export function Power() {
  const { data } = useSensorData();
  const history = useHistoryData(50);
  const power = data?.power || {};

  const chartData = history.map((entry) => ({
    timeLabel: entry.ts ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    pwr: entry.pwr ?? null,
  }));

  const cards = [
    { label: "Voltage", value: power.voltage, unit: "V", status: "normal", icon: PowerIcon },
    { label: "Current", value: power.current, unit: "A", status: "normal", icon: PowerIcon },
    { label: "Power", value: power.power_consumption, unit: "W", status: Number(power.power_consumption) > 1000 ? "warning" : "normal", icon: Zap },
    { label: "Energy Today", value: power.energy_today, unit: "kWh", status: "normal", icon: Zap },
  ];

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div>
        <h3 className="text-2xl font-semibold">Power</h3>
        <p className="mt-1 text-sm text-slate-400">Electrical monitoring and consumption trends.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SensorCard key={card.label} {...card} />
        ))}
      </div>

      <TrendChart data={chartData} xKey="timeLabel" label="Power Consumption Trend" dataKey="pwr" color="#00d4ff" type="area" />
    </div>
  );
}
