import { useMemo, useState } from "react";
import { CalendarRange, Download, History as HistoryIcon } from "lucide-react";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { exportCSV } from "../utils/exportCSV";

const seriesConfig = [
  { key: "t_ev", label: "Evaporator Temp", color: "#00d4ff" },
  { key: "t_co", label: "Condenser Temp", color: "#22c55e" },
  { key: "t_sc", label: "Solar Collector Temp", color: "#f59e0b" },
  { key: "p_su", label: "Suction Pressure", color: "#a78bfa" },
  { key: "p_di", label: "Discharge Pressure", color: "#fb7185" },
  { key: "tds", label: "TDS", color: "#38bdf8" },
  { key: "ph", label: "pH", color: "#34d399" },
  { key: "pwr", label: "Power", color: "#f97316" },
];

function formatTableValue(value, digits = 2) {
  return value === null || value === undefined || Number.isNaN(value)
    ? "--"
    : Number(value).toFixed(digits);
}

export function HistoryExplorer() {
  const history = useHistoryData(500);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedSeries, setSelectedSeries] = useState(() =>
    seriesConfig.reduce((accumulator, series) => {
      accumulator[series.key] = true;
      return accumulator;
    }, {})
  );

  const filteredHistory = useMemo(() => {
    if (!start && !end) {
      return history.slice(-100);
    }

    const startMs = start ? new Date(start).getTime() : null;
    const endMs = end ? new Date(end).getTime() : null;

    return history.filter((entry) => {
      const entryMs = entry.ts ? entry.ts * 1000 : null;
      if (!Number.isFinite(entryMs)) {
        return false;
      }

      if (startMs !== null && entryMs < startMs) {
        return false;
      }

      if (endMs !== null && entryMs > endMs) {
        return false;
      }

      return true;
    });
  }, [history, start, end]);

  const chartData = filteredHistory.map((entry) => ({
    ...entry,
    timeLabel: entry.ts
      ? new Date(entry.ts * 1000).toLocaleString([], {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--",
  }));

  const activeSeries = seriesConfig.filter((series) => selectedSeries[series.key]);

  const toggleSeries = (key) => {
    setSelectedSeries((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleExport = () => {
    exportCSV(filteredHistory, "history_explorer");
  };

  return (
    <div className="space-y-6 p-5 text-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(0,212,255,0.12)]">
          <HistoryIcon size={20} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold">History Explorer</h3>
          <p className="mt-1 text-sm text-slate-400">Filter and compare historical sensor trends.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="mb-3 flex items-center gap-2 text-slate-400">
            <CalendarRange size={16} />
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Date Range</p>
          </div>
          <div className="space-y-4">
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Start</span>
              <input
                type="datetime-local"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>End</span>
              <input
                type="datetime-local"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </label>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{filteredHistory.length} entries shown</span>
              <button
                type="button"
                onClick={() => {
                  setStart("");
                  setEnd("");
                }}
                className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 hover:border-slate-600 hover:text-slate-100"
              >
                Clear range
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <div className="mb-3 flex items-center gap-2 text-slate-400">
            <HistoryIcon size={16} />
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Series</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {seriesConfig.map((series) => (
              <label
                key={series.key}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-700 hover:text-slate-100"
              >
                <input
                  type="checkbox"
                  checked={selectedSeries[series.key]}
                  onChange={() => toggleSeries(series.key)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                <span>{series.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <TrendChart
        data={chartData}
        label="Filtered History Trends"
        xKey="timeLabel"
        type="line"
        series={activeSeries.map((series) => ({
          dataKey: series.key,
          color: series.color,
          label: series.label,
        }))}
      />

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Raw Data</p>
            <h3 className="text-base font-semibold text-slate-100">Filtered entries</h3>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredHistory.length === 0}
            className="flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="sticky top-0 bg-slate-900/95 text-slate-400 backdrop-blur">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium">t_ev</th>
                <th className="px-4 py-3 text-left font-medium">t_co</th>
                <th className="px-4 py-3 text-left font-medium">t_sc</th>
                <th className="px-4 py-3 text-left font-medium">p_su</th>
                <th className="px-4 py-3 text-left font-medium">p_di</th>
                <th className="px-4 py-3 text-left font-medium">TDS</th>
                <th className="px-4 py-3 text-left font-medium">pH</th>
                <th className="px-4 py-3 text-left font-medium">Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                    No entries match the current filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry) => (
                  <tr key={entry.ts} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {entry.ts ? new Date(entry.ts * 1000).toLocaleString() : "--"}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.t_ev)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.t_co)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.t_sc)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.p_su)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.p_di)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.tds)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.ph)}</td>
                    <td className="px-4 py-3 font-mono">{formatTableValue(entry.pwr)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}