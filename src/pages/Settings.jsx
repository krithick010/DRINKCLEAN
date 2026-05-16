import { useEffect, useState } from "react";
import { Download, Zap, Database, Droplets, RotateCcw, Save } from "lucide-react";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { useThresholds } from "../hooks/useThresholds";
import { updateRefrigerant, updateThresholds } from "../api";
import { exportCSV } from "../utils/exportCSV";
import { thresholds as defaultThresholds } from "../utils/thresholds";

function cloneThresholds(source) {
  return JSON.parse(JSON.stringify(source));
}

function formatThresholdLabel(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const thresholdSectionOrder = ["temperature", "pressure", "water_quality", "flow", "power", "solar"];

const thresholdSectionTitles = {
  temperature: "Temperature Thresholds",
  pressure: "Pressure Thresholds",
  water_quality: "Water Quality Thresholds",
  flow: "Flow Thresholds",
  power: "Power Thresholds",
  solar: "Solar Thresholds",
};

export function Settings() {
  const history = useHistoryData(100);
  const { data, lastUpdated } = useSensorData();
  const mergedThresholds = useThresholds();
  const [rate, setRate] = useState(localStorage.getItem("electricityRate") || "8.5");
  const [selectedRefrigerant, setSelectedRefrigerant] = useState(data?.system?.refrigerant || "R134a");
  const [saving, setSaving] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [editedThresholds, setEditedThresholds] = useState(() => cloneThresholds(defaultThresholds));

  useEffect(() => {
    setEditedThresholds(cloneThresholds(mergedThresholds));
  }, [mergedThresholds]);

  useEffect(() => {
    if (data?.system?.refrigerant) {
      setSelectedRefrigerant(data.system.refrigerant);
    }
  }, [data?.system?.refrigerant]);

  const saveRate = (event) => {
    const nextRate = event.target.value;
    setRate(nextRate);
    localStorage.setItem("electricityRate", nextRate);
  };

  const saveRefrigerant = async () => {
    setSaving(true);
    try {
      await updateRefrigerant(selectedRefrigerant);
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error("Failed to save refrigerant:", error);
      setSaving(false);
    }
  };

  const updateThresholdValue = (categoryKey, sensorKey, fieldKey, nextValue) => {
    setEditedThresholds((current) => ({
      ...current,
      [categoryKey]: {
        ...current[categoryKey],
        [sensorKey]: {
          ...current[categoryKey][sensorKey],
          [fieldKey]: nextValue === "" ? "" : Number(nextValue),
        },
      },
    }));
  };

  const saveThresholdsClick = async () => {
    setSavingThresholds(true);
    try {
      await updateThresholds(editedThresholds);
      setTimeout(() => setSavingThresholds(false), 500);
    } catch (error) {
      console.error("Failed to save thresholds:", error);
      setSavingThresholds(false);
    }
  };

  const resetThresholds = () => {
    setEditedThresholds(cloneThresholds(defaultThresholds));
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
          <p className="mt-2 text-xs text-slate-500">Saved locally in database</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <Droplets size={16} />
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Alert Thresholds</p>
            </div>
            <h4 className="mt-2 text-lg font-semibold text-slate-50">Editable alert configuration</h4>
            <p className="mt-1 text-sm text-slate-400">Changes are saved locally in the database.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetThresholds}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:border-slate-600 hover:text-slate-100"
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={saveThresholdsClick}
              disabled={savingThresholds}
              className="flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
            >
              <Save size={16} />
              {savingThresholds ? "Saving..." : "Save Thresholds"}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {thresholdSectionOrder.map((categoryKey) => {
            const section = editedThresholds[categoryKey];

            if (!section) {
              return null;
            }

            return (
              <div key={categoryKey} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h5 className="text-sm font-semibold text-slate-100">{thresholdSectionTitles[categoryKey]}</h5>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{categoryKey}</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(section).map(([sensorKey, sensorRules]) => (
                    <div key={sensorKey} className="rounded-lg border border-slate-800 bg-[#111827] p-4">
                      <h6 className="text-sm font-medium text-slate-200">{formatThresholdLabel(sensorKey)}</h6>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {Object.entries(sensorRules).map(([fieldKey, fieldValue]) => (
                          <label key={fieldKey} className="space-y-1 text-xs text-slate-400">
                            <span>{formatThresholdLabel(fieldKey)}</span>
                            <input
                              type="number"
                              step="any"
                              value={fieldValue}
                              onChange={(event) => updateThresholdValue(categoryKey, sensorKey, fieldKey, event.target.value)}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
            <span className="text-slate-500">Server Status:</span>
            <span className="font-mono text-green-400">Connected (Local)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Database:</span>
            <span className="truncate font-mono text-xs">localhost:3001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
