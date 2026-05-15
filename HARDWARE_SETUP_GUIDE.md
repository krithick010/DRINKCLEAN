# Complete Hardware Setup Guide
## From Sensors to Live Dashboard

This guide walks you through connecting Arduino + ESP8266 + Sensors to your live dashboard.

---

## 📦 PART 1: SHOPPING LIST

### Core Components
- **Arduino Uno R3** (1x) - Main microcontroller
- **ESP8266 ESP-01** or **NodeMCU ESP8266** (1x) - WiFi module
- **Breadboard** (2x large) - For prototyping
- **Jumper wires** (Male-Male, Male-Female, Female-Female)
- **5V Power Supply** (2A minimum) - For Arduino
- **3.3V Voltage Regulator** (AMS1117-3.3) - For ESP8266

### Temperature Sensors (7x)
- **DS18B20 Waterproof Temperature Sensors** (7x)
  - Buy the waterproof version with cable
  - Each has 3 wires: Red (VCC), Black (GND), Yellow (Data)
- **4.7kΩ Resistor** (1x) - Pull-up resistor for OneWire bus

### Pressure Sensors (2x)
- **Analog Pressure Transducers** (2x)
  - 0-5V output, 0-30 bar range
  - Example: G1/4" thread pressure sensor
  - One for suction (low pressure)
  - One for discharge (high pressure)

### Flow Sensors (2x)
- **YF-S201 Hall Effect Flow Sensors** (2x)
  - 1-30 L/min range
  - 3 wires: Red (VCC), Black (GND), Yellow (Signal)

### Water Quality Sensors (4x)
- **TDS Sensor** (1x) - Total Dissolved Solids
  - Analog output (0-5V)
  - Example: TDS-3 sensor module
- **pH Sensor** (1x) - pH meter
  - Analog output with BNC connector
  - Example: pH-4502C sensor module
- **Conductivity Sensor** (1x)
  - Analog output
  - Example: DFRobot Analog Electrical Conductivity Sensor
- **Salinity Sensor** (1x) - Can use conductivity sensor + calculation

### Solar Sensor (1x)
- **Solar Irradiance Sensor** (1x)
  - Pyranometer or silicon photodiode
  - 0-5V output (0-1200 W/m²)
  - Example: Apogee SP-110 or cheaper alternative

### Power Monitoring (2x)
- **ZMPT101B AC Voltage Sensor** (1x)
  - Measures 0-250V AC
  - Analog output
- **ACS712 Current Sensor** (1x)
  - 30A version recommended
  - Analog output

### Compressor Status
- **Relay Module** (1x) - To read compressor ON/OFF state
  - Or use optocoupler to read AC signal safely

### Additional Components
- **CD74HC4051 Analog Multiplexer** (1x) - Arduino Uno has only 6 analog pins
  - OR upgrade to **Arduino Mega 2560** (16 analog pins - RECOMMENDED)
- **Resistors**: 1kΩ (2x), 2kΩ (2x) - For voltage divider
- **Capacitors**: 100µF (2x) - Power supply smoothing
- **Screw terminals** - For secure sensor connections

---

## 🔌 PART 2: WIRING DIAGRAM

### Option A: Arduino Uno (Requires Multiplexer)

