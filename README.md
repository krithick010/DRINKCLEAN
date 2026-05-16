# DRINKCLEAN

IoT-enabled solar thermal desalination and effluent purification monitoring system built with **React, Vite, Firebase Realtime Database, Arduino, and ESP8266**. The platform combines live telemetry, alerting, historical analytics, refrigerant-aware monitoring, and operator controls for a compression heat pump assisted solar desalination setup.

## Overview

DRINKCLEAN is designed for remote, water-scarce, and low-maintenance deployment scenarios where contaminated, saline, or industrial effluent water must be monitored and processed into usable water. The system combines solar thermal heating, compression heat pump assistance, water-quality sensing, cloud telemetry, and a web dashboard to improve operational visibility and energy-aware decision making.

The repository includes:
- A React + Vite dashboard for live monitoring and analytics.
- Firebase Realtime Database integration for real-time and historical data.
- Arduino firmware for sensor acquisition.
- ESP8266 firmware for Wi-Fi connectivity, cloud upload, and alert generation.
- Documentation for hardware setup and project implementation.

## Key Features

### Monitoring and Control
- Live dashboard for temperature, pressure, flow, power, solar, compressor, and water-quality telemetry.
- Real-time Firebase-connected sensor cards and trend charts.
- Compressor and refrigerant status display.
- Configurable thresholds and settings management.
- Mobile-friendly dashboard navigation.

### Water Quality and Safety
- Water quality monitoring for TDS, pH, conductivity, and salinity.
- Water safety scoring and status visualization.
- Alerting for out-of-range water quality conditions.
- Historical water quality tracking for trend analysis.

### Alerts and Diagnostics
- Real-time alert detection for abnormal system conditions.
- Alerts page with active and historical alert views.
- Alert acknowledgement workflow.
- Sensor health and simple predictive maintenance indicators.
- Offline/stale-data visibility in the dashboard.

### Analytics and Research Support
- Historical trend visualization.
- CSV export support.
- COP and water-yield style derived KPI support.
- Refrigerant performance comparison workflow.
- Daily aggregation support for reporting and long-term analysis.

## System Architecture

The full system is made up of four layers:

1. **Thermal and desalination hardware**
   - Solar thermal collector
   - Heat pump subsystem
   - Compressor
   - Condenser
   - Evaporator
   - Expansion valve
   - Desalination chamber
   - Flow path and storage tanks

2. **Embedded sensing and control**
   - Arduino for sensor acquisition and serial data formatting
   - ESP8266 for Wi-Fi connectivity and cloud upload
   - Threshold-based alert generation in firmware

3. **Cloud data layer**
   - Firebase Realtime Database for live state, history, alerts, and configuration

4. **Web dashboard**
   - React + Vite frontend
   - Tailwind CSS UI
   - Recharts/Lucide-based visualization and interaction

## Repository Structure

```text
DRINKCLEAN/
├── README.md
├── .env.example
├── HARDWARE_SETUP_GUIDE.md
├── IMPLEMENTATION_COMPLETE.md
├── arduino_main.ino
├── esp8266_firebase.ino
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── scripts/
│   └── populate-mock-data.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── firebase.js
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── utils/
└── dist/   (generated build output, should not be committed)
```

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Recharts

### Cloud and Database
- Firebase Realtime Database
- Firebase Web SDK

### Embedded / Firmware
- Arduino
- ESP8266
- ArduinoJson
- FirebaseESP8266
- Wi-Fi + NTP time sync

## Dashboard Modules

The dashboard is organized into dedicated pages for subsystem-level monitoring:

- **Overview** — high-level system telemetry, quick KPIs, trend chart, alert snapshot.
- **Temperature** — evaporator, condenser, compressor inlet/outlet, solar collector, feed/purified water temperatures.
- **Pressure** — suction and discharge pressure tracking.
- **Water Quality** — TDS, pH, conductivity, salinity, and water safety indicators.
- **Solar** — solar irradiance and related thermal inputs.
- **Power** — voltage, current, and power consumption.
- **Compressor** — compressor state and related operating observations.
- **Alerts** — alert list, acknowledgement flow, and history.
- **Settings** — configuration, exports, refrigerant selection, and system metadata.

