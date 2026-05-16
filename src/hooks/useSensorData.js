import { useEffect, useState } from "react";
import { getSensorData, getThresholds } from "../api";

export function useSensorData() {
  const [data, setData] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const sensorData = await getSensorData();
        if (isMounted) {
          setData(sensorData);
          setLastUpdated(new Date());
          setIsOnline(true);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setIsOnline(false);
          setLoading(false);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const thresholdsData = await getThresholds();
        if (isMounted) {
          setThresholds(thresholdsData);
        }
      } catch (err) {
        if (isMounted) {
          setThresholds(null);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, thresholds, loading, error, lastUpdated, isOnline };
}