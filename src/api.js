import { ref, onValue, get, child, set, push } from "firebase/database";
import { db } from "./firebase";

const defaultThresholds = {
  temperature: {
    evaporator: { min: 2, max: 15 },
    condenser: { min: 30, max: 60 },
    comp_outlet: { min: 40, max: 110 }
  },
  pressure: {
    suction: { min: 2, max: 5 },
    discharge: { min: 10, max: 20 }
  },
  water_quality: {
    tds: { max: 500 },
    ph: { min: 6.5, max: 8.5 }
  }
};

export function setupDataListener(path, callback) {
  // Mapping paths to match firebase structure
  let mappedPath = path;
  if (path === '/sensorData') mappedPath = 'sensorData';
  if (path === '/config/thresholds') mappedPath = 'thresholds';
  if (path === '/alerts') mappedPath = 'alerts';
  if (path === '/dailyStats') mappedPath = 'dailyStats';
  if (path === '/history') mappedPath = 'history';

  const dbRef = ref(db, mappedPath);
  return onValue(dbRef, (snapshot) => {
    callback({ val: () => snapshot.val() });
  }, (error) => {
    console.error(`Error fetching ${mappedPath} from Firebase:`, error);
    callback({ val: () => null });
  });
}

export async function getSensorData() {
  try {
    const snapshot = await get(child(ref(db), 'sensorData'));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching sensor data from Firebase:', error);
    return null;
  }
}

export async function getHistory(limitCount = 50) {
  try {
    const snapshot = await get(child(ref(db), 'history'));
    if (snapshot.exists()) {
      const historyObj = snapshot.val();
      const historyArray = Object.values(historyObj).sort((a, b) => a.ts - b.ts);
      return historyArray.slice(-limitCount);
    }
    return [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function getThresholds() {
  try {
    const snapshot = await get(child(ref(db), 'thresholds'));
    return snapshot.exists() ? snapshot.val() : defaultThresholds;
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    return defaultThresholds;
  }
}

export async function updateThresholds(thresholds) {
  try {
    await set(ref(db, 'thresholds'), thresholds);
    return thresholds;
  } catch (error) {
    console.error('Error updating thresholds:', error);
    throw error;
  }
}

export async function getAlerts() {
  try {
    const snapshot = await get(child(ref(db), 'alerts'));
    if (snapshot.exists()) {
      const alertsObj = snapshot.val();
      return Object.values(alertsObj).sort((a, b) => b.ts - a.ts);
    }
    return [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function addAlert(alert) {
  try {
    const alertsRef = ref(db, 'alerts');
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, alert);
    return { id: newAlertRef.key, ...alert };
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
}

export async function getDailyStats() {
  try {
    const snapshot = await get(child(ref(db), 'dailyStats'));
    if (snapshot.exists()) {
      const statsObj = snapshot.val();
      return Object.values(statsObj).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function deleteAllAlerts() {
  try {
    await set(ref(db, 'alerts'), null);
  } catch (error) {
    console.error('Error deleting all alerts:', error);
    throw error;
  }
}

export async function updateAlert(alertId, updates) {
  try {
    await update(ref(db, `alerts/${alertId}`), updates);
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
}

export async function updateRefrigerant(type) {
  try {
    await set(ref(db, 'sensorData/system/refrigerant'), type);
    return type;
  } catch (error) {
    console.error('Error updating refrigerant:', error);
    throw error;
  }
}
