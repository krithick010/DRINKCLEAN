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
  water_quality: {
    tds: { warning: 500, critical: 1000 },
    ph: { min: 6.5, max: 8.5 },
  },
};

export function getStatus(category, key, value) {
  const rules = thresholds[category]?.[key];

  if (!rules || value === null || value === undefined || Number.isNaN(value)) {
    return "offline";
  }

  if (typeof rules.min === "number" && typeof rules.max === "number") {
    if (value < rules.min || value > rules.max) {
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