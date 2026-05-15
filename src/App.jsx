import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Overview } from "./pages/Overview";
import { Temperature } from "./pages/Temperature";
import { Pressure } from "./pages/Pressure";
import { WaterQuality } from "./pages/WaterQuality";
import { Solar } from "./pages/Solar";
import { Power } from "./pages/Power";
import { Compressor } from "./pages/Compressor";
import { Alerts } from "./pages/Alerts";
import { Settings } from "./pages/Settings";
import { useSensorData } from "./hooks/useSensorData";

function AppShell() {
  const { data, lastUpdated, isOnline } = useSensorData();
  const refrigerant = data?.system?.refrigerant || "--";
  const uptime = data?.system?.uptime || "--";

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 md:grid md:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <TopBar
          isOnline={isOnline}
          lastUpdated={lastUpdated}
          refrigerant={refrigerant}
          uptime={uptime}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/temperature" element={<Temperature />} />
            <Route path="/pressure" element={<Pressure />} />
            <Route path="/water-quality" element={<WaterQuality />} />
            <Route path="/solar" element={<Solar />} />
            <Route path="/power" element={<Power />} />
            <Route path="/compressor" element={<Compressor />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}