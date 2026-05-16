const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function average(sum, count) {
  return count > 0 ? sum / count : null;
}

exports.aggregateDaily = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const nowMs = Date.now();
  const cutoffMs = nowMs - 24 * 60 * 60 * 1000;
  const cutoffSeconds = Math.floor(cutoffMs / 1000);
  const historyRef = admin.database().ref("/history");
  const snapshot = await historyRef.orderByChild("ts").startAt(cutoffSeconds).once("value");
  const records = [];

  snapshot.forEach((childSnapshot) => {
    const record = childSnapshot.val();
    const recordTs = toNumber(record?.ts);

    if (!recordTs) {
      return;
    }

    const recordMs = recordTs * 1000;
    if (recordMs >= cutoffMs && recordMs <= nowMs) {
      records.push(record);
    }
  });

  if (records.length === 0) {
    return null;
  }

  const metricKeys = ["t_ev", "t_co", "t_sc", "p_su", "p_di", "tds", "ph", "sol", "pwr"];
  const totals = metricKeys.reduce((accumulator, key) => {
    accumulator[key] = { sum: 0, count: 0 };
    return accumulator;
  }, {});

  let minTds = null;
  let maxTds = null;

  records.forEach((record) => {
    metricKeys.forEach((key) => {
      const numericValue = toNumber(record?.[key]);
      if (numericValue !== null) {
        totals[key].sum += numericValue;
        totals[key].count += 1;
      }
    });

    const tdsValue = toNumber(record?.tds);
    if (tdsValue !== null) {
      minTds = minTds === null ? tdsValue : Math.min(minTds, tdsValue);
      maxTds = maxTds === null ? tdsValue : Math.max(maxTds, tdsValue);
    }
  });

  const dateKey = new Date(nowMs).toISOString().slice(0, 10);
  const payload = {
    date: dateKey,
    record_count: records.length,
    avg_t_ev: average(totals.t_ev.sum, totals.t_ev.count),
    avg_t_co: average(totals.t_co.sum, totals.t_co.count),
    avg_t_sc: average(totals.t_sc.sum, totals.t_sc.count),
    avg_p_su: average(totals.p_su.sum, totals.p_su.count),
    avg_p_di: average(totals.p_di.sum, totals.p_di.count),
    avg_tds: average(totals.tds.sum, totals.tds.count),
    avg_ph: average(totals.ph.sum, totals.ph.count),
    avg_sol: average(totals.sol.sum, totals.sol.count),
    avg_pwr: average(totals.pwr.sum, totals.pwr.count),
    min_tds: minTds,
    max_tds: maxTds,
  };

  await admin.database().ref(`/dailyStats/${dateKey}`).set(payload);
  return null;
});