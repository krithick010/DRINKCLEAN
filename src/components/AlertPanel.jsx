import { AlertTriangle } from "lucide-react";
import { formatTime } from "../utils/formatters";

const severityClasses = {
  INFO: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  WARNING: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  CRITICAL: "border-red-500/40 bg-red-500/10 text-red-200",
};

export function AlertPanel({ alerts = [] }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-300" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Alerts</p>
          <h3 className="text-base font-semibold text-slate-100">Recent Notifications</h3>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500">
            No alerts yet.
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <article
              key={alert.id || `${alert.ts}-${alert.sensor}`}
              className={`rounded-lg border px-4 py-3 ${severityClasses[alert.severity] || severityClasses.INFO}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{alert.message || "Alert triggered"}</div>
                <span className="rounded-full border border-current px-2 py-0.5 text-[11px] uppercase tracking-[0.18em]">
                  {alert.severity || "INFO"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200/80">
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