import { SunMedium } from "lucide-react";
import { GaugeChart } from "../components/GaugeChart";
import { SensorCard } from "../components/SensorCard";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";

export function Solar() {
  const { data } = useSensorData();
  const history = useHistoryData(50);
  const solar = data?.solar || {};
  const temperature = data?.temperature || {};
  const irradiance = Number(solar.irradiance) || 0;
  const condition = irradiance > 800 ? "Excellent" : irradiance > 400 ? "Good" : irradiance > 0 ? "Low" : "Night";

  const chartData = history.map((entry) => ({
    timeLabel: entry.ts ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    sol: entry.sol ?? null,
  }));

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div>
        <h3 className="text-2xl font-semibold">Solar</h3>
        <p className="mt-1 text-sm text-slate-400">Solar irradiance and collector heating performance.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GaugeChart value={irradiance} min={0} max={1200} color="#f59e0b" label="Solar Irradiance" unit="W/m²" />
        <SensorCard label="Solar Condition" value={condition} unit="" status={irradiance > 400 ? "normal" : "warning"} icon={SunMedium} digits={0} />
        <SensorCard label="Collector Temp" value={temperature.solar_collector} unit="°C" status={temperature.solar_collector > 90 ? "warning" : "normal"} icon={SunMedium} />
      </div>

      <TrendChart data={chartData} xKey="timeLabel" label="Irradiance Trend" dataKey="sol" color="#f59e0b" type="area" />
    </div>
  );
}
