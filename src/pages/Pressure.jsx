import { GaugeChart } from "../components/GaugeChart";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";

export function Pressure() {
  const { data } = useSensorData();
  const history = useHistoryData(50);
  const pressure = data?.pressure || {};

  const chartData = history.map((entry) => ({
    timeLabel: entry.ts ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    p_su: entry.p_su ?? null,
    p_di: entry.p_di ?? null,
  }));

  const suction = Number(pressure.suction) || 0;
  const discharge = Number(pressure.discharge) || 0;
  const ratio = suction > 0 ? discharge / suction : 0;

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div>
        <h3 className="text-2xl font-semibold">Pressure</h3>
        <p className="mt-1 text-sm text-slate-400">Suction and discharge pressure status with trend history.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GaugeChart value={suction} min={0} max={10} color="#00d4ff" label="Suction Pressure" unit="bar" />
        <GaugeChart value={discharge} min={0} max={30} color="#22c55e" label="Discharge Pressure" unit="bar" />
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pressure Ratio</p>
          <div className="mt-4 text-4xl font-semibold text-slate-50">{ratio.toFixed(2)}</div>
          <p className="mt-2 text-sm text-slate-400">Discharge ÷ Suction</p>
        </div>
      </div>

      <TrendChart
        data={chartData}
        xKey="timeLabel"
        label="Pressure Trends"        predict={true}        series={[
          { dataKey: "p_su", color: "#00d4ff", label: "Suction" },
          { dataKey: "p_di", color: "#22c55e", label: "Discharge" },
        ]}
      />
    </div>
  );
}
