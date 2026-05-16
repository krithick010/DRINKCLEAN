/**
 * Calculates the estimated coefficient of performance using a Carnot approximation.
 * @param {number|null|undefined} tCondenser - Condenser temperature in Celsius.
 * @param {number|null|undefined} tEvaporator - Evaporator temperature in Celsius.
 * @returns {number|null} The estimated COP, or null when inputs are invalid.
 */
export function calculateCOP(tCondenser, tEvaporator) {
  if (!Number.isFinite(tCondenser) || !Number.isFinite(tEvaporator)) {
    return null;
  }

  const condenserKelvin = tCondenser + 273.15;
  const evaporatorKelvin = tEvaporator + 273.15;
  const delta = condenserKelvin - evaporatorKelvin;

  if (delta === 0) {
    return null;
  }

  return condenserKelvin / delta;
}

/**
 * Calculates water yield in liters per kWh.
 * @param {number|null|undefined} flowLPM - Purified water flow in liters per minute.
 * @param {number|null|undefined} powerW - Power consumption in watts.
 * @returns {number|null} The water yield in L/kWh, or null when inputs are invalid.
 */
export function calculateWaterYield(flowLPM, powerW) {
  if (!Number.isFinite(flowLPM) || !Number.isFinite(powerW) || powerW <= 0) {
    return null;
  }

  return (flowLPM * 60) / (powerW / 1000);
}

function getRecentNumericValues(history, key, count) {
  return history
    .slice(-count)
    .map((entry) => Number(entry?.[key]))
    .filter(Number.isFinite);
}

function isStrictlyIncreasing(values) {
  if (values.length < 2) {
    return false;
  }

  return values.every((value, index) => index === 0 || value > values[index - 1]);
}

/**
 * Computes simple subsystem health scores from history records.
 * @param {Array<object>} history - Historical sensor entries.
 * @returns {{compressor: {status: string, reason: string}, pump: {status: string, reason: string}, waterQuality: {status: string, reason: string}}}
 */
export function computeHealthScores(history) {
  const safeHistory = Array.isArray(history) ? history : [];

  const compressorValues = getRecentNumericValues(safeHistory, "comp_outlet", 10);
  const compressorAverage =
    compressorValues.length > 0
      ? compressorValues.reduce((sum, value) => sum + value, 0) / compressorValues.length
      : null;

  let compressor = {
    status: "good",
    reason: compressorValues.length > 0 ? "Compressor outlet temperature is stable." : "No compressor outlet history yet.",
  };

  if (compressorValues.length === 10 && isStrictlyIncreasing(compressorValues)) {
    compressor = {
      status: "watch",
      reason: "Last 10 compressor outlet readings are monotonically increasing.",
    };
  } else if (compressorAverage !== null && compressorAverage > 85) {
    compressor = {
      status: "service-soon",
      reason: `Average compressor outlet temperature is ${compressorAverage.toFixed(1)}°C.`,
    };
  }

  const pumpValues = getRecentNumericValues(safeHistory, "purified_water_flow", 5);
  const pump =
    pumpValues.length === 5 && pumpValues.every((value) => value < 0.2)
      ? {
          status: "watch",
          reason: "Purified water flow stayed below 0.2 L/min for the last 5 readings.",
        }
      : {
          status: "good",
          reason: pumpValues.length > 0 ? "Purified water flow is within expected range." : "No purified flow history yet.",
        };

  const tdsValues = getRecentNumericValues(safeHistory, "tds", 20);
  const tdsFirst = tdsValues[0];
  const tdsLast = tdsValues[tdsValues.length - 1];
  const tdsIncrease =
    tdsValues.length >= 2 && Number.isFinite(tdsFirst) && tdsFirst !== 0
      ? ((tdsLast - tdsFirst) / tdsFirst) * 100
      : null;

  let waterQuality = {
    status: "good",
    reason: tdsValues.length > 0 ? "TDS trend is stable." : "No TDS history yet.",
  };

  if (tdsValues.length >= 2 && tdsIncrease !== null && tdsIncrease > 20) {
    waterQuality = {
      status: "watch",
      reason: `TDS increased by ${tdsIncrease.toFixed(0)}% over the last 20 readings.`,
    };
  } else if (Number.isFinite(tdsLast) && tdsLast > 500) {
    waterQuality = {
      status: "service-soon",
      reason: `Latest TDS is ${tdsLast.toFixed(0)} ppm.`,
    };
  }

  return { compressor, pump, waterQuality };
}