If the additional prompt-based enhancements were added, the app may also include:
- **History Explorer**
- **Refrigerant Analysis**
- **Daily Statistics / Aggregation**
- **Health or Predictive Maintenance panels**

## Firebase Data Model

The application currently uses Firebase Realtime Database paths similar to the following:

```text
/sensorData/
  temperature/
    evaporator
    condenser
    comp_inlet
    comp_outlet
    solar_collector
    feed_water
    purified_water
  pressure/
    suction
    discharge
  flow/
    feed_water_flow
    purified_water_flow
  water_quality/
    tds
    ph
    conductivity
    salinity
  solar/
    irradiance
  power/
    voltage
    current
    power_consumption
  compressor/
    status
  system/
    last_updated
    wifi_rssi
    refrigerant
    uptime

/history/
  r_<timestamp>/
    ts
    t_ev
    t_co
    t_sc
    p_su
    p_di
    tds
    ph
    sol
    pwr

/alerts/
  a_<timestamp>_<random>/
    ts
    sensor
    value
    severity
    message
    acknowledged
    ack_ts

/config/
  thresholds/

dailyStats/
  YYYY-MM-DD/
```

> Note: Actual schema may evolve as new features are added. Keep this section updated whenever Firebase paths change.

## How the System Works

1. Sensors attached to the thermal/desalination setup collect live measurements.
2. The Arduino reads and formats sensor data.
3. The ESP8266 receives sensor payloads, connects to Wi-Fi, timestamps records, and pushes live data to Firebase.
4. The ESP8266 also stores historical records and generates threshold-based alerts.
5. The React dashboard subscribes to Firebase and updates the UI in real time.
6. Operators use the dashboard to monitor status, inspect trends, export data, and respond to alerts.

## Prerequisites

Before running the project, make sure the following are available:

### Software
- Node.js 18+ recommended
- npm 9+ recommended
- Arduino IDE
- ESP8266 board package installed in Arduino IDE
- Firebase project with Realtime Database enabled

### Hardware
- Arduino board
- ESP8266 module or compatible development board
- Temperature, pressure, flow, and water-quality sensors
- Solar-assisted desalination test setup
- Stable Wi-Fi network for the ESP8266

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/krithick010/DRINKCLEAN.git
cd DRINKCLEAN
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then update `.env` with your Firebase project values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Do **not** commit `.env` to version control.

### 4. Run the frontend locally

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## Firebase Setup

1. Create a Firebase project in the Firebase Console.
2. Enable **Realtime Database**.
3. Register a web app inside the Firebase project.
4. Copy the web app configuration values into `.env`.
5. Ensure your database rules allow the required reads/writes for your deployment stage.

Example development rule style:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> For production, replace open rules with authenticated and path-scoped access control.

## Firmware Setup

This repository includes:
- `arduino_main.ino`
- `esp8266_firebase.ino`

### Arduino responsibilities
- Read connected sensors
- Format outgoing telemetry
- Transmit data over serial to the ESP8266

### ESP8266 responsibilities
- Connect to Wi-Fi
- Sync time using NTP
- Receive serial payloads
- Push live data to Firebase
- Write historical records
- Generate threshold-based alerts

### ESP8266 configuration checklist

Update these values in `esp8266_firebase.ino` before uploading:

```cpp
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define FIREBASE_HOST "your-project-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET_KEY"
```

### Arduino IDE ESP8266 installation

To program the ESP8266 through Arduino IDE, install the ESP8266 board package through **Tools > Board > Boards Manager** after adding the ESP8266 package source in Arduino IDE preferences.[web:42][web:45][web:48]

## Hardware Setup

For hardware assembly and wiring guidance, see:

- [`HARDWARE_SETUP_GUIDE.md`](./HARDWARE_SETUP_GUIDE.md)

This document should cover:
- Sensor placement
- Wiring overview
- Pump/compressor interface notes
- Flow path layout
- Safety precautions
- Calibration expectations

## Usage

### Typical operator workflow

1. Power up the hardware system.
2. Ensure the ESP8266 connects to Wi-Fi and Firebase.
3. Open the DRINKCLEAN dashboard.
4. Verify incoming live telemetry on the Overview page.
5. Navigate to subsystem pages for deeper analysis.
6. Inspect alerts and acknowledge issues when appropriate.
7. Use History/Export tools for analysis and reporting.

