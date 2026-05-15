import { useEffect, useState } from "react";
import { onValue, ref, remove } from "firebase/database";
import { Trash2, AlertTriangle } from "lucide-react";
import { db } from "../firebase";
import { formatTime } from "../utils/formatters";

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const alertsRef = ref(db, "/alerts");
    return onValue(alertsRef, (snapshot) => {
      const raw = snapshot.val();
      const next = raw ? Object.entries(raw).map(([id, value]) => ({ id, ...value })) : [];
      next.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setAlerts(next);
    });
  }, []);

  const clearAllAlerts = async () => {
    if (!confirm("Clear all alerts? This cannot be undone.")) return;
    setClearing(true);
    try {
      await remove(ref(db, "/alerts"));
      setTimeout(() => setClearing(false), 500);
    } catch (error) {
      console.error("Failed to clear alerts:", error);
      setClearing(false);
    }
  };

  const filteredAlerts = filter === "all" 
    ? alerts 
    : alerts.filter(a => a.severity?.toLowerCase() === filter.toLowerCase());

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
          <p className="mt-1 text-sm text-slate-400">Real-time alert log from Firebase ({alerts.length} total)</p>
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
        {["all", "CRITICAL", "WARNING", "INFO"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === f
                ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                : "border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {f === "all" ? "All" : f}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle size={24} className="text-slate-600" />
                    <span>No alerts {filter !== "all" ? `with severity "${filter}"` : "recorded"}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{formatTime(alert.ts * 1000)}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{alert.sensor || "--"}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{alert.value ?? "--"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity || "INFO"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{alert.message || "--"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
