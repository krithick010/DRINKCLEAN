import { useEffect, useState } from "react";
import { limitToLast, onValue, orderByKey, query, ref } from "firebase/database";
import { db } from "../firebase";

export function useHistoryData(limit = 50) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const historyRef = query(ref(db, "/history"), orderByKey(), limitToLast(limit));

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const raw = snapshot.val();

      if (!raw) {
        setHistory([]);
        return;
      }

      const entries = Object.values(raw).sort((a, b) => a.ts - b.ts);
      setHistory(entries);
    });

    return () => unsubscribe();
  }, [limit]);

  return history;
}