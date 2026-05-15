# GitHub Copilot — Full Project Build Prompt
## IoT Solar Desalination System: Arduino + ESP8266 + Firebase + React Dashboard

---

## WHAT YOU ARE BUILDING

A complete end-to-end IoT monitoring system for a PhD research project:
**"Experimental Investigation of R134a and Binary Zeotropic Refrigerant Mixtures
in a Compression Heat Pump Assisted Solar Thermal Desalination System with IoT Monitoring"**

The system has 3 parts you need to build:

```
[Sensors] → [Arduino Uno] → [ESP8266 WiFi] → [Firebase] → [React Dashboard]
```

1. **Arduino Uno code** — reads all sensors, sends JSON to ESP8266 via Serial
2. **ESP8266 code** — receives JSON from Arduino, pushes to Firebase Realtime Database
3. **React Web Dashboard** — reads Firebase in real time, displays all sensor data live

---

## PART 1 — ARDUINO UNO CODE

### File: `arduino_main.ino`

Arduino Uno reads all sensors every 5 seconds and sends a JSON string
to the ESP8266 via hardware Serial (pins 0 and 1).

### Sensors to read:

#### Temperature (7 points)
- Evaporator inlet temperature
- Condenser outlet temperature
- Compressor inlet temperature
- Compressor outlet temperature
- Solar collector outlet temperature
- Feed water (dirty water) temperature
- Purified water temperature

**Sensor type**: DS18B20 digital waterproof sensors (OneWire protocol)
All 7 sensors connect to **Digital Pin 2** on Arduino with a 4.7kΩ pullup resistor.
Each sensor is addressed by index (0 through 6).

Libraries needed:
```
OneWire
DallasTemperature
```

#### Pressure (2 points)
- Suction pressure (low side of heat pump)
- Discharge pressure (high side of heat pump)

**Sensor type**: Analog pressure transducers (0–5V output, 0–30 bar range)
- Suction → **Analog Pin A0**
- Discharge → **Analog Pin A1**

Conversion formula:
```cpp
float voltage = analogRead(pin) * (5.0 / 1023.0);
float pressure = (voltage - 0.5) / (4.5 - 0.5) * 30.0;
```

#### Flow Rate (2 points)
- Feed water flow rate (dirty water entering)
- Purified water flow rate (clean water output)

**Sensor type**: YF-S201 pulse-output flow sensors
- Feed water → **Digital Pin 3** (interrupt)
- Purified water → **Digital Pin 4** (interrupt)

Use `attachInterrupt` to count pulses. Calculate flow rate (L/min):
```cpp
float flowRate = (pulseCount / 7.5) / (intervalSeconds / 60.0);
```
Reset pulse counter after each reading.

#### Water Quality (4 parameters)
- TDS — Total Dissolved Solids in ppm → **Analog Pin A2**
- pH → **Analog Pin A3**
- Conductivity in µS/cm → **Analog Pin A4**
- Salinity in ppt → **Analog Pin A5**

TDS conversion:
```cpp
float voltage = analogRead(TDS_PIN) * (5.0 / 1023.0);
float tds = (133.42 * pow(voltage,3) - 255.86 * pow(voltage,2) + 857.39 * voltage) * 0.5;
```

pH conversion:
```cpp
float voltage = analogRead(PH_PIN) * (5.0 / 1023.0);
float ph = 3.5 * voltage; // Calibrate with pH 4 and pH 7 buffer solutions
```

Salinity approximation:
```cpp
float salinity = conductivity * 0.00036;
```

#### Solar Irradiance (1 point)
- Solar irradiance in W/m² → **Analog Pin A5**

```cpp
float voltage = analogRead(SOLAR_PIN) * (5.0 / 1023.0);
float irradiance = voltage * 240.0; // Calibrate with reference sensor
```

