#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <ArduinoJson.h>
#include <time.h>

#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define FIREBASE_HOST "your-project-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET_KEY"

FirebaseData firebaseData;
FirebaseAuth firebaseAuth;
FirebaseConfig firebaseConfig;

String buffer = "";
unsigned long lastTimestamp = 0;

struct AlertRule {
  const char* sensor;
  float warningMin;
  float warningMax;
  float criticalMin;
  float criticalMax;
  const char* warningMessage;
  const char* criticalMessage;
};

void setupTime() {
  configTime(19800, 0, "pool.ntp.org");
  time_t now = time(nullptr);
  while (now < 100000) {
    delay(500);
    now = time(nullptr);
  }
}

unsigned long getUnixTimestamp() {
  time_t now = time(nullptr);
  return (unsigned long)now;
}

String severityForValue(float value, const AlertRule& rule) {
  if (!isnan(rule.criticalMin) && value < rule.criticalMin) return "CRITICAL";
  if (!isnan(rule.criticalMax) && value > rule.criticalMax) return "CRITICAL";
  if (!isnan(rule.warningMin) && value < rule.warningMin) return "WARNING";
  if (!isnan(rule.warningMax) && value > rule.warningMax) return "WARNING";
  return "";
}

void writeAlert(const char* sensor, float value, const char* severity, const char* message) {
  unsigned long ts = getUnixTimestamp();
  FirebaseJson alertJson;
  alertJson.set("ts", ts);
  alertJson.set("sensor", sensor);
  alertJson.set("value", value);
  alertJson.set("severity", severity);
  alertJson.set("message", message);
  String path = "/alerts/a_" + String(ts) + "_" + String(random(1000, 9999));
  Firebase.RTDB.setJSON(&firebaseData, path.c_str(), &alertJson);
}

void checkAlerts(const JsonObject& sensorData) {
  float evaporator = sensorData["temperature"]["evaporator"] | NAN;
  float condenser = sensorData["temperature"]["condenser"] | NAN;
  float compOutlet = sensorData["temperature"]["comp_outlet"] | NAN;
  float suction = sensorData["pressure"]["suction"] | NAN;
  float discharge = sensorData["pressure"]["discharge"] | NAN;
  float tds = sensorData["water_quality"]["tds"] | NAN;
  float ph = sensorData["water_quality"]["ph"] | NAN;

  if (!isnan(evaporator) && evaporator > 70.0) writeAlert("temperature/evaporator", evaporator, "CRITICAL", "Evaporator temp exceeded 70C");
  else if (!isnan(evaporator) && evaporator > 55.0) writeAlert("temperature/evaporator", evaporator, "WARNING", "Evaporator temp exceeded 55C");

  if (!isnan(condenser) && condenser > 95.0) writeAlert("temperature/condenser", condenser, "CRITICAL", "Condenser temp exceeded 95C");
  else if (!isnan(condenser) && condenser > 80.0) writeAlert("temperature/condenser", condenser, "WARNING", "Condenser temp exceeded 80C");

  if (!isnan(compOutlet) && compOutlet > 105.0) writeAlert("temperature/comp_outlet", compOutlet, "CRITICAL", "Compressor outlet temp exceeded 105C");
  else if (!isnan(compOutlet) && compOutlet > 90.0) writeAlert("temperature/comp_outlet", compOutlet, "WARNING", "Compressor outlet temp exceeded 90C");

  if (!isnan(suction) && (suction < 2.0 || suction > 5.0)) writeAlert("pressure/suction", suction, "WARNING", "Suction pressure outside safe range");
  if (!isnan(discharge) && (discharge < 10.0 || discharge > 16.0)) writeAlert("pressure/discharge", discharge, "WARNING", "Discharge pressure outside safe range");

  if (!isnan(tds) && tds > 1000.0) writeAlert("water_quality/tds", tds, "CRITICAL", "TDS exceeded 1000 ppm");
  else if (!isnan(tds) && tds > 500.0) writeAlert("water_quality/tds", tds, "WARNING", "TDS exceeded 500 ppm");

  if (!isnan(ph) && (ph < 5.5 || ph > 9.5)) writeAlert("water_quality/ph", ph, "CRITICAL", "pH outside critical range");
  else if (!isnan(ph) && (ph < 6.5 || ph > 8.5)) writeAlert("water_quality/ph", ph, "WARNING", "pH outside safe range");
}

