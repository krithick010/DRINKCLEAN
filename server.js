import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const dbPath = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions to read/write database
function readDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  return getDefaultDatabase();
}

function writeDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getDefaultDatabase() {
  return {
    sensorData: {
      temperature: 45.2,
      pressure: 18.5,
      flowRate: 2.3,
      waterQuality: {
        pH: 7.2,
        turbidity: 0.3,
        conductivity: 450,
        totalDissolvedSolids: 280,
      },
      power: {
        current: 15.8,
        voltage: 230,
        frequency: 50,
      },
      solar: {
        voltage: 48.5,
        current: 12.3,
        power: 596,
      },
      system: {
        compressorRunHours: 2450,
        refrigerant: 'R134a',
        pumpStatus: 'RUNNING',
        lastServiceDate: '2025-10-15',
      },
      timestamp: Date.now(),
    },
    config: {
      thresholds: {
        temperature: {
          compressor: { min: 2, max: 60 },
          condenser: { min: 20, max: 70 },
        },
        pressure: {
          suction: { min: 1, max: 8 },
          discharge: { min: 15, max: 35 },
        },
        water_quality: {
          pH: { min: 6.5, max: 8.0 },
          turbidity: { min: 0, max: 1.0 },
          conductivity: { min: 0, max: 1000 },
          totalDissolvedSolids: { min: 0, max: 500 },
        },
        flow: {
          flowRate: { min: 0.5, max: 5 },
        },
        power: {
          voltage: { min: 200, max: 260 },
          frequency: { min: 48, max: 52 },
          current: { min: 0, max: 30 },
        },
        solar: {
          voltage: { min: 0, max: 60 },
          current: { min: 0, max: 20 },
          power: { min: 0, max: 1000 },
        },
      },
    },
    alerts: {},
    dailyStats: {},
    history: {},
  };
}

// Initialize database if it doesn't exist
if (!fs.existsSync(dbPath)) {
  writeDatabase(getDefaultDatabase());
}

// Routes

// Get all sensor data
app.get('/api/sensor-data', (req, res) => {
  const db = readDatabase();
  res.json(db.sensorData);
});

// Get thresholds
app.get('/api/thresholds', (req, res) => {
  const db = readDatabase();
  res.json(db.config.thresholds);
});

// Update thresholds
app.put('/api/thresholds', (req, res) => {
  const db = readDatabase();
  db.config.thresholds = req.body;
  writeDatabase(db);
  res.json(db.config.thresholds);
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
  const db = readDatabase();
  const alerts = Object.entries(db.alerts).map(([id, value]) => ({ id, ...value }));
  res.json(alerts);
});

// Add or update alert
app.post('/api/alerts', (req, res) => {
  const db = readDatabase();
  const id = req.body.id || Date.now().toString();
  db.alerts[id] = {
    ...req.body,
    id: undefined, // Remove id from the value
    ts: req.body.ts || Date.now(),
  };
  writeDatabase(db);
  res.json({ id, ...db.alerts[id] });
});

// Update specific alert (acknowledge)
app.put('/api/alerts/:id', (req, res) => {
  const db = readDatabase();
  if (db.alerts[req.params.id]) {
    db.alerts[req.params.id] = {
      ...db.alerts[req.params.id],
      ...req.body,
    };
    writeDatabase(db);
    res.json({ id: req.params.id, ...db.alerts[req.params.id] });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// Delete all alerts
app.delete('/api/alerts', (req, res) => {
  const db = readDatabase();
  db.alerts = {};
  writeDatabase(db);
  res.json({ success: true });
});

// Delete specific alert
app.delete('/api/alerts/:id', (req, res) => {
  const db = readDatabase();
  delete db.alerts[req.params.id];
  writeDatabase(db);
  res.json({ success: true });
});

// Get daily stats
app.get('/api/daily-stats', (req, res) => {
  const db = readDatabase();
  const stats = Object.entries(db.dailyStats).map(([date, value]) => ({ date, ...value }));
  res.json(stats);
});

// Get history
app.get('/api/history', (req, res) => {
  const db = readDatabase();
  const limit = req.query.limit || 50;
  const history = Object.values(db.history).sort((a, b) => a.ts - b.ts).slice(-limit);
  res.json(history);
});

// Update system config
app.put('/api/sensor-data/system/refrigerant', (req, res) => {
  const db = readDatabase();
  db.sensorData.system.refrigerant = req.body.refrigerant;
  writeDatabase(db);
  res.json({ refrigerant: db.sensorData.system.refrigerant });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
});