#### Power Monitoring (voltage + current)
- AC Voltage via ZMPT101B sensor → **Analog Pin A0** (shared via multiplexer)
- AC Current via ACS712 30A sensor → **Analog Pin A1** (shared via multiplexer)
- Power (W) = Voltage × Current (calculated in code)

#### Compressor Status
- Read a digital HIGH/LOW signal from compressor relay feedback → **Digital Pin 5**
- Status = "ON" if HIGH, "OFF" if LOW

---

### JSON Output Format

Every 5 seconds, Arduino sends this over Serial to ESP8266:

```
DATA:{"temperature":{"evaporator":45.2,"condenser":72.8,"comp_inlet":38.1,"comp_outlet":85.4,"solar_collector":91.3,"feed_water":28.6,"purified_water":24.1},"pressure":{"suction":3.20,"discharge":12.70},"flow":{"feed_water_flow":2.40,"purified_water_flow":1.10},"water_quality":{"tds":320.0,"ph":7.20,"conductivity":480.0,"salinity":0.173},"solar":{"irradiance":740.0},"power":{"voltage":220.4,"current":4.80,"power_consumption":1058.0},"compressor":{"status":"ON"}}
```

Always prefix with `DATA:` so ESP8266 can identify valid packets.
Terminate with `\n` (println).

---

### Arduino Pin Summary

| Sensor | Pin |
|---|---|
| DS18B20 (all 7 temp sensors) | Digital 2 |
| Flow — Feed water | Digital 3 |
| Flow — Purified water | Digital 4 |
| Compressor status | Digital 5 |
| Pressure — Suction | A0 |
| Pressure — Discharge | A1 |
| TDS | A2 |
| pH | A3 |
| Conductivity | A4 |
| Solar irradiance / Salinity | A5 |
| TX to ESP8266 | Digital 1 (via voltage divider) |
| RX from ESP8266 | Digital 0 |

> Note: Arduino Uno has only 6 analog pins. Use a CD74HC4051 analog multiplexer
> to share pins between power sensors and pressure/quality sensors,
> OR upgrade to Arduino Mega 2560 (16 analog pins — recommended for research).

---

## PART 2 — ESP8266 CODE

### File: `esp8266_firebase.ino`

ESP8266 (ESP-01 or NodeMCU) does 3 things:
1. Reads JSON data from Arduino via Serial (9600 baud)
2. Connects to WiFi
3. Pushes data to Firebase Realtime Database — both live values and history

### Wiring: Arduino → ESP8266

```
Arduino Pin 1 (TX) ──[1kΩ]──┬──► ESP8266 RX
                             │
                           [2kΩ]
                             │
                            GND

Arduino Pin 0 (RX) ◄──────────── ESP8266 TX
Arduino GND ──────────────────── ESP8266 GND
Arduino 3.3V ─────────────────── ESP8266 VCC
Arduino 3.3V ─────────────────── ESP8266 CH_PD
```

⚠️ The voltage divider (1kΩ + 2kΩ) is MANDATORY.
Arduino TX is 5V; ESP8266 RX is 3.3V max. Without it, ESP8266 will be damaged.

### Libraries needed:
```
Firebase ESP8266 Client (by Mobizt)
ArduinoJson
ESP8266WiFi (built-in with ESP8266 board package)
```

### Firebase credentials (fill in):
```cpp
#define WIFI_SSID      "YOUR_WIFI_NAME"
#define WIFI_PASSWORD  "YOUR_WIFI_PASSWORD"
#define FIREBASE_HOST  "your-project-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH  "YOUR_DATABASE_SECRET_KEY"
```

### What to write to Firebase:

#### 1. Live sensor data path: `/sensorData/`

Write all current values here. Dashboard reads this for live cards.

