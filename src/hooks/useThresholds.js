import { useEffect, useState } from "react";
import { getThresholds } from "../api";
import { thresholds as defaultThresholds } from "../utils/thresholds";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeThresholds(base, overrides) {
  if (!isPlainObject(overrides)) {
    return JSON.parse(JSON.stringify(base));
  }

  const merged = JSON.parse(JSON.stringify(base));

  for (const [key, value] of Object.entries(overrides)) {
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      merged[key] = mergeThresholds(merged[key], value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

export function useThresholds() {
  const [firebaseThresholds, setFirebaseThresholds] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const thresholdsData = await getThresholds();
        if (isMounted) {
          setFirebaseThresholds(thresholdsData);
        }
      } catch (err) {
        if (isMounted) {
          setFirebaseThresholds(null);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return mergeThresholds(defaultThresholds, firebaseThresholds);
}