```
ARDUINO UNO PIN CONNECTIONS:

DIGITAL PINS:
├─ Pin 0 (RX)  ──────────────────────► ESP8266 TX
├─ Pin 1 (TX)  ──[1kΩ]──┬────────────► ESP8266 RX
│                        │
│                      [2kΩ]
│                        │
│                       GND
├─ Pin 2       ──────────────────────► DS18B20 Data (all 7 sensors)
├─ Pin 3       ──────────────────────► Feed Water Flow Sensor (INT0)
├─ Pin 4       ──────────────────────► Purified Water Flow Sensor
├─ Pin 5       ──────────────────────► Compressor Status (Relay/Optocoupler)
└─ Pin 13      ──────────────────────► Built-in LED (status indicator)

ANALOG PINS:
├─ A0          ──────────────────────► Suction Pressure Sensor
├─ A1          ──────────────────────► Discharge Pressure Sensor
├─ A2          ──────────────────────► TDS Sensor
├─ A3          ──────────────────────► pH Sensor
├─ A4          ──────────────────────► Conductivity Sensor
└─ A5          ──────────────────────► Solar Irradiance Sensor

POWER:
├─ 5V          ──────────────────────► All sensor VCC (except ESP8266)
├─ 3.3V        ──────────────────────► ESP8266 VCC + CH_PD
└─ GND         ──────────────────────► Common ground for all components

NOTE: For voltage/current sensors, use CD74HC4051 multiplexer
      OR upgrade to Arduino Mega 2560
```

### Option B: Arduino Mega 2560 (RECOMMENDED - No Multiplexer Needed)

```
ARDUINO MEGA 2560 PIN CONNECTIONS:

DIGITAL PINS:
├─ Pin 0 (RX)  ──────────────────────► ESP8266 TX
├─ Pin 1 (TX)  ──[1kΩ]──┬────────────► ESP8266 RX
│                        │
│                      [2kΩ]
│                        │
│                       GND
├─ Pin 2       ──────────────────────► DS18B20 Data (all 7 sensors)
├─ Pin 3       ──────────────────────► Feed Water Flow Sensor (INT0)
├─ Pin 4       ──────────────────────► Purified Water Flow Sensor
└─ Pin 5       ──────────────────────► Compressor Status

ANALOG PINS (16 available!):
├─ A0          ──────────────────────► Suction Pressure Sensor
├─ A1          ──────────────────────► Discharge Pressure Sensor
├─ A2          ──────────────────────► TDS Sensor
├─ A3          ──────────────────────► pH Sensor
├─ A4          ──────────────────────► Conductivity Sensor
├─ A5          ──────────────────────► Salinity Sensor (or calculated)
├─ A6          ──────────────────────► Solar Irradiance Sensor
├─ A7          ──────────────────────► AC Voltage Sensor (ZMPT101B)
└─ A8          ──────────────────────► AC Current Sensor (ACS712)

POWER:
├─ 5V          ──────────────────────► All sensor VCC
├─ 3.3V        ──────────────────────► ESP8266 VCC + CH_PD
└─ GND         ──────────────────────► Common ground
```

### DS18B20 Temperature Sensors (All 7 Connected in Parallel)

```
DS18B20 Wiring (OneWire Bus):

Arduino Pin 2 ────────┬──────────────► DS18B20 #1 (Yellow - Data)
                      │
                      ├──────────────► DS18B20 #2 (Yellow - Data)
                      │
                      ├──────────────► DS18B20 #3 (Yellow - Data)
                      │
                      ├──────────────► DS18B20 #4 (Yellow - Data)
                      │
                      ├──────────────► DS18B20 #5 (Yellow - Data)
                      │
                      ├──────────────► DS18B20 #6 (Yellow - Data)
                      │
                      └──────────────► DS18B20 #7 (Yellow - Data)

Arduino 5V ──────────┬──────────────► All DS18B20 Red wires (VCC)
                     │
                   [4.7kΩ]  ← Pull-up resistor between Data and VCC
                     │
Arduino Pin 2 ───────┘

Arduino GND ─────────────────────────► All DS18B20 Black wires (GND)
```

### ESP8266 Wiring (CRITICAL - Voltage Divider Required!)

```
ESP8266 ESP-01 Module:

Arduino 3.3V ────────────────────────► ESP8266 VCC
Arduino 3.3V ────────────────────────► ESP8266 CH_PD (Chip Enable)
Arduino GND ─────────────────────────► ESP8266 GND

Arduino TX (Pin 1) ──[1kΩ]──┬───────► ESP8266 RX
                             │
                           [2kΩ]
                             │
                            GND

Arduino RX (Pin 0) ◄─────────────────  ESP8266 TX

⚠️ WARNING: The voltage divider (1kΩ + 2kΩ) is MANDATORY!
   Arduino TX is 5V, but ESP8266 RX is 3.3V max.
   Without voltage divider, ESP8266 will be damaged!
```