```
/sensorData/
  temperature/
    evaporator: 45.2
    condenser: 72.8
    comp_inlet: 38.1
    comp_outlet: 85.4
    solar_collector: 91.3
    feed_water: 28.6
    purified_water: 24.1
  pressure/
    suction: 3.20
    discharge: 12.70
  flow/
    feed_water_flow: 2.40
    purified_water_flow: 1.10
  water_quality/
    tds: 320.0
    ph: 7.20
    conductivity: 480.0
    salinity: 0.173
  solar/
    irradiance: 740.0
  power/
    voltage: 220.4
    current: 4.80
    power_consumption: 1058.0
  compressor/
    status: "ON"
  system/
    last_updated: 1716000000   ← Unix timestamp
    wifi_rssi: -62             ← WiFi signal strength
```

Use `Firebase.updateNode()` to update without overwriting entire tree.

#### 2. History data path: `/history/`

Write a compact snapshot every reading for chart data:

```
/history/r_1716000000/
  ts:   1716000000
  t_ev: 45.2       ← evaporator temp
  t_co: 72.8       ← condenser temp
  t_sc: 91.3       ← solar collector temp
  p_su: 3.20       ← suction pressure
  p_di: 12.70      ← discharge pressure
  tds:  320.0
  ph:   7.20
  sol:  740.0      ← solar irradiance
  pwr:  1058.0     ← power consumption
```

Use timestamp as unique key: `"r_" + String(unixTimestamp)`

Use `Firebase.setJSON()` to write history entries.

#### 3. Alerts path: `/alerts/`

If any value crosses a threshold, write an alert:

```
/alerts/a_1716000000/
  ts:       1716000000
  sensor:   "temperature/comp_outlet"
  value:    107.5
  severity: "CRITICAL"
  message:  "Compressor outlet temp exceeded 105°C"
```

Thresholds to check in ESP8266 before pushing:

| Sensor | Warning | Critical |
|---|---|---|
| Evaporator temp | > 55°C | > 70°C |
| Condenser temp | > 80°C | > 95°C |
| Compressor outlet | > 90°C | > 105°C |
| Suction pressure | < 2 or > 5 bar | — |
| Discharge pressure | < 10 or > 16 bar | — |
| TDS | > 500 ppm | > 1000 ppm |
| pH | < 6.5 or > 8.5 | < 5.5 or > 9.5 |

#### 4. Serial parsing logic:

```cpp
void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      if (buffer.startsWith("DATA:")) {
        String json = buffer.substring(5);
        pushToFirebase(json);
      }
      buffer = "";
    } else {
      buffer += c;
    }
  }
}
```

#### 5. Time sync (for timestamps):

```cpp
configTime(19800, 0, "pool.ntp.org"); // IST = UTC+5:30
```

---

## PART 3 — REACT WEB DASHBOARD

### Tech Stack

```
React 18 + Vite
Tailwind CSS
React Router v6
Firebase JS SDK v10
Recharts (for all charts)
Lucide React (icons)
date-fns (time formatting)
```

### Install commands:
```bash
npm create vite@latest solar-dashboard -- --template react
cd solar-dashboard
npm install firebase recharts lucide-react react-router-dom date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Environment variables (`.env`):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### Folder Structure

```
src/
  firebase.js              ← Firebase init
  App.jsx                  ← Router setup
  main.jsx
  hooks/
    useSensorData.js       ← Live Firebase listener
    useHistoryData.js      ← Historical data for charts
  pages/
    Overview.jsx
    Temperature.jsx
    Pressure.jsx
    WaterQuality.jsx
    Solar.jsx
    Power.jsx
    Compressor.jsx
    Alerts.jsx
    Settings.jsx
  components/
    Sidebar.jsx
    TopBar.jsx
    SensorCard.jsx
    GaugeChart.jsx
    TrendChart.jsx
    StatusBadge.jsx
    AlertPanel.jsx
    LoadingSpinner.jsx
    OfflineBanner.jsx
  utils/
    thresholds.js
    formatters.js
```

---

### Firebase Setup (`src/firebase.js`)

```js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
```

---

### Core Hook: `useSensorData.js`

```js
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { useState, useEffect } from "react";

