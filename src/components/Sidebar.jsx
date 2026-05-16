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
  History,
} from "lucide-react";

const navigationItems = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/temperature", label: "Temperature", icon: ThermometerSun },
  { to: "/pressure", label: "Pressure", icon: Gauge },
  { to: "/water-quality", label: "Water Quality", icon: Droplets },
  { to: "/solar", label: "Solar", icon: SunMedium },
  { to: "/power", label: "Power", icon: Power },
  { to: "/compressor", label: "Compressor", icon: Wind },
  { to: "/refrigerant-analysis", label: "Refrigerant Analysis", icon: FlaskConical },
  { to: "/history", label: "History", icon: History },
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
            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-text)] shadow-[0_0_0_1px_rgba(0,212,255,0.15)]"
            : "border-[var(--border-color)] bg-[var(--bg-card)]/70 text-[var(--text-secondary)] hover:border-[var(--border-color-strong)] hover:bg-[var(--bg-card)]/80 hover:text-[var(--text-primary)]",
        ].join(" ")
      }
    >
      <Icon size={16} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onClose }) {
  const handleNavClick = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <>
      <div className="border-b border-[var(--border-color)] px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)] shadow-[0_0_24px_rgba(0,212,255,0.12)]">
            <FlaskConical size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
              DRINKCLEAN
            </p>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Solar Desalination
            </h1>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 text-[var(--accent)]">
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
          <div key={item.to} onClick={handleNavClick}>
            <NavItem {...item} />
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border-color)] px-5 py-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Waves size={14} />
          <span>PhD mechanical engineering project</span>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ isOpen = false, onClose }) {
  return (
    <>
      <aside className="hidden h-full w-full flex-col border-r border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-primary)] md:flex">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-50 flex md:hidden ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <aside
          className={`relative h-full w-[280px] flex-col border-r border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-primary)] transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "translate-x-[-100%]"
          }`}
        >
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
}