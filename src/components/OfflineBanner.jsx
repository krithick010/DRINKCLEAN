import { WifiOff, AlertTriangle } from "lucide-react";

export function OfflineBanner({ lastUpdated = null, type = "connection" }) {
  const isStale = lastUpdated && (Date.now() - lastUpdated.getTime()) > 30000;
  
  if (type === "stale" && !isStale) return null;

  const config = {
    connection: {
      icon: WifiOff,
      title: "Connection Lost",
      message: "Unable to connect to Firebase. Check your internet connection.",
      color: "red",
    },
    stale: {
      icon: AlertTriangle,
      title: "Data Outdated",
      message: `Last update was ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago. System may be offline.`,
      color: "yellow",
    },
  };

  const { icon: Icon, title, message, color } = config[type] || config.connection;
  const colorClasses = {
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color]} px-4 py-3`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}
