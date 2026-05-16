import { useEffect, useState } from "react";
import { getHistory } from "../api";

export function useHistoryData(limit = 50) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchHistory = async () => {
      try {
        const data = await getHistory(limit);
        if (isMounted) {
          const entries = Array.isArray(data)
            ? data.sort((a, b) => (a.ts || 0) - (b.ts || 0))
            : [];
          setHistory(entries);
        }
      } catch (err) {
        if (isMounted) {
          setHistory([]);
        }
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  return history;
}