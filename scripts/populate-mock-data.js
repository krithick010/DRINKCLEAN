import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDMKc92a0VDREunM-bDvjIXHFIPT01UeUM",
  authDomain: "iotsensor-d0465.firebaseapp.com",
  databaseURL: "https://iotsensor-d0465-default-rtdb.firebaseio.com",
  projectId: "iotsensor-d0465",
  appId: "1:299052469477:web:f769564eda8242c715980c",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function generateSensorData() {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    temperature: {
      evaporator: 45.2 + Math.random() * 5,
      condenser: 72.8 + Math.random() * 8,
      comp_inlet: 38.1 + Math.random() * 4,
      comp_outlet: 85.4 + Math.random() * 10,
      solar_collector: 91.3 + Math.random() * 15,
      feed_water: 28.6 + Math.random() * 3,
      purified_water: 24.1 + Math.random() * 2,
    },
    pressure: {
      suction: 3.2 + Math.random() * 0.8,
      discharge: 12.7 + Math.random() * 2,
    },
    flow: {
      feed_water_flow: 2.4 + Math.random() * 0.5,
      purified_water_flow: 1.1 + Math.random() * 0.3,
    },
    water_quality: {
      tds: 320 + Math.random() * 100,
      ph: 7.2 + (Math.random() - 0.5) * 0.6,
      conductivity: 480 + Math.random() * 80,
      salinity: 0.173 + Math.random() * 0.05,
    },
    solar: {
      irradiance: 740 + Math.random() * 200,
    },
    power: {
      voltage: 220 + Math.random() * 10,
      current: 4.8 + Math.random() * 1.2,
      power_consumption: 1058 + Math.random() * 200,
    },
    compressor: {
      status: Math.random() > 0.2 ? "ON" : "OFF",
    },
    system: {
      last_updated: now,
      wifi_rssi: -62 - Math.floor(Math.random() * 20),
      refrigerant: "R134a",
      uptime: "12h 34m",
    },
  };
}

function generateHistoryEntry(timestamp) {
  const data = generateSensorData();
  return {
    ts: timestamp,
    t_ev: parseFloat(data.temperature.evaporator.toFixed(1)),
    t_co: parseFloat(data.temperature.condenser.toFixed(1)),
    t_sc: parseFloat(data.temperature.solar_collector.toFixed(1)),
    p_su: parseFloat(data.pressure.suction.toFixed(2)),
    p_di: parseFloat(data.pressure.discharge.toFixed(2)),
    tds: parseFloat(data.water_quality.tds.toFixed(1)),
    ph: parseFloat(data.water_quality.ph.toFixed(2)),
    sol: parseFloat(data.solar.irradiance.toFixed(1)),
    pwr: parseFloat(data.power.power_consumption.toFixed(1)),
  };
}

async function populateFirebase() {
  console.log("🔥 Populating Firebase with mock data...\n");
  
  try {
    console.log("📊 Writing live sensor data...");
    const sensorData = generateSensorData();
    await set(ref(db, "/sensorData"), sensorData);
    console.log("✅ Live sensor data written\n");
    
    console.log("📈 Writing 50 history entries...");
    const now = Math.floor(Date.now() / 1000);
    const historyPromises = [];
    
    for (let i = 0; i < 50; i++) {
      const timestamp = now - (49 - i) * 300;
      const entry = generateHistoryEntry(timestamp);
      const key = `r_${timestamp}`;
      historyPromises.push(set(ref(db, `/history/${key}`), entry));
    }
    
    await Promise.all(historyPromises);
    console.log("✅ 50 history entries written\n");
    
    console.log("🚨 Writing alerts...");
    const alerts = [
      {
        ts: now - 3600,
        sensor: "temperature/comp_outlet",
        value: 92.5,
        severity: "WARNING",
        message: "Compressor outlet temperature approaching limit",
      },
      {
        ts: now - 7200,
        sensor: "water_quality/tds",
        value: 520,
        severity: "WARNING",
        message: "TDS level above recommended threshold",
      },
      {
        ts: now - 10800,
        sensor: "pressure/discharge",
        value: 15.8,
        severity: "WARNING",
        message: "Discharge pressure elevated",
      },
    ];
    
    const alertPromises = alerts.map((alert, i) => {
      const key = `a_${alert.ts}_${i}`;
      return set(ref(db, `/alerts/${key}`), alert);
    });
    
    await Promise.all(alertPromises);
    console.log("✅ Alerts written\n");
    
    console.log("🎉 Mock data population complete!");
    console.log("\n📍 Firebase paths populated:");
    console.log("   - /sensorData (live values)");
    console.log("   - /history (50 entries)");
    console.log("   - /alerts (3 alerts)");
    console.log("\n🌐 Open your dashboard to see the data!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

populateFirebase();
