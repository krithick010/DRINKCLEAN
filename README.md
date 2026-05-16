# DRINKCLEAN
IoT-enabled solar desalination monitoring dashboard built with React, Vite, Firebase Realtime Database, Tailwind CSS, Lucide Icons, Arduino, and ESP8266.

## Tech Stack
- React
- Vite
- Firebase Realtime Database
- Tailwind CSS
- Lucide Icons
- Arduino
- ESP8266

## Features
- Overview dashboard for the full desalination system.
- Temperature monitoring across connected sensors.
- Pressure monitoring for system flow and safety.
- Water Quality monitoring for desalination output tracking.
- Solar monitoring for energy collection and availability.
- Power monitoring for electrical usage and status.
- Compressor monitoring for core mechanical behavior.
- Alerts view for threshold and status notifications.
- Settings page for configuration and dashboard control.
- CSV export for history and reporting.

## Firebase Database Schema
- `/sensorData/temperature/*`
- `/sensorData/pressure/*`
- `/sensorData/water_quality/*`
- `/sensorData/solar/*`
- `/sensorData/power/*`
- `/sensorData/flow/*`
- `/sensorData/compressor/*`
- `/sensorData/system/*`
- `/history/r_{ts}/*`
- `/alerts/a_{ts}_*`

## Setup Instructions
1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Fill in your Firebase project values in `.env`.
4. Install dependencies with `npm install`.
5. Start the development server with `npm run dev`.

## Hardware Setup
See the full wiring and component guide in [HARDWARE_SETUP_GUIDE.md](HARDWARE_SETUP_GUIDE.md).

## Firmware
Flash `arduino_main.ino` to the Arduino and `esp8266_firebase.ino` to the ESP8266. Configure the WiFi and Firebase credentials directly in the `.ino` files before uploading.

## License
MIT
