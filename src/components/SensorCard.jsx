import { formatNumber } from "../utils/formatters";

const statusClasses = {
  normal: "border-emerald-500/30 shadow-[0_0_12px_rgba(34,197,94,0.08)]",
  warning: "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
  critical: "border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.14)]",
  offline: "border-slate-700 shadow-none",
};

const statusLabel = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

export function SensorCard({ label, value, unit, status = "offline", icon: Icon, digits = 2 }) {
  const displayValue =
    value === null || value === undefined
      ? "--"
      : typeof value === "number"
        ? formatNumber(value, digits)
        : String(value);

  return (
    <article
      className={[
        "rounded-xl border bg-[#111827] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1f2937]",
        statusClasses[status] || statusClasses.offline,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {Icon ? <Icon size={14} className="shrink-0 text-cyan-300" /> : null}
          <span>{label}</span>
        </div>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {statusLabel[status] || statusLabel.offline}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="text-2xl font-semibold tracking-tight text-slate-50">
          {displayValue}
        </div>
        <div className="pb-1 text-sm text-slate-400">{unit}</div>
      </div>
    </article>
  );
}