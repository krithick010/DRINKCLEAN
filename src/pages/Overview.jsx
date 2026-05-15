import { Droplets, Gauge, Power, SunMedium, ThermometerSun, FlaskConical, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { AlertPanel } from "../components/AlertPanel";
import { SensorCard } from "../components/SensorCard";
import { TrendChart } from "../components/TrendChart";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OfflineBanner } from "../components/OfflineBanner";
import { useHistoryData } from "../hooks/useHistoryData";
import { useSensorData } from "../hooks/useSensorData";
import { db } from "../firebase";
import { getStatus } from "../utils/thresholds";

function getHistorySeries(history, key) {
  return history.map((entry) => ({
    ...entry,
    timeLabel: entry.ts
      ? new Date(entry.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--",
    [key]: entry[key],
  }));
}

export function Overview() {
  const { data, loading, error, lastUpdated, isOnline } = useSensorData();
  const history = useHistoryData(50);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(db, "/alerts");
    return onValue(alertsRef, (snapshot) => {
      const raw = snapshot.val();
      const next = raw ? Object.entries(raw).map(([id, value]) => ({ id, ...value })) : [];
      next.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setAlerts(next.slice(0, 5));
    });
  }, []);

  const temperature = data?.temperature || {};
  const pressure = data?.pressure || {};
  const flow = data?.flow || {};
  const waterQuality = data?.water_quality || {};
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

  const cards = [
    {
      label: "Solar Irradiance",
      value: solar.irradiance,
      unit: "W/m²",
      status: solar.irradiance === null || solar.irradiance === undefined ? "offline" : "normal",
      icon: SunMedium,
    },
    {
      label: "Compressor Status",
      value: compressor.status || "--",
      unit: "",
      status: compressor.status === "ON" ? "normal" : "offline",
      icon: Activity,
    },
    {
      label: "Power Consumption",
      value: power.power_consumption,
      unit: "W",
      status: power.power_consumption > 1000 ? "warning" : "normal",
      icon: Power,
    },
    {
      label: "Feed Water Flow",
      value: flow.feed_water_flow,
      unit: "L/min",
      status: flow.feed_water_flow > 3 ? "warning" : "normal",
      icon: Droplets,
    },
    {
      label: "Purified Water Flow",
      value: flow.purified_water_flow,
      unit: "L/min",
      status: flow.purified_water_flow > 2 ? "warning" : "normal",
      icon: Droplets,
    },
    {
      label: "TDS",
      value: waterQuality.tds,
      unit: "ppm",
      status: getStatus("water_quality", "tds", waterQuality.tds),
      icon: FlaskConical,
    },
    {
      label: "pH",
      value: waterQuality.ph,
      unit: "",
      status: getStatus("water_quality", "ph", waterQuality.ph),
      icon: FlaskConical,
      digits: 2,
    },
    {
      label: "Evaporator Temp",
      value: temperature.evaporator,
      unit: "°C",
      status: getStatus("temperature", "evaporator", temperature.evaporator),
      icon: ThermometerSun,
    },
    {
      label: "Condenser Temp",
      value: temperature.condenser,
      unit: "°C",
      status: getStatus("temperature", "condenser", temperature.condenser),
      icon: ThermometerSun,
    },
    {
      label: "Solar Collector Temp",
      value: temperature.solar_collector,
      unit: "°C",
      status: temperature.solar_collector > 90 ? "warning" : "normal",
      icon: ThermometerSun,
    },
    {
      label: "Suction Pressure",
      value: pressure.suction,
      unit: "bar",
      status: getStatus("pressure", "suction", pressure.suction),
      icon: Gauge,
    },
    {
      label: "Discharge Pressure",
      value: pressure.discharge,
      unit: "bar",
      status: getStatus("pressure", "discharge", pressure.discharge),
      icon: Gauge,
    },
  ];

  return (
    <div className="space-y-6 p-5">
      <div>
        <h3 className="text-2xl font-semibold text-slate-50">Overview Dashboard</h3>
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

        <AlertPanel alerts={alerts} />
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