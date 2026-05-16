import { useEffect, useRef, useState } from "react";
import { useSensorData } from "./useSensorData";
import { getAllAlerts } from "../utils/thresholds";

function buildAlertSignature(alert) {
  return `${alert.sensor}|${alert.status}|${alert.value}|${alert.message}`;
}

export function useAlerts() {
  const { data } = useSensorData();
  const alertCacheRef = useRef(new Map());
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const nextRawAlerts = getAllAlerts(data);
    const nextSignatures = new Set();

    const nextAlerts = nextRawAlerts.map((alert) => {
      const signature = buildAlertSignature(alert);
      nextSignatures.add(signature);

      const cachedAlert = alertCacheRef.current.get(signature);
      if (cachedAlert) {
        return cachedAlert;
      }

      const createdAt = Math.floor(Date.now() / 1000);
      const nextAlert = {
        id: `${alert.sensor}_${Date.now()}`,
        ts: createdAt,
        ...alert,
      };

      alertCacheRef.current.set(signature, nextAlert);
      return nextAlert;
    });

    for (const signature of alertCacheRef.current.keys()) {
      if (!nextSignatures.has(signature)) {
        alertCacheRef.current.delete(signature);
      }
    }

    setAlerts(nextAlerts);
  }, [data]);

  const criticalCount = alerts.filter((alert) => alert.status === "critical").length;
  const warningCount = alerts.filter((alert) => alert.status === "warning").length;

  return { alerts, criticalCount, warningCount };
}