---

## 💻 PART 3: SOFTWARE SETUP

### Step 1: Install Arduino IDE

1. Download from: https://www.arduino.cc/en/software
2. Install for your OS (Windows/Mac/Linux)
3. Open Arduino IDE

### Step 2: Install ESP8266 Board Support

1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Board Manager URLs", add:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search "ESP8266" and install **ESP8266 by ESP8266 Community**
6. Restart Arduino IDE

### Step 3: Install Required Libraries

Go to **Sketch → Include Library → Manage Libraries**, then install:

**For Arduino:**
- `OneWire` by Paul Stoffregen
- `DallasTemperature` by Miles Burton

**For ESP8266:**
- `Firebase ESP8266 Client` by Mobizt
- `ArduinoJson` by Benoit Blanchon

### Step 4: Upload Arduino Code

1. Open `arduino_main.ino` from your project folder
2. Connect Arduino Uno/Mega via USB
3. Select **Tools → Board → Arduino Uno** (or Mega 2560)
4. Select **Tools → Port → [Your Arduino Port]**
5. Click **Upload** button (→)
6. Wait for "Done uploading" message

### Step 5: Upload ESP8266 Code

1. **Disconnect Arduino from USB** (important!)
2. Wire ESP8266 in programming mode:
   ```
   ESP8266 GPIO0 ──────► GND (to enter flash mode)
   ESP8266 VCC   ──────► 3.3V
   ESP8266 GND   ──────► GND
   ESP8266 CH_PD ──────► 3.3V
   ESP8266 TX    ──────► USB-Serial RX
   ESP8266 RX    ──────► USB-Serial TX (via voltage divider!)
   ```
3. Open `esp8266_firebase.ino`
4. **EDIT WiFi and Firebase credentials:**
   ```cpp
   #define WIFI_SSID      "YOUR_WIFI_NAME"
   #define WIFI_PASSWORD  "YOUR_WIFI_PASSWORD"
   #define FIREBASE_HOST  "iotsensor-d0465-default-rtdb.firebaseio.com"
   #define FIREBASE_AUTH  "YOUR_DATABASE_SECRET"
   ```
5. Get Firebase Database Secret:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Database secrets" → Copy the secret key
6. Select **Tools → Board → Generic ESP8266 Module**
7. Select **Tools → Port → [Your ESP8266 Port]**
8. Click **Upload**
9. After upload, disconnect GPIO0 from GND
10. Reset ESP8266 (power cycle)

---

## 🔧 PART 4: PHYSICAL INSTALLATION

### Temperature Sensors Installation

1. **Evaporator Inlet** - Install DS18B20 #1 at evaporator inlet pipe
2. **Condenser Outlet** - Install DS18B20 #2 at condenser outlet pipe
3. **Compressor Inlet** - Install DS18B20 #3 at compressor suction line
4. **Compressor Outlet** - Install DS18B20 #4 at compressor discharge line
5. **Solar Collector Outlet** - Install DS18B20 #5 at solar collector outlet
6. **Feed Water** - Install DS18B20 #6 in feed water line
7. **Purified Water** - Install DS18B20 #7 in purified water line

**Installation Tips:**
- Use thermal paste for better contact
- Secure with hose clamps or zip ties
- Insulate exposed sensors to prevent ambient temperature interference

### Pressure Sensors Installation

1. **Suction Pressure** - Install at compressor suction line (low side)
   - Use G1/4" thread adapter
   - Apply Teflon tape to threads
2. **Discharge Pressure** - Install at compressor discharge line (high side)
   - Use pressure-rated fittings
   - Ensure sensor rating exceeds max system pressure

