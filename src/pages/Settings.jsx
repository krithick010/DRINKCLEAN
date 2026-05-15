import { useState } from "react";
import { ref, set } from "firebase/database";
import { Download, Zap, Database, Droplets } from "lucide-react";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { db } from "../firebase";

function exportCSV(history) {
  const headers = ["timestamp", "t_ev", "t_co", "t_sc", "p_su", "p_di", "tds", "ph", "sol", "pwr"];
  const rows = history.map((item) => {
    const timestamp = item.ts ? new Date(item.ts * 1000).toISOString() : "";
    return [timestamp, item.t_ev, item.t_co, item.t_sc, item.p_su, item.p_di, item.tds, item.ph, item.sol, item.pwr]
      .map(v => v ?? "")
      .join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `desalination_data_${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Settings() {
  const history = useHistoryData(100);
  const { data, lastUpdated } = useSensorData();
  const [rate, setRate] = useState(localStorage.getItem("electricityRate") || "8.5");
  const [selectedRefrigerant, setSelectedRefrigerant] = useState(data?.system?.refrigerant || "R134a");
  const [saving, setSaving] = useState(false);

  const saveRate = (event) => {
    const nextRate = event.target.value;
    setRate(nextRate);
    localStorage.setItem("electricityRate", nextRate);
  };

  const saveRefrigerant = async () => {
    setSaving(true);
    try {
      await set(ref(db, "/sensorData/system/refrigerant"), selectedRefrigerant);
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error("Failed to save refrigerant:", error);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div>
        <h3 className="text-2xl font-semibold">Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configuration, export tools, and system metadata.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap size={16} />
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Electricity Rate</p>
          </div>
          <div className="mt-3">
            <input
              type="number"
              step="0.1"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              value={rate}
              onChange={saveRate}
              placeholder="8.5"
            />
            <p className="mt-2 text-xs text-slate-500">₹ per kWh (saved locally)</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Droplets size={16} />
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Refrigerant Type</p>
          </div>
          <div className="mt-3 flex gap-2">
            <select
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              value={selectedRefrigerant}
              onChange={(e) => setSelectedRefrigerant(e.target.value)}
            >
              <option value="R134a">R134a</option>
              <option value="Zeotropic Mix">Zeotropic Mix</option>
              <option value="R410A">R410A</option>
              <option value="R32">R32</option>
            </select>
            <button
              type="button"
              onClick={saveRefrigerant}
              disabled={saving}
              className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Writes to Firebase /sensorData/system/refrigerant</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex items-center gap-2 text-slate-400">
          <Download size={16} />
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Export Data</p>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => exportCSV(history)}
            className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/20"
          >
            <div className="flex items-center gap-2">
              <Download size={16} />
              <span>Export CSV</span>
            </div>
          </button>
          <p className="text-sm text-slate-400">Last {history.length} history entries</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex items-center gap-2 text-slate-400">
          <Database size={16} />
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">System Info</p>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Refrigerant:</span>
            <span className="font-mono">{data?.system?.refrigerant || "--"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last updated:</span>
            <span className="font-mono">{lastUpdated ? lastUpdated.toLocaleString() : "--"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">WiFi RSSI:</span>
            <span className="font-mono">{data?.system?.wifi_rssi ? `${data.system.wifi_rssi} dBm` : "--"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Uptime:</span>
            <span className="font-mono">{data?.system?.uptime || "--"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Firebase:</span>
            <span className="font-mono text-green-400">{import.meta.env.VITE_FIREBASE_API_KEY ? "Connected" : "Not configured"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Database URL:</span>
            <span className="truncate font-mono text-xs">{import.meta.env.VITE_FIREBASE_DATABASE_URL || "--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
