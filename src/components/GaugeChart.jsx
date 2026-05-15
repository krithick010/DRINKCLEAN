import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";

export function GaugeChart({
  value = 0,
  min = 0,
  max = 100,
  color = "#00d4ff",
  label = "Gauge",
  unit = "",
  height = 240,
}) {
  const clampedValue = Math.max(min, Math.min(max, Number(value) || 0));
  const percent = max === min ? 0 : ((clampedValue - min) / (max - min)) * 100;
  const data = [{ name: label, value: percent, fill: color }];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="mb-3 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Gauge</p>
        <h3 className="text-base font-semibold text-slate-100">{label}</h3>
      </div>

      <div style={{ height }} className="relative pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="60%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            barSize={14}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={999} background fill={color} />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-4 text-center">
          <div className="text-3xl font-semibold text-slate-50">{clampedValue.toFixed(1)}</div>
          <div className="text-sm text-slate-400">{unit}</div>
        </div>
      </div>
    </div>
  );
}