### Flow Sensors Installation

1. **Feed Water Flow** - Install inline in feed water pipe
   - Arrow on sensor shows flow direction
   - Use appropriate pipe adapters (usually 1/2" or 3/4")
2. **Purified Water Flow** - Install inline in purified water output
   - Ensure no air bubbles in line

### Water Quality Sensors Installation

1. **TDS Sensor** - Submerge probe in purified water tank
2. **pH Sensor** - Submerge probe in purified water tank
   - Calibrate with pH 4.0 and pH 7.0 buffer solutions
3. **Conductivity Sensor** - Submerge in feed water tank
4. **Salinity** - Can use conductivity reading × 0.00036

### Solar Irradiance Sensor

- Mount pyranometer on same plane as solar collector
- Face sensor upward (horizontal)
- Keep sensor clean and unobstructed

### Power Monitoring

1. **Voltage Sensor (ZMPT101B)** - Connect to AC line (after main breaker)
   - ⚠️ HIGH VOLTAGE - Use proper insulation
   - Consider hiring electrician for safety
2. **Current Sensor (ACS712)** - Clamp around one AC wire
   - Install on compressor power line

### Compressor Status

- Connect relay coil in parallel with compressor contactor
- Or use optocoupler to read 24V control signal
- Provides digital HIGH when compressor is ON

---

## 🧪 PART 5: TESTING & CALIBRATION

### Step 1: Power On Test

1. Connect Arduino to 5V power supply
2. ESP8266 should auto-connect to WiFi (blue LED blinks)
3. Open Arduino IDE → **Tools → Serial Monitor** (9600 baud)
4. You should see JSON data being sent every 5 seconds:
   ```
   DATA:{"temperature":{"evaporator":45.2,...},...}
   ```

### Step 2: Check Firebase

1. Open Firebase Console → Realtime Database
2. Navigate to `/sensorData/`
3. You should see live data updating every 5 seconds
4. Check `/history/` for time-series entries

### Step 3: Check Dashboard

1. Open your dashboard: `http://localhost:5173`
2. All sensor cards should show live values (not "--")
3. Charts should populate with data points
4. Status should show "Online"

### Step 4: Sensor Calibration

**Temperature Sensors:**
- Compare readings with calibrated thermometer
- DS18B20 is usually accurate ±0.5°C (no calibration needed)

**Pressure Sensors:**
- Use calibrated pressure gauge
- Adjust formula in Arduino code if needed:
  ```cpp
  float pressure = (voltage - 0.5) / 4.0 * 30.0; // Adjust multiplier
  ```

**pH Sensor:**
- Calibrate with pH 4.0 buffer → adjust offset
- Calibrate with pH 7.0 buffer → adjust slope
- Update formula in Arduino code

**Flow Sensors:**
- Measure actual flow with bucket + stopwatch
- Adjust pulse-to-flow formula:
  ```cpp
  float flowRate = (pulseCount / 7.5) / (intervalSeconds / 60.0);
  // Change 7.5 to match your sensor's pulses per liter
  ```

**TDS Sensor:**
- Calibrate with TDS calibration solution (e.g., 1413 µS/cm)
- Adjust polynomial coefficients in code

---

## 🚨 PART 6: TROUBLESHOOTING

### Arduino Not Uploading
- Check USB cable (use data cable, not charge-only)
- Check correct board selected in Tools → Board
- Check correct port selected in Tools → Port
- Try pressing reset button before upload

