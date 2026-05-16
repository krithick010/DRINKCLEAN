import { useEffect, useState } from "react";
import { getDailyStats } from "../api";

export function useDailyStats() {
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const stats = await getDailyStats();
        if (isMounted) {
          const entries = Array.isArray(stats)
            ? stats.sort((a, b) => (a.date || "").localeCompare(b.date || ""))
            : [];
          setDailyStats(entries);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setDailyStats([]);
          setLoading(false);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { dailyStats, loading };
}