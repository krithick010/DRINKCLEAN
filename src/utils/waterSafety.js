function toNumeric(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function computeWaterSafetyScore(waterQuality = {}) {
  const tds = toNumeric(waterQuality.tds);
  const ph = toNumeric(waterQuality.ph);
  const salinity = toNumeric(waterQuality.salinity);
  const conductivity = toNumeric(waterQuality.conductivity);
  const reasons = [];

  let score = "SAFE";

  if (tds !== null && tds > 1000) {
    score = "UNSAFE";
    reasons.push(`TDS ${tds.toFixed(0)} ppm exceeds 1000 ppm limit`);
  } else if (tds !== null && tds > 500) {
    score = "BORDERLINE";
    reasons.push(`TDS ${tds.toFixed(0)} ppm exceeds 500 ppm limit`);
  }

  if (ph !== null && (ph < 6.5 || ph > 8.5)) {
    score = "UNSAFE";
    reasons.push(`pH ${ph.toFixed(2)} is outside safe range 6.5 to 8.5`);
  } else if (ph !== null && (ph < 6.8 || ph > 8.0)) {
    if (score !== "UNSAFE") {
      score = "BORDERLINE";
    }
    reasons.push(`pH ${ph.toFixed(2)} is outside preferred range 6.8 to 8.0`);
  }

  if (salinity !== null && salinity > 1000) {
    if (score !== "UNSAFE") {
      score = "BORDERLINE";
    }
    reasons.push(`Salinity ${salinity.toFixed(0)} exceeds 1000 threshold`);
  }

  if (score === "SAFE") {
    reasons.length = 0;
  }

  const color =
    score === "SAFE"
      ? "#22c55e"
      : score === "BORDERLINE"
        ? "#f59e0b"
        : "#ef4444";

  return {
    score,
    reasons,
    color,
    metrics: {
      tds,
      ph,
      salinity,
      conductivity,
    },
  };
}