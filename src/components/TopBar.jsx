import { Activity, Clock3, Wifi, WifiOff } from "lucide-react";
import { formatRelativeTime } from "../utils/formatters";

function StatusPill({ isOnline }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        isOnline
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300",
      ].join(" ")}
    >
      {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

export function TopBar({ isOnline = true, lastUpdated = null, refrigerant = "--", uptime = "--" }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-[#0a0f1e]/90 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-50">Solar Desalination Monitoring</h2>
          <StatusPill isOnline={isOnline} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Activity size={14} className="text-cyan-300" />
            <span>Refrigerant: {refrigerant}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} className="text-cyan-300" />
            <span>Uptime: {uptime}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} className="text-cyan-300" />
            <span>Last updated: {lastUpdated ? formatRelativeTime(lastUpdated) : "--"}</span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-slate-300 shadow-[0_0_18px_rgba(0,212,255,0.06)]">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">System Context</p>
        <p className="mt-1 font-medium text-slate-100">Heat pump assisted solar thermal desalination</p>
      </div>
    </header>
  );
}