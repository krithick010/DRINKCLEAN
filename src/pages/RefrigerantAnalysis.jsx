import { FlaskConical } from "lucide-react";
import { TrendChart } from "../components/TrendChart";
import { useHistoryData } from "../hooks/useHistoryData";
import { calculateCOP } from "../utils/calculations";
import { formatNumber } from "../utils/formatters";

const refrigerantGroups = [
  { key: "R134a", label: "R134a", color: "#00d4ff" },
  { key: "Zeotropic Mix", label: "Zeotropic Mix", color: "#f59e0b" },
];

function average(values) {
  const finiteValues = values.filter((value) => Number.isFinite(value));

  if (finiteValues.length === 0) {
    return null;
  }

  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function normalizeRefrigerant(value) {
  const refrigerant = String(value || "").trim().toLowerCase();

  if (refrigerant === "r134a") {
    return "R134a";
  }

  if (refrigerant === "zeotropic mix" || refrigerant === "zeotropic") {
    return "Zeotropic Mix";
  }

  return null;
}

function formatMetricValue(value, digits = 2) {
  return Number.isFinite(value) ? formatNumber(value, digits) : "--";
}

function comparisonClass(isBetter) {
  return isBetter ? "text-green-400" : "text-slate-200";
}

export function RefrigerantAnalysis() {
  const history = useHistoryData(200);

  // History schema note: each /history/r_{ts} record should include refrigerant alongside ts, t_ev, t_co, tds, and pwr.
  const groupedHistory = refrigerantGroups.reduce((accumulator, group) => {
    accumulator[group.key] = history.filter((entry) => normalizeRefrigerant(entry.refrigerant) === group.key);
    return accumulator;
  }, {});

  const metrics = refrigerantGroups.map((group) => {
    const entries = groupedHistory[group.key];
    const avgCop = average(
      entries.map((entry) => calculateCOP(entry.t_co, entry.t_ev))
    );
    const avgPower = average(entries.map((entry) => entry.pwr));
    const avgTds = average(entries.map((entry) => entry.tds));

    return {
      ...group,
      entries,
      avgCop,
      avgPower,
      avgTds,
      sampleCount: entries.length,
    };
  });

  const r134a = metrics[0];
  const zeotropic = metrics[1];

  const comparisonRows = [
    {
      label: "Avg COP",
      values: [r134a.avgCop, zeotropic.avgCop],
      better: r134a.avgCop === zeotropic.avgCop ? "both" : r134a.avgCop > zeotropic.avgCop ? 0 : 1,
      formatter: (value) => formatMetricValue(value, 2),
    },
    {
      label: "Avg Power (W)",
      values: [r134a.avgPower, zeotropic.avgPower],
      better: r134a.avgPower === zeotropic.avgPower ? "both" : r134a.avgPower < zeotropic.avgPower ? 0 : 1,
      formatter: (value) => formatMetricValue(value, 2),
    },
    {
      label: "Avg TDS (ppm)",
      values: [r134a.avgTds, zeotropic.avgTds],
      better: r134a.avgTds === zeotropic.avgTds ? "both" : r134a.avgTds < zeotropic.avgTds ? 0 : 1,
      formatter: (value) => formatMetricValue(value, 2),
    },
    {
      label: "Sample Count",
      values: [r134a.sampleCount, zeotropic.sampleCount],
      better: r134a.sampleCount === zeotropic.sampleCount ? "both" : r134a.sampleCount > zeotropic.sampleCount ? 0 : 1,
      formatter: (value) => (Number.isFinite(value) ? String(Math.round(value)) : "--"),
    },
  ];

  const chartData = history
    .slice()
    .sort((a, b) => (a.ts || 0) - (b.ts || 0))
    .map((entry) => {
      const refrigerant = normalizeRefrigerant(entry.refrigerant);

      return {
        ts: entry.ts,
        timeLabel: entry.ts
          ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "--",
        r134aPower: refrigerant === "R134a" ? entry.pwr ?? null : null,
        zeotropicPower: refrigerant === "Zeotropic Mix" ? entry.pwr ?? null : null,
      };
    });

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(0,212,255,0.12)]">
          <FlaskConical size={20} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-slate-50">Refrigerant Analysis</h3>
          <p className="mt-1 text-sm text-slate-400">
            Compare refrigerant performance using the latest history records.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/70 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Metric</th>
              <th className="px-4 py-3 text-left font-medium">R134a</th>
              <th className="px-4 py-3 text-left font-medium">Zeotropic Mix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {comparisonRows.map((row) => (
              <tr key={row.label} className="hover:bg-slate-900/50">
                <td className="px-4 py-3 font-medium text-slate-200">{row.label}</td>
                {row.values.map((value, index) => {
                  const isBest = row.better === "both" || row.better === index;

                  return (
                    <td
                      key={`${row.label}-${index}`}
                      className={`px-4 py-3 font-mono text-slate-300 ${comparisonClass(isBest)}`}
                    >
                      {row.formatter(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TrendChart
        data={chartData}
        label="Power Consumption Comparison"
        xKey="timeLabel"
        type="line"
        series={[
          { dataKey: "r134aPower", color: "#00d4ff", label: "R134a" },
          { dataKey: "zeotropicPower", color: "#f59e0b", label: "Zeotropic Mix" },
        ]}
      />
    </div>
  );
}