void writeHistory(const JsonDocument& data, unsigned long ts) {
  FirebaseJson historyJson;
  historyJson.set("ts", ts);
  historyJson.set("t_ev", data["temperature"]["evaporator"] | 0.0);
  historyJson.set("t_co", data["temperature"]["condenser"] | 0.0);
  historyJson.set("t_sc", data["temperature"]["solar_collector"] | 0.0);
  historyJson.set("p_su", data["pressure"]["suction"] | 0.0);
  historyJson.set("p_di", data["pressure"]["discharge"] | 0.0);
  historyJson.set("tds", data["water_quality"]["tds"] | 0.0);
  historyJson.set("ph", data["water_quality"]["ph"] | 0.0);
  historyJson.set("sol", data["solar"]["irradiance"] | 0.0);
  historyJson.set("pwr", data["power"]["power_consumption"] | 0.0);

  String path = "/history/r_" + String(ts);
  Firebase.RTDB.setJSON(&firebaseData, path.c_str(), &historyJson);
}

void writeLiveData(const JsonDocument& data, unsigned long ts) {
  FirebaseJson liveJson;
  liveJson.set("temperature/evaporator", data["temperature"]["evaporator"] | 0.0);
  liveJson.set("temperature/condenser", data["temperature"]["condenser"] | 0.0);
  liveJson.set("temperature/comp_inlet", data["temperature"]["comp_inlet"] | 0.0);
  liveJson.set("temperature/comp_outlet", data["temperature"]["comp_outlet"] | 0.0);
  liveJson.set("temperature/solar_collector", data["temperature"]["solar_collector"] | 0.0);
  liveJson.set("temperature/feed_water", data["temperature"]["feed_water"] | 0.0);
  liveJson.set("temperature/purified_water", data["temperature"]["purified_water"] | 0.0);
  liveJson.set("pressure/suction", data["pressure"]["suction"] | 0.0);
  liveJson.set("pressure/discharge", data["pressure"]["discharge"] | 0.0);
  liveJson.set("flow/feed_water_flow", data["flow"]["feed_water_flow"] | 0.0);
  liveJson.set("flow/purified_water_flow", data["flow"]["purified_water_flow"] | 0.0);
  liveJson.set("water_quality/tds", data["water_quality"]["tds"] | 0.0);
  liveJson.set("water_quality/ph", data["water_quality"]["ph"] | 0.0);
  liveJson.set("water_quality/conductivity", data["water_quality"]["conductivity"] | 0.0);
  liveJson.set("water_quality/salinity", data["water_quality"]["salinity"] | 0.0);
  liveJson.set("solar/irradiance", data["solar"]["irradiance"] | 0.0);
  liveJson.set("power/voltage", data["power"]["voltage"] | 0.0);
  liveJson.set("power/current", data["power"]["current"] | 0.0);
  liveJson.set("power/power_consumption", data["power"]["power_consumption"] | 0.0);
  liveJson.set("compressor/status", data["compressor"]["status"] | "OFF");
  liveJson.set("system/last_updated", ts);
  liveJson.set("system/wifi_rssi", WiFi.RSSI());
  liveJson.set("system/refrigerant", "R134a");

  Firebase.RTDB.updateNode(&firebaseData, "/sensorData", &liveJson);
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void setupFirebase() {
  firebaseConfig.host = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);
}

void setup() {
  Serial.begin(9600);
  connectWiFi();
  setupTime();
  setupFirebase();
  randomSeed(ESP.getChipId());
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      if (buffer.startsWith("DATA:")) {
        String json = buffer.substring(5);
        StaticJsonDocument<1024> doc;
        DeserializationError error = deserializeJson(doc, json);
        if (!error) {
          unsigned long ts = getUnixTimestamp();
          writeLiveData(doc, ts);
          writeHistory(doc, ts);
          checkAlerts(doc.as<JsonObject>());
        }
      }
      buffer = "";
    } else {
      buffer += c;
    }
  }
}
