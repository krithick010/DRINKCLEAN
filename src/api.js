const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Real-time listeners (simulated with polling)
const listeners = new Map();

export function setupDataListener(path, callback) {
  const poll = async () => {
    try {
      const endpoint = mapPathToEndpoint(path);
      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      callback({ val: () => data });
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      callback({ val: () => null });
    }
  };

  // Initial poll
  poll();

  // Set up polling interval
  const interval = setInterval(poll, 2000);

  // Return unsubscribe function
  return () => clearInterval(interval);
}

function mapPathToEndpoint(path) {
  if (path === '/sensorData') return '/sensor-data';
  if (path === '/config/thresholds') return '/thresholds';
  if (path === '/alerts') return '/alerts';
  if (path === '/dailyStats') return '/daily-stats';
  if (path === '/history') return '/history';
  return path;
}

export async function getSensorData() {
  try {
    const response = await fetch(`${API_URL}/sensor-data`);
    return response.json();
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return null;
  }
}

export async function getThresholds() {
  try {
    const response = await fetch(`${API_URL}/thresholds`);
    return response.json();
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    return null;
  }
}

export async function updateThresholds(thresholds) {
  try {
    const response = await fetch(`${API_URL}/thresholds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thresholds),
    });
    return response.json();
  } catch (error) {
    console.error('Error updating thresholds:', error);
    throw error;
  }
}

export async function getAlerts() {
  try {
    const response = await fetch(`${API_URL}/alerts`);
    return response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function addAlert(alert) {
  try {
    const response = await fetch(`${API_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    return response.json();
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
}

export async function updateAlert(id, updates) {
  try {
    const response = await fetch(`${API_URL}/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
}

export async function deleteAllAlerts() {
  try {
    const response = await fetch(`${API_URL}/alerts`, { method: 'DELETE' });
    return response.json();
  } catch (error) {
    console.error('Error clearing alerts:', error);
    throw error;
  }
}

export async function deleteAlert(id) {
  try {
    const response = await fetch(`${API_URL}/alerts/${id}`, { method: 'DELETE' });
    return response.json();
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
}

export async function getDailyStats() {
  try {
    const response = await fetch(`${API_URL}/daily-stats`);
    return response.json();
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return [];
  }
}

export async function getHistory(limit = 50) {
  try {
    const response = await fetch(`${API_URL}/history?limit=${limit}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function updateRefrigerant(refrigerant) {
  try {
    const response = await fetch(`${API_URL}/sensor-data/system/refrigerant`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refrigerant }),
    });
    return response.json();
  } catch (error) {
    console.error('Error updating refrigerant:', error);
    throw error;
  }
}

// Alias for compatibility
export const db = {
  setupListener: setupDataListener,
};
