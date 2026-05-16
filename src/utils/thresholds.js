export const thresholds = {
  temperature: {
    evaporator: { warning: 55, critical: 70 },
    condenser: { warning: 80, critical: 95 },
    comp_outlet: { warning: 90, critical: 105 },
  },
  pressure: {
    suction: { min: 2, max: 5, criticalMax: 7 },
    discharge: { min: 10, max: 16, criticalMax: 20 },
  },
  flow: {
    feed_water_flow: { min: 0.5, max: 4 },
    purified_water_flow: { min: 0.1 },
  },
  power: {
    power_consumption: { warning: 800, critical: 1200 },
  },
  solar: {
    // Cross-field rule: only warn when the compressor is ON; handled in getAllAlerts.
    irradiance: { warning: 50 },
  },
  water_quality: {
    tds: { warning: 500, critical: 1000 },
    ph: { min: 6.5, max: 8.5 },
    salinity: { warning: 1000, critical: 2000 },
    conductivity: { warning: 800, critical: 1500 },
  },
};

export function getStatus(category, key, value, customThresholds = thresholds) {
  const rules = customThresholds?.[category]?.[key] ?? thresholds[category]?.[key];
  const min = rules?.min;
  const max = rules?.max;

  if (!rules || value === null || value === undefined || Number.isNaN(value)) {
    return "offline";
  }

  if (typeof min === "number" && typeof max === "number") {
    if (value < min || value > max) {
      return "warning";
    }
    return "normal";
  }

  if (typeof rules.critical === "number" && value >= rules.critical) {
    return "critical";
  }

  if (typeof rules.criticalMax === "number" && value >= rules.criticalMax) {
    return "critical";
  }

  if (typeof rules.warning === "number" && value >= rules.warning) {
    return "warning";
  }

  return "normal";
}

function createAlert(sensor, value, status, message) {
  return { sensor, value, status, message };
}

function formatRange(min, max) {
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);

  if (hasMin && hasMax) {
    return `${min} to ${max}`;
  }

  if (hasMin) {
    return `at least ${min}`;
  }

  if (hasMax) {
    return `at most ${max}`;
  }

  return "the allowed range";
}

function getAlertMessage(category, key, value, status, rules) {
  const sensor = `${category}.${key}`;

  if (typeof rules?.min === "number" && typeof rules?.max === "number") {
    return `${sensor} is ${value} outside the safe range ${formatRange(rules.min, rules.max)}.`;
  }

  if (status === "critical" && typeof rules?.critical === "number") {
    return `${sensor} is ${value} and exceeded the critical threshold of ${rules.critical}.`;
  }

  if (status === "critical" && typeof rules?.criticalMax === "number") {
    return `${sensor} is ${value} and exceeded the critical maximum of ${rules.criticalMax}.`;
  }

  if (status === "warning" && typeof rules?.warning === "number") {
    return `${sensor} is ${value} and exceeded the warning threshold of ${rules.warning}.`;
  }

  return `${sensor} is ${value} and requires attention.`;
}

export function getAllAlerts(data) {
  if (!data || typeof data !== "object") {
    return [];
  }

  const alerts = [];

  for (const [category, categoryRules] of Object.entries(thresholds)) {
    const categoryData = data[category];

    if (!categoryData || typeof categoryData !== "object") {
      continue;
    }

    for (const [key, rules] of Object.entries(categoryRules)) {
      const value = categoryData[key];

      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      if (category === "solar" && key === "irradiance") {
        const compressorStatus = String(data.compressor?.status || "OFF").toUpperCase();
        if (compressorStatus === "ON" && value < 50) {
          alerts.push(
            createAlert(
              `${category}.${key}`,
              value,
              "warning",
              `${category}.${key} is ${value} and is below 50 W/m² while the compressor is ON.`
            )
          );
        }
        continue;
      }

      const status = getStatus(category, key, value);

      if (status === "warning" || status === "critical") {
        alerts.push(
          createAlert(
            `${category}.${key}`,
            value,
            status,
            getAlertMessage(category, key, value, status, rules)
          )
        );
      }
    }
  }

  return alerts;
}