export function useSensorData() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline]   = useState(true);

  useEffect(() => {
    const sensorRef = ref(db, "/sensorData");
    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        setData(snapshot.val());
        setLastUpdated(new Date());
        setIsOnline(true);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsOnline(false);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { data, loading, error, lastUpdated, isOnline };
}
```

Always use `onValue` (real-time listener), never `get` (one-time fetch).

---

### History Hook: `useHistoryData.js`

```js
import { ref, query, orderByKey, limitToLast, onValue } from "firebase/database";
import { db } from "../firebase";
import { useState, useEffect } from "react";

export function useHistoryData(limit = 50) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const histRef = query(ref(db, "/history"), orderByKey(), limitToLast(limit));
    const unsubscribe = onValue(histRef, (snapshot) => {
      const raw = snapshot.val();
      if (raw) {
        const entries = Object.values(raw).sort((a, b) => a.ts - b.ts);
        setHistory(entries);
      }
    });
    return () => unsubscribe();
  }, [limit]);

  return history;
}
```

---

### Pages & What Each Shows

#### `/` — Overview Dashboard

- **Top bar**: System name, online/offline badge, refrigerant type, uptime, last updated time
- **Summary cards grid** (12 cards total):

| Card | Firebase Path | Unit |
|---|---|---|
| Solar Irradiance | solar.irradiance | W/m² |
| Compressor Status | compressor.status | ON/OFF/FAULT |
| Power Consumption | power.power_consumption | W |
| Feed Water Flow | flow.feed_water_flow | L/min |
| Purified Water Flow | flow.purified_water_flow | L/min |
| TDS | water_quality.tds | ppm |
| pH | water_quality.ph | — |
| Evaporator Temp | temperature.evaporator | °C |
| Condenser Temp | temperature.condenser | °C |
| Solar Collector Temp | temperature.solar_collector | °C |
| Suction Pressure | pressure.suction | bar |
| Discharge Pressure | pressure.discharge | bar |

- **Live multi-line chart**: Evaporator temp + Condenser temp + Solar irradiance (last 50 readings from `/history/`)
- **Alerts panel**: Latest 5 alerts from `/alerts/`

---

#### `/temperature` — Temperature Details

- 7 value cards, one per sensor location, with color-coded status:
  - Green: normal range
  - Yellow: warning
  - Red: critical
- Multi-line Recharts LineChart with all 7 temperatures (last 50 readings)
- Threshold reference lines on chart

Thresholds:
```js
evaporator:   { warning: 55, critical: 70 }
condenser:    { warning: 80, critical: 95 }
comp_outlet:  { warning: 90, critical: 105 }
```

---

#### `/pressure` — Pressure Details

- 2 large radial gauge charts: Suction (0–10 bar) + Discharge (0–30 bar)
- Pressure ratio card: Discharge ÷ Suction
- Dual-line chart: suction vs discharge over time

---

#### `/water-quality` — Water Quality

- 4 large cards: TDS / pH / Conductivity / Salinity
- Each card: current value + min today + max today + status badge
- Overall water quality verdict:
  - ✅ SAFE: TDS < 500 ppm AND pH 6.5–8.5
  - ⚠️ CAUTION: borderline values
  - ❌ UNSAFE: outside safe limits
- TDS trend chart + pH trend chart (separate, last 50 readings)

---

#### `/solar` — Solar Energy

- Large irradiance gauge (0–1200 W/m²)
- Sun condition badge: ☀️ Excellent (>800) / 🌤 Good (400–800) / ☁️ Low (<400) / 🌙 Night (~0)
- Solar collector temperature card
- Irradiance area chart (last 50 readings)
- Estimated daily energy contribution

---

#### `/power` — Power & Energy

- 4 cards: Voltage (V) / Current (A) / Power (W) / Energy Today (kWh)
- Power consumption area chart (last 50 readings)
- Energy cost estimate (configurable ₹/kWh from settings)
- System efficiency indicator

---

#### `/compressor` — Compressor & Refrigerant

- Large status display: ON (green) / OFF (gray) / FAULT (red)
- Refrigerant label: R134a or Zeotropic Mix (read from Firebase `/sensorData/system/refrigerant`)
- Compressor outlet temperature card (with threshold warning)
- Pressure ratio (COP proxy): Discharge / Suction
- Compressor health indicator based on: outlet temp + pressure ratio

---

#### `/alerts` — Alerts Log

- Full table of all alerts from `/alerts/` in Firebase
- Columns: Time / Sensor / Value / Severity / Message
- Filter by: severity (INFO / WARNING / CRITICAL) and sensor category
- Color rows: red = CRITICAL, yellow = WARNING, blue = INFO
- Clear all alerts button (deletes `/alerts/` node in Firebase)

---

#### `/settings` — Settings

- Firebase config display (read-only, from `.env`)
- Electricity rate input (₹ per kWh) — stored in localStorage
- Data refresh indicator (shows last update time)
- Refrigerant selector: R134a / Zeotropic Mix — writes to `/sensorData/system/refrigerant`
- Export CSV button: downloads last 100 history entries as `.csv`
- System info section: reads from `/sensorData/system/`

---

### UI Design Requirements

**Theme**: Dark mode, scientific/industrial aesthetic

**Color palette** (use as CSS variables):
```css
:root {
  --bg-primary:    #0a0f1e;   /* deep navy — main background */
  --bg-card:       #111827;   /* card background */
  --bg-card-hover: #1f2937;
  --accent-cyan:   #00d4ff;   /* primary accent — live data */
  --accent-green:  #22c55e;   /* normal/safe status */
  --accent-yellow: #f59e0b;   /* warning status */
  --accent-red:    #ef4444;   /* critical/fault status */
  --text-primary:  #e2e8f0;
  --text-muted:    #94a3b8;
  --border:        #1e293b;
}
```

**Typography**:
- Values and numbers: `JetBrains Mono` (Google Fonts)
- Labels and UI text: `Inter` (Google Fonts)

**Cards**:
- Rounded corners: `border-radius: 12px`
- Subtle glow on active/updating sensor: `box-shadow: 0 0 12px rgba(0, 212, 255, 0.15)`
- Pulse animation when new data arrives

**Charts** (Recharts):
- Background: transparent
- Grid lines: `#1e293b`
- Tooltip: dark background with cyan border
- Lines: use accent colors consistently per sensor

