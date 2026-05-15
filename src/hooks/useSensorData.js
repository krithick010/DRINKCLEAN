import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../firebase";

export function useSensorData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const sensorRef = ref(db, "/sensorData");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        setData(snapshot.val());
        setLastUpdated(new Date());
        setIsOnline(true);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsOnline(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error, lastUpdated, isOnline };
}