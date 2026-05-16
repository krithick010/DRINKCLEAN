import { formatNumber } from "../utils/formatters";
import { useAnimatedValue } from "../hooks/useAnimatedValue";
import { Sparkline } from "./Sparkline";

const statusClasses = {
  normal: "ring-green-500/40",
  warning: "ring-amber-500/60",
  critical: "ring-red-500/80 animate-pulse",
  offline: "ring-slate-600/40",
};

const statusLabel = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

export function SensorCard({ label, value, unit, status = "offline", icon: Icon, digits = 2, history = [] }) {
  const isNumeric = typeof value === "number" && !Number.isNaN(value);
  const animatedValue = useAnimatedValue(isNumeric ? value : null);

  const displayValue =
    value === null || value === undefined
      ? "--"
      : isNumeric
        ? formatNumber(animatedValue ?? value, digits)
        : String(value);

  return (
    <div
      className={[
        "rounded-xl ring-2 ring-offset-2 ring-offset-[#0a0f1e]",
        statusClasses[status] || statusClasses.offline,
      ].join(" ")}
    >
      <article className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-card-hover)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {Icon ? <Icon size={14} className="shrink-0 text-[var(--accent)]" /> : null}
            <span>{label}</span>
          </div>
          <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {statusLabel[status] || statusLabel.offline}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <div className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {displayValue}
          </div>
          <div className="pb-1 text-sm text-[var(--text-secondary)]">{unit}</div>
        </div>

        <Sparkline data={history} status={status} />
      </article>
    </div>
  );
}