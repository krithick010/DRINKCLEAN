import { NavLink } from "react-router-dom";
import {
  Bell,
  BarChart3,
  Gauge,
  Home,
  Power,
  Settings,
  ThermometerSun,
  Waves,
  Wind,
  SunMedium,
  Droplets,
  FlaskConical,
} from "lucide-react";

const navigationItems = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/temperature", label: "Temperature", icon: ThermometerSun },
  { to: "/pressure", label: "Pressure", icon: Gauge },
  { to: "/water-quality", label: "Water Quality", icon: Droplets },
  { to: "/solar", label: "Solar", icon: SunMedium },
  { to: "/power", label: "Power", icon: Power },
  { to: "/compressor", label: "Compressor", icon: Wind },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all duration-200",
          isActive
            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_0_1px_rgba(0,212,255,0.15)]"
            : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-100",
        ].join(" ")
      }
    >
      <Icon size={16} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-800 bg-[#0a0f1e] text-slate-100">
      <div className="border-b border-slate-800 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(0,212,255,0.12)]">
            <FlaskConical size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              DRINKCLEAN
            </p>
            <h1 className="text-lg font-semibold text-slate-50">
              Solar Desalination
            </h1>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-cyan-300">
            <BarChart3 size={14} />
            <span>Research monitoring dashboard</span>
          </div>
          <p className="mt-2 leading-5">
            Live telemetry from Arduino, ESP8266, and Firebase.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {navigationItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 text-slate-400">
          <Waves size={14} />
          <span>PhD mechanical engineering project</span>
        </div>
      </div>
    </aside>
  );
}