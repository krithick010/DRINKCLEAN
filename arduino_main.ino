#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include <math.h>

#define ONE_WIRE_BUS 2
#define FLOW_FEED_PIN 3
#define FLOW_PURIFIED_PIN 4
#define COMPRESSOR_STATUS_PIN 5
#define PRESSURE_SUCTION_PIN A0
#define PRESSURE_DISCHARGE_PIN A1
#define TDS_PIN A2
#define PH_PIN A3
#define CONDUCTIVITY_PIN A4
#define SOLAR_PIN A5

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

volatile unsigned long feedPulseCount = 0;
volatile unsigned long purifiedPulseCount = 0;

unsigned long lastSampleMillis = 0;
const unsigned long sampleIntervalMillis = 5000;

void countFeedFlow() {
  feedPulseCount++;
}

void countPurifiedFlow() {
  purifiedPulseCount++;
}

float readPressure(int pin) {
  float voltage = analogRead(pin) * (5.0 / 1023.0);
  float pressure = (voltage - 0.5) / (4.5 - 0.5) * 30.0;
  if (pressure < 0.0) {
    pressure = 0.0;
  }
  return pressure;
}

float readTDS() {
  float voltage = analogRead(TDS_PIN) * (5.0 / 1023.0);
  return (133.42 * pow(voltage, 3) - 255.86 * pow(voltage, 2) + 857.39 * voltage) * 0.5;
}

float readPH() {
  float voltage = analogRead(PH_PIN) * (5.0 / 1023.0);
  return 3.5 * voltage;
}

float readConductivity() {
  float voltage = analogRead(CONDUCTIVITY_PIN) * (5.0 / 1023.0);
  return voltage * 1000.0;
}

float readSalinity(float conductivity) {
  return conductivity * 0.00036;
}

float readIrradiance() {
  float voltage = analogRead(SOLAR_PIN) * (5.0 / 1023.0);
  return voltage * 240.0;
}

float readVoltage() {
  float voltage = analogRead(A0) * (5.0 / 1023.0);
  return voltage * 44.0;
}

float readCurrent() {
  float voltage = analogRead(A1) * (5.0 / 1023.0);
  return (voltage - 2.5) / 0.066;
}

float readFlowRate(volatile unsigned long &pulseCount, float intervalSeconds) {
  noInterrupts();
  unsigned long pulses = pulseCount;
  pulseCount = 0;
  interrupts();
  return (pulses / 7.5) / (intervalSeconds / 60.0);
}

void setup() {
  Serial.begin(9600);
  sensors.begin();

  pinMode(FLOW_FEED_PIN, INPUT_PULLUP);
  pinMode(FLOW_PURIFIED_PIN, INPUT_PULLUP);
  pinMode(COMPRESSOR_STATUS_PIN, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(FLOW_FEED_PIN), countFeedFlow, RISING);
  attachInterrupt(digitalPinToInterrupt(FLOW_PURIFIED_PIN), countPurifiedFlow, RISING);

  lastSampleMillis = millis();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleMillis < sampleIntervalMillis) {
    return;
  }

  float intervalSeconds = (now - lastSampleMillis) / 1000.0;
  lastSampleMillis = now;

  sensors.requestTemperatures();

  float temperatures[7];
  for (int i = 0; i < 7; i++) {
    temperatures[i] = sensors.getTempCByIndex(i);
  }

  float suctionPressure = readPressure(PRESSURE_SUCTION_PIN);
  float dischargePressure = readPressure(PRESSURE_DISCHARGE_PIN);
  float feedFlowRate = readFlowRate(feedPulseCount, intervalSeconds);
  float purifiedFlowRate = readFlowRate(purifiedPulseCount, intervalSeconds);
  float tds = readTDS();
  float ph = readPH();
  float conductivity = readConductivity();
  float salinity = readSalinity(conductivity);
  float irradiance = readIrradiance();
  float voltage = readVoltage();
  float current = readCurrent();
  float power = voltage * current;
  String compressorStatus = digitalRead(COMPRESSOR_STATUS_PIN) == HIGH ? "ON" : "OFF";

  StaticJsonDocument<1024> doc;

  JsonObject temperature = doc.createNestedObject("temperature");
  temperature["evaporator"] = temperatures[0];
  temperature["condenser"] = temperatures[1];
  temperature["comp_inlet"] = temperatures[2];
  temperature["comp_outlet"] = temperatures[3];
  temperature["solar_collector"] = temperatures[4];
  temperature["feed_water"] = temperatures[5];
  temperature["purified_water"] = temperatures[6];

  JsonObject pressure = doc.createNestedObject("pressure");
  pressure["suction"] = suctionPressure;
  pressure["discharge"] = dischargePressure;

  JsonObject flow = doc.createNestedObject("flow");
  flow["feed_water_flow"] = feedFlowRate;
  flow["purified_water_flow"] = purifiedFlowRate;

  JsonObject waterQuality = doc.createNestedObject("water_quality");
  waterQuality["tds"] = tds;
  waterQuality["ph"] = ph;
  waterQuality["conductivity"] = conductivity;
  waterQuality["salinity"] = salinity;

  JsonObject solar = doc.createNestedObject("solar");
  solar["irradiance"] = irradiance;

  JsonObject powerObject = doc.createNestedObject("power");
  powerObject["voltage"] = voltage;
  powerObject["current"] = current;
  powerObject["power_consumption"] = power;

  JsonObject compressor = doc.createNestedObject("compressor");
  compressor["status"] = compressorStatus;

  serializeJson(doc, Serial);
  Serial.println();
}