### CSV export

The dashboard supports CSV export of historical data from the Settings or History pages, depending on the enabled feature set.

### Refrigerant and performance comparison

If the refrigerant analysis module has been added, use the analysis page to compare metrics such as average power, estimated COP, and related trends across refrigerant selections.

## Configuration

Depending on the current feature set in the codebase, DRINKCLEAN may support:

- Local or cloud-stored electricity rate configuration
- Refrigerant selection
- Editable alert thresholds
- Theme selection
- Alert acknowledgement state
- Historical range filters
- Daily aggregated analytics

Document any new settings here whenever new config paths are introduced.

## Development Notes

### Frontend patterns
- `src/components/` contains reusable UI pieces.
- `src/pages/` contains route-level screens.
- `src/hooks/` contains Firebase and derived-state hooks.
- `src/utils/` contains formatting, threshold, export, and calculation utilities.

### Recommended improvements for maintainers
- Keep secrets out of the repo.
- Do not commit `node_modules/` or `dist/`.
- Keep Firebase paths documented in this README.
- Update this README whenever new pages or hooks are added.
- Prefer reusable utility modules for derived calculations and export logic.

## Scripts

Common scripts from `package.json` typically include:

```bash
npm run dev
npm run build
npm run preview
```

If mock data population is needed, review:

```text
scripts/populate-mock-data.js
```

## Security Notes

- Never commit real `.env` credentials.
- Never expose Firebase admin secrets in public repos.
- Use separate Firebase projects for development and production.
- Replace permissive database rules before real deployment.
- Rotate exposed credentials immediately if they were committed previously.

## Troubleshooting

### Frontend does not load data
- Verify `.env` values are correct.
- Confirm Firebase Realtime Database is enabled.
- Check browser console for initialization errors.
- Confirm `VITE_FIREBASE_DATABASE_URL` matches the active Firebase project.

### ESP8266 is not uploading data
- Recheck Wi-Fi SSID and password.
- Confirm Firebase host and auth values.
- Verify serial payload format from Arduino.
- Check baud rate and board selection in Arduino IDE.

### No alerts are appearing
- Verify threshold logic in firmware and frontend utility functions.
- Confirm data values are actually crossing configured thresholds.
- Inspect `/alerts` in Firebase Realtime Database.

### Dashboard shows stale values
- Check network connectivity.
- Verify ESP8266 time sync and upload loop.
- Confirm `system/last_updated` is changing in Firebase.

## Roadmap

Planned or recently added enhancements may include:
- Better threshold configuration
- Predictive maintenance indicators
- Water safety scoring
- Refrigerant comparison analytics
- Daily aggregated reporting
- Improved mobile responsiveness
- Role-based access and operator workflows
- Multi-site support
- Cloud notifications (email / Telegram / SMS)

## Contributing

Contributions are welcome.

### Recommended workflow
1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Test the frontend and firmware paths that were affected.
5. Update the README or related documentation if behavior changed.
6. Open a pull request with a clear summary.

### Good contribution areas
- UI improvements
- Firebase schema hardening
- Better charts and analytics
- Sensor calibration workflows
- Hardware documentation
- Deployment automation
- Security and auth improvements

## Documentation

Additional project documents in this repository:
- [`HARDWARE_SETUP_GUIDE.md`](./HARDWARE_SETUP_GUIDE.md)
- [`IMPLEMENTATION_COMPLETE.md`](./IMPLEMENTATION_COMPLETE.md)

If you keep research notes, deployment docs, or wiring diagrams, link them here as well.

## Maintainer

Project owner: **krithick010**

If this repository is used for academic, institutional, or collaborative work, add:
- maintainer email
- department / lab name
- institution
- citation or publication reference, if available

## License

This project should include a `LICENSE` file at the repository root.

Recommended:

```text
MIT License
```

If you have not added one yet, create a `LICENSE` file so the usage terms are explicit, which GitHub recommends alongside the README for setting contributor and user expectations.[web:37]

## Acknowledgements

This project builds on:
- React and Vite frontend tooling
- Firebase Realtime Database for cloud telemetry
- Arduino ecosystem libraries
- ESP8266 networking and firmware libraries
- Open-source visualization and icon libraries used in the dashboard
