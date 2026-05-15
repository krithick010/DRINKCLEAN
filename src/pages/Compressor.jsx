import { Wind } from "lucide-react";
import { SensorCard } from "../components/SensorCard";
import { useSensorData } from "../hooks/useSensorData";

export function Compressor() {
  const { data } = useSensorData();
  const compressor = data?.compressor || {};
  const temperature = data?.temperature || {};
  const pressure = data?.pressure || {};
  const suction = Number(pressure.suction) || 0;
  const discharge = Number(pressure.discharge) || 0;
  const ratio = suction > 0 ? discharge / suction : 0;

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div>
        <h3 className="text-2xl font-semibold">Compressor</h3>
        <p className="mt-1 text-sm text-slate-400">Status, outlet temperature, and pressure ratio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SensorCard label="Status" value={compressor.status || "--"} unit="" status={compressor.status === "ON" ? "normal" : "offline"} icon={Wind} digits={0} />
        <SensorCard label="Outlet Temperature" value={temperature.comp_outlet} unit="°C" status={temperature.comp_outlet > 105 ? "critical" : temperature.comp_outlet > 90 ? "warning" : "normal"} icon={Wind} />
        <SensorCard label="Suction Pressure" value={pressure.suction} unit="bar" status="normal" icon={Wind} />
        <SensorCard label="Discharge Pressure" value={pressure.discharge} unit="bar" status="normal" icon={Wind} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pressure Ratio</p>
        <div className="mt-4 text-4xl font-semibold text-slate-50">{ratio.toFixed(2)}</div>
        <p className="mt-2 text-sm text-slate-400">Discharge ÷ Suction</p>
      </div>
    </div>
  );
}
