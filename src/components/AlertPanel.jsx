import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatTime } from "../utils/formatters";

const severityClasses = {
  INFO: "border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info-text)]",
  WARNING: "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
  CRITICAL: "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
};

export function AlertPanel({ alerts = [] }) {
  const acknowledgedCount = alerts.filter((alert) => alert.acknowledged === true).length;
  const activeCount = alerts.length - acknowledgedCount;

  return (
    <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--warning-text)]" />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Alerts</p>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Recent Notifications</h3>
          </div>
        </div>
        <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/80 px-3 py-1 text-xs text-[var(--text-secondary)]">
          {activeCount} active · {acknowledgedCount} acknowledged
        </span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border-color)] px-4 py-6 text-sm text-[var(--text-muted)]">
            No alerts yet.
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <article
              key={alert.id || `${alert.ts}-${alert.sensor}`}
              className={`rounded-lg border px-4 py-3 ${severityClasses[alert.severity] || severityClasses.INFO} ${alert.acknowledged ? "opacity-50" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {alert.acknowledged ? <CheckCircle size={14} className="text-emerald-400" /> : null}
                  <span>{alert.message || "Alert triggered"}</span>
                </div>
                <span className="rounded-full border border-current px-2 py-0.5 text-[11px] uppercase tracking-[0.18em]">
                  {alert.severity || "INFO"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                <span>Sensor: {alert.sensor || "--"}</span>
                <span>Value: {alert.value ?? "--"}</span>
                <span>Time: {formatTime(alert.ts)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}