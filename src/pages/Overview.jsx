import { Droplets, Gauge, Power, SunMedium, ThermometerSun, FlaskConical, Activity } from "lucide-react";
import { AlertPanel } from "../components/AlertPanel";
import { HealthPanel } from "../components/HealthPanel";
import { SensorCard } from "../components/SensorCard";
import { StatusBadge } from "../components/StatusBadge";
import { TrendChart } from "../components/TrendChart";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OfflineBanner } from "../components/OfflineBanner";
import { DailyStatsChart } from "../components/DailyStatsChart";
import { useAlerts } from "../hooks/useAlerts";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { useThresholds } from "../hooks/useThresholds";
import { calculateCOP, calculateWaterYield } from "../utils/calculations";
import { formatNumber } from "../utils/formatters";
import { getStatus } from "../utils/thresholds";
import { computeWaterSafetyScore } from "../utils/waterSafety";

function getHistoryValues(history, key) {
  return history
    .map((entry) => entry[key])
    .filter((value) => typeof value === "number" && !Number.isNaN(value))
    .slice(-10);
}

export function Overview() {
  const { data, loading, error, lastUpdated, isOnline } = useSensorData();
  const thresholds = useThresholds();
  const history = useHistoryData(50);
  const { alerts } = useAlerts();
  const alertPanelAlerts = alerts.map((alert) => ({
    ...alert,
    severity: alert.status.toUpperCase(),
  }));

  const temperature = data?.temperature || {};
  const pressure = data?.pressure || {};
  const flow = data?.flow || {};
  const waterQuality = data?.water_quality || {};
  const waterSafety = computeWaterSafetyScore(waterQuality);
  const solar = data?.solar || {};
  const power = data?.power || {};
  const compressor = data?.compressor || {};

  const chartData = history.map((entry) => ({
    ...entry,
    timeLabel: entry.ts
      ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--",
    t_ev: entry.t_ev ?? null,
    t_co: entry.t_co ?? null,
    sol: entry.sol ?? null,
  }));

  const estimatedCop = calculateCOP(temperature.condenser, temperature.evaporator);
  const waterYield = calculateWaterYield(flow.purified_water_flow, power.power_consumption);

  const cards = [
    {
      label: "Solar Irradiance",
      value: solar.irradiance,
      unit: "W/m²",
      status: solar.irradiance === null || solar.irradiance === undefined ? "offline" : "normal",
      icon: SunMedium,
      history: getHistoryValues(history, "sol"),
    },
    {
      label: "Compressor Status",
      value: compressor.status || "--",
      unit: "",
      status: compressor.status === "ON" ? "normal" : "offline",
      icon: Activity,
      history: [],
    },
    {
      label: "Power Consumption",
      value: power.power_consumption,
      unit: "W",
      status: power.power_consumption > 1000 ? "warning" : "normal",
      icon: Power,
      history: getHistoryValues(history, "pwr"),
    },
    {
      label: "Feed Water Flow",
      value: flow.feed_water_flow,
      unit: "L/min",
      status: flow.feed_water_flow > 3 ? "warning" : "normal",
      icon: Droplets,
      history: [],
    },
    {
      label: "Purified Water Flow",
      value: flow.purified_water_flow,
      unit: "L/min",
      status: flow.purified_water_flow > 2 ? "warning" : "normal",
      icon: Droplets,
      history: [],
    },
    {
      label: "TDS",
      value: waterQuality.tds,
      unit: "ppm",
      status: getStatus("water_quality", "tds", waterQuality.tds, thresholds),
      icon: FlaskConical,
      history: getHistoryValues(history, "tds"),
    },
    {
      label: "pH",
      value: waterQuality.ph,
      unit: "",
      status: getStatus("water_quality", "ph", waterQuality.ph, thresholds),
      icon: FlaskConical,
      digits: 2,
      history: getHistoryValues(history, "ph"),
    },
    {
      label: "Evaporator Temp",
      value: temperature.evaporator,
      unit: "°C",
      status: getStatus("temperature", "evaporator", temperature.evaporator, thresholds),
      icon: ThermometerSun,
      history: getHistoryValues(history, "t_ev"),
    },
    {
      label: "Condenser Temp",
      value: temperature.condenser,
      unit: "°C",
      status: getStatus("temperature", "condenser", temperature.condenser, thresholds),
      icon: ThermometerSun,
      history: getHistoryValues(history, "t_co"),
    },
    {
      label: "Solar Collector Temp",
      value: temperature.solar_collector,
      unit: "°C",
      status: temperature.solar_collector > 90 ? "warning" : "normal",
      icon: ThermometerSun,
      history: getHistoryValues(history, "t_sc"),
    },
    {
      label: "Suction Pressure",
      value: pressure.suction,
      unit: "bar",
      status: getStatus("pressure", "suction", pressure.suction, thresholds),
      icon: Gauge,
      history: getHistoryValues(history, "p_su"),
    },
    {
      label: "Discharge Pressure",
      value: pressure.discharge,
      unit: "bar",
      status: getStatus("pressure", "discharge", pressure.discharge, thresholds),
      icon: Gauge,
      history: getHistoryValues(history, "p_di"),
    },
  ];

  const kpis = [
    {
      label: "Estimated COP",
      value: estimatedCop,
      unit: "",
      note: "Carnot approximation",
    },
    {
      label: "Water Yield",
      value: waterYield,
      unit: "L/kWh",
      note: "Purified flow per energy used",
    },
  ];

  return (
    <div className="space-y-6 p-5">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold text-slate-50">Overview Dashboard</h3>
          <StatusBadge status={waterSafety.score} />
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Live system telemetry and recent trends from Firebase.
        </p>
      </div>

      {!isOnline && <OfflineBanner type="connection" />}
      {isOnline && <OfflineBanner type="stale" lastUpdated={lastUpdated} />}

      {loading ? (
        <LoadingSpinner message="Loading live sensor data..." />
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Connection issue: {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SensorCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-800 bg-[#111827] p-4 shadow-[0_0_12px_rgba(14,165,233,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm text-slate-400">{kpi.label}</div>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                KPI
              </span>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <div className="text-2xl font-semibold tracking-tight text-slate-50">
                {kpi.value === null || kpi.value === undefined ? "--" : formatNumber(kpi.value, 2)}
              </div>
              <div className="pb-1 text-sm text-slate-400">{kpi.unit}</div>
            </div>

            <p className="mt-2 text-xs text-slate-500">{kpi.note}</p>
          </article>
        ))}
      </div>

      <HealthPanel history={history} />

      <DailyStatsChart />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TrendChart
          data={chartData}
          label="Evaporator, Condenser, and Solar Trends"
          xKey="timeLabel"
          type="line"
          series={[
            { dataKey: "t_ev", color: "#00d4ff", label: "Evaporator" },
            { dataKey: "t_co", color: "#22c55e", label: "Condenser" },
            { dataKey: "sol", color: "#f59e0b", label: "Solar Irradiance" },
          ]}
        />

        <AlertPanel alerts={alertPanelAlerts} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 text-sm text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span>Online: {isOnline ? "Yes" : "No"}</span>
          <span>Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "--"}</span>
          <span>History points: {history.length}</span>
        </div>
      </div>
    </div>
  );
}