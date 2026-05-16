import { useEffect, useState } from "react";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { getAlerts, deleteAllAlerts, updateAlert } from "../api";
import { formatTime } from "../utils/formatters";

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        if (isMounted) {
          const next = Array.isArray(data) ? data : [];
          next.sort((a, b) => (b.ts || 0) - (a.ts || 0));
          setAlerts(next);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const clearAllAlerts = async () => {
    if (!confirm("Clear all alerts? This cannot be undone.")) return;
    setClearing(true);
    try {
      await deleteAllAlerts();
      setAlerts([]);
      setTimeout(() => setClearing(false), 500);
    } catch (error) {
      console.error("Failed to clear alerts:", error);
      setClearing(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await updateAlert(alertId, {
        acknowledged: true,
        ack_ts: Date.now(),
      });
      // Refetch alerts
      const data = await getAlerts();
      const next = Array.isArray(data) ? data : [];
      next.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setAlerts(next);
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const activeAlerts = alerts.filter((alert) => alert.acknowledged !== true);
  const historyAlerts = [...alerts].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const visibleAlerts = activeTab === "active" ? activeAlerts : historyAlerts;

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: "text-red-400 bg-red-500/10",
      WARNING: "text-yellow-400 bg-yellow-500/10",
      INFO: "text-blue-400 bg-blue-500/10",
    };
    return colors[severity] || colors.INFO;
  };

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Alerts</h3>
          <p className="mt-1 text-sm text-slate-400">Real-time alert log ({alerts.length} total)</p>
        </div>
        <button
          type="button"
          onClick={clearAllAlerts}
          disabled={clearing || alerts.length === 0}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {clearing ? "Clearing..." : "Clear All"}
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { key: "active", label: "Active" },
          { key: "history", label: "History" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-1 text-sm ${
              activeTab === tab.key
                ? "border border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                : "border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/70 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Sensor</th>
              <th className="px-4 py-3 text-left font-medium">Value</th>
              <th className="px-4 py-3 text-left font-medium">Severity</th>
              <th className="px-4 py-3 text-left font-medium">Message</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {visibleAlerts.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle size={24} className="text-slate-600" />
                    <span>{activeTab === "active" ? "No active alerts" : "No alerts recorded"}</span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleAlerts.map((alert) => (
                <tr key={alert.id} className={`hover:bg-slate-900/50 ${alert.acknowledged ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{formatTime(alert.ts * 1000)}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{alert.sensor || "--"}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{alert.value ?? "--"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity || "INFO"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="flex items-center gap-2">
                      {alert.acknowledged ? <CheckCircle size={14} className="text-emerald-400" /> : null}
                      <span>{alert.message || "--"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {alert.acknowledged ? (
                      <span className="text-xs font-medium text-emerald-400">Acknowledged</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/20"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
