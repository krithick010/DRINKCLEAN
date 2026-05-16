import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import { RefrigerantAnalysis } from "./pages/RefrigerantAnalysis";
import { HistoryExplorer } from "./pages/HistoryExplorer";
import { Settings } from "./pages/Settings";
import { useSensorData } from "./hooks/useSensorData";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { computeWaterSafetyScore } from "./utils/waterSafety";

function AppShell() {
  const { data, lastUpdated, isOnline } = useSensorData();
  const { theme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const refrigerant = data?.system?.refrigerant || "--";
  const uptime = data?.system?.uptime || "--";
  const waterSafetyScore = computeWaterSafetyScore(data?.water_quality || {}).score;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div data-theme={theme} className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] md:grid md:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col">
        <TopBar
          isOnline={isOnline}
          lastUpdated={lastUpdated}
          refrigerant={refrigerant}
          uptime={uptime}
          waterSafetyScore={waterSafetyScore}
          onMenuClick={() => setSidebarOpen(true)}
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
            <Route path="/refrigerant-analysis" element={<RefrigerantAnalysis />} />
            <Route path="/history" element={<HistoryExplorer />} />
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
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}