### ESP8266 Not Connecting to WiFi
- Check WiFi credentials (case-sensitive!)
- Ensure 2.4GHz WiFi (ESP8266 doesn't support 5GHz)
- Check ESP8266 has stable 3.3V power (use external regulator if needed)
- Check voltage divider on TX→RX line

### No Data in Firebase
- Check Firebase credentials in ESP8266 code
- Check Firebase Database Rules (should be open for testing)
- Open Serial Monitor to see error messages
- Check internet connection

### Dashboard Shows "--" for All Values
- Check Firebase Database URL in `.env` file
- Check browser console for errors (F12)
- Verify data exists in Firebase Console
- Check `/sensorData/` path structure matches code

### Sensors Reading Wrong Values
- Check sensor wiring (VCC, GND, Signal)
- Check voltage levels (5V sensors need 5V, not 3.3V)
- Calibrate sensors with known references
- Check for loose connections

### ESP8266 Keeps Resetting
- Insufficient power supply (needs stable 3.3V, 250mA+)
- Use external voltage regulator (AMS1117-3.3)
- Add 100µF capacitor between VCC and GND

---

## 📊 PART 7: GOING LIVE

### Option 1: Keep Dashboard Local
- Run `npm run dev` on your computer
- Access at `http://localhost:5173`
- Only works when computer is on

### Option 2: Deploy to Firebase Hosting (FREE)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   cd /Users/vmeenakshisundaram/Desktop/DRINKCLEAN
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory: `dist`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. Build your app:
   ```bash
   npm run build
   ```

5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

6. Access your dashboard at:
   ```
   https://iotsensor-d0465.web.app
   ```

### Option 3: Deploy to Vercel (FREE)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd /Users/vmeenakshisundaram/Desktop/DRINKCLEAN
   vercel
   ```

3. Follow prompts, then access at provided URL

---

## 🔒 PART 8: SECURITY (IMPORTANT!)

### Firebase Security Rules

Replace test rules with production rules:

```json
{
  "rules": {
    "sensorData": {
      ".read": true,
      ".write": "auth != null"
    },
    "history": {
      ".read": true,
      ".write": "auth != null"
    },
    "alerts": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### Get Firebase Auth Token for ESP8266

1. Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Use Firebase Admin SDK to generate custom token
4. Update ESP8266 code with token

---

## 📝 MAINTENANCE CHECKLIST

### Daily
- [ ] Check dashboard shows "Online" status
- [ ] Verify sensor readings are reasonable
- [ ] Check for critical alerts

### Weekly
- [ ] Clean sensor probes (TDS, pH, conductivity)
- [ ] Check for loose wire connections
- [ ] Verify flow sensors are not clogged

### Monthly
- [ ] Calibrate pH sensor with buffer solutions
- [ ] Check TDS sensor calibration
- [ ] Inspect temperature sensor mounting
- [ ] Clean solar irradiance sensor

### Quarterly
- [ ] Replace pH sensor probe (if readings drift)
- [ ] Check pressure sensor accuracy
- [ ] Backup Firebase data (export CSV)

---

## 🎓 LEARNING RESOURCES

- Arduino Official Tutorials: https://www.arduino.cc/en/Tutorial/HomePage
- ESP8266 Documentation: https://arduino-esp8266.readthedocs.io/
- Firebase Realtime Database: https://firebase.google.com/docs/database
- OneWire Library: https://www.pjrc.com/teensy/td_libs_OneWire.html

---

## 💡 TIPS FOR SUCCESS

1. **Start Simple** - Test one sensor at a time before connecting all
2. **Use Mega 2560** - Saves headache with analog pin shortage
3. **Stable Power** - Use quality 5V/2A power supply, not USB power
4. **Label Everything** - Label all wires and sensors during installation
5. **Test Indoors First** - Verify everything works before field installation
6. **Keep Backups** - Save working Arduino/ESP8266 code versions
7. **Monitor Serial Output** - Use Serial Monitor to debug issues
8. **Document Changes** - Note any calibration adjustments you make

---

## 🆘 NEED HELP?

If you get stuck:
1. Check Serial Monitor output for error messages
2. Verify wiring matches diagrams exactly
3. Test sensors individually with simple Arduino sketches
4. Check Firebase Console for data structure
5. Review browser console (F12) for JavaScript errors

Your dashboard is ready - it's just waiting for real sensor data! 🚀