**Responsive**: Works on desktop (1440px+) and tablet (768px)

**Animations**:
- Cards fade in on load with staggered delay
- Value updates trigger a brief cyan flash
- Status badges pulse when in warning/critical state

---

### SensorCard Component

```jsx
// props: label, value, unit, status ("normal"|"warning"|"critical"|"offline"), icon
function SensorCard({ label, value, unit, status, icon: Icon }) {
  const statusColors = {
    normal:   "border-green-500/30 shadow-green-500/10",
    warning:  "border-yellow-500/50 shadow-yellow-500/20",
    critical: "border-red-500/50 shadow-red-500/20",
    offline:  "border-gray-600/30"
  };

  return (
    <div className={`bg-[#111827] border rounded-xl p-4 ${statusColors[status]}`}>
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div className="text-2xl font-mono font-bold text-slate-100">
        {value ?? "--"}
        <span className="text-sm text-slate-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}
```

---

### StatusBadge Component

```jsx
function StatusBadge({ status }) {
  const config = {
    online:   { color: "bg-green-500",  label: "● Online"  },
    offline:  { color: "bg-red-500",    label: "● Offline" },
    warning:  { color: "bg-yellow-500", label: "⚠ Warning" },
    critical: { color: "bg-red-600",    label: "✕ Critical"},
    safe:     { color: "bg-green-500",  label: "✓ Safe"    },
  };
  const c = config[status] || config.offline;
  return (
    <span className={`${c.color} text-white text-xs font-mono px-2 py-1 rounded-full`}>
      {c.label}
    </span>
  );
}
```

---

### Thresholds Utility (`src/utils/thresholds.js`)

```js
export const thresholds = {
  temperature: {
    evaporator:    { warning: 55,  critical: 70  },
    condenser:     { warning: 80,  critical: 95  },
    comp_outlet:   { warning: 90,  critical: 105 },
  },
  pressure: {
    suction:       { min: 2,   max: 5,   criticalMax: 7  },
    discharge:     { min: 10,  max: 16,  criticalMax: 20 },
  },
  water_quality: {
    tds:           { warning: 500,  critical: 1000 },
    ph:            { min: 6.5, max: 8.5 },
  },
};

export function getStatus(category, key, value) {
  const t = thresholds[category]?.[key];
  if (!t || value === null || value === undefined) return "offline";
  if (t.critical && value >= t.critical) return "critical";
  if (t.criticalMax && value >= t.criticalMax) return "critical";
  if (t.warning && value >= t.warning) return "warning";
  if (t.min && (value < t.min || value > t.max)) return "warning";
  return "normal";
}
```

---

### Offline Handling

- If `data.system.last_updated` is more than 30 seconds old → show offline banner
- If Firebase listener errors → show "Connection lost" banner
- All sensor cards show `"--"` instead of `0` when data is null or offline

---

### CSV Export (`/settings` page)

```js
function exportCSV(history) {
  const headers = ["timestamp","t_ev","t_co","t_sc","p_su","p_di","tds","ph","sol","pwr"];
  const rows = history.map(h =>
    headers.map(k => h[k] ?? "").join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `desalination_data_${Date.now()}.csv`;
  a.click();
}
```

---

## BUILD ORDER FOR COPILOT

Build in this exact sequence:

1. `src/firebase.js` — Firebase init with env variables
2. `src/hooks/useSensorData.js` — real-time listener hook
3. `src/hooks/useHistoryData.js` — history data hook
4. `src/utils/thresholds.js` — thresholds + getStatus function
5. `src/utils/formatters.js` — number formatters, time formatters
6. `src/components/Sidebar.jsx` — navigation sidebar with all routes
7. `src/components/TopBar.jsx` — top bar with online badge + last updated
8. `src/components/SensorCard.jsx` — reusable sensor value card
9. `src/components/StatusBadge.jsx` — color-coded status badge
10. `src/components/TrendChart.jsx` — reusable Recharts line/area chart
11. `src/components/GaugeChart.jsx` — radial gauge using Recharts RadialBarChart
12. `src/components/AlertPanel.jsx` — latest alerts list
13. `src/pages/Overview.jsx` — main dashboard page
14. `src/pages/Temperature.jsx`
15. `src/pages/Pressure.jsx`
16. `src/pages/WaterQuality.jsx`
17. `src/pages/Solar.jsx`
18. `src/pages/Power.jsx`
19. `src/pages/Compressor.jsx`
20. `src/pages/Alerts.jsx`
21. `src/pages/Settings.jsx`
22. `src/App.jsx` — React Router setup with all routes

---

## FIREBASE DATABASE RULES (for testing)

In Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Change to authenticated rules before production deployment.

---

## IMPORTANT RULES FOR COPILOT

- Always use `onValue` from Firebase — never `get()`
- If sensor value is `null` or `undefined`, display `"--"` not `0`
- All Firebase credentials must come from `.env` variables (never hardcoded)
- History path is `/history/` — use `limitToLast(50)` for chart data
- Live data path is `/sensorData/` — use for all cards and current values
- Alerts write to `/alerts/` from both ESP8266 (hardware) and dashboard (client-side threshold check)
- All chart components must be reusable — accept `data`, `dataKey`, `color`, `label` as props
- Dark theme is mandatory — background `#0a0f1e`, cards `#111827`
- Use JetBrains Mono for all numeric values

---

*PhD Research Project — Department of Mechanical Engineering*
*Solar Desalination + Heat Pump + IoT Monitoring System*
