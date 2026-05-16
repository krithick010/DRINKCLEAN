import { Activity, Clock3, Menu, Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { formatRelativeTime } from "../utils/formatters";
import { useTheme } from "../context/ThemeContext";

function StatusPill({ isOnline }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        isOnline
          ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]"
          : "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
      ].join(" ")}
    >
      {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

export function TopBar({
  isOnline = true,
  lastUpdated = null,
  refrigerant = "--",
  uptime = "--",
  waterSafetyScore = "SAFE",
  onMenuClick,
}) {
  const { theme, toggleTheme } = useTheme();
  const waterSafetyColor =
    waterSafetyScore === "SAFE"
      ? "bg-green-500"
      : waterSafetyScore === "BORDERLINE"
        ? "bg-amber-500"
        : waterSafetyScore === "UNSAFE"
          ? "bg-red-500"
          : "bg-slate-500";

  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border-color)] bg-[var(--bg-app)]/90 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
          <span className={`h-2 w-2 rounded-full ${waterSafetyColor}`} />
          <span>DRINKCLEAN</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800 md:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu size={16} className="text-[var(--text-primary)]" />
          </button>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Solar Desalination Monitoring</h2>
          <StatusPill isOnline={isOnline} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-2">
            <Activity size={14} className="text-[var(--accent)]" />
            <span>Refrigerant: {refrigerant}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} className="text-[var(--accent)]" />
            <span>Uptime: {uptime}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} className="text-[var(--accent)]" />
            <span>Last updated: {lastUpdated ? formatRelativeTime(lastUpdated) : "--"}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={16} className="text-[var(--text-primary)]" /> : <Moon size={16} className="text-[var(--text-primary)]" />}
        </button>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-secondary)] shadow-[0_0_18px_rgba(0,212,255,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">System Context</p>
          <p className="mt-1 font-medium text-[var(--text-primary)]">Heat pump assisted solar thermal desalination</p>
        </div>
      </div>
    </header>
  );
}