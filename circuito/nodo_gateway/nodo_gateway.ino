/*
  MINAC - Nodo GATEWAY
  Siempre tiene señal WiFi (representa el punto de la mina con conectividad).
  Envía su propia lectura directo a la API, y además escucha por radio
  NRF24L01 lecturas de otros nodos sin conexión para retransmitirlas.

  Conexiones: mismas que en pruebas anteriores
  Librerías requeridas: Adafruit ADS1X15, RF24 (TMRh20), WiFi (incluida en ESP32)
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <SPI.h>
#include <RF24.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ============================================================
// >>> CONFIGURAR ANTES DE SUBIR <<<
#define NODO_ID 2
const char* WIFI_SSID     = "HolaCafecitoColinas";
const char* WIFI_PASSWORD = "HolaColinas";
const char* API_URL       = "https://minac-production-9424.up.railway.app/monitoreo";
// ============================================================

#define CE_PIN 4
#define CSN_PIN 5

Adafruit_ADS1115 ads;
RF24 radio(CE_PIN, CSN_PIN);

const byte direccion[6] = "GATE1"; // Debe coincidir con el pipe del nodo sin conexión

const float FACTOR_DIVISOR = 30.0 / 20.0;

struct PaqueteSensores {
  uint8_t  nodo_id;
  float    mq2;
  float    mq7;
  float    mq135;
  float    mq136;
  uint32_t timestamp_ms;
  uint8_t  retransmitido;
};

PaqueteSensores paqueteLocal;
PaqueteSensores paqueteRecibido;

unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_MS = 5000;

void leerSensores(PaqueteSensores &p) {
  p.nodo_id       = NODO_ID;
  p.mq2           = ads.computeVolts(ads.readADC_SingleEnded(0)) * FACTOR_DIVISOR;
  p.mq7           = ads.computeVolts(ads.readADC_SingleEnded(1)) * FACTOR_DIVISOR;
  p.mq135         = ads.computeVolts(ads.readADC_SingleEnded(2)) * FACTOR_DIVISOR;
  p.mq136         = ads.computeVolts(ads.readADC_SingleEnded(3)) * FACTOR_DIVISOR;
  p.timestamp_ms  = millis();
  p.retransmitido = 0;
}

bool enviarAPI(const PaqueteSensores &p, const char* via) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  // Formato que espera el CreateMonitoreoDto real del backend
  String idEquipo = "ESP32-00" + String(p.nodo_id);
  String idGateway = "ESP32-00" + String(NODO_ID);

  String json = "{";
  json += "\"idEquipo\":\"" + idEquipo + "\",";
  json += "\"mq2\":" + String(p.mq2, 3) + ",";
  json += "\"mq7\":" + String(p.mq7, 3) + ",";
  json += "\"mq135\":" + String(p.mq135, 3) + ",";
  json += "\"mq136\":" + String(p.mq136, 3) + ",";
  json += "\"timestamp\":" + String(p.timestamp_ms) + ",";
  json += "\"via\":\"" + String(via) + "\"";
  if (String(via) == "retransmitido") {
    json += ",\"retransmitidoPor\":\"" + idGateway + "\"";
  }
  json += "}";

  int codigo = http.POST(json);
  http.end();

  Serial.print("[API] POST (");
  Serial.print(via);
  Serial.print(") -> código HTTP: ");
  Serial.println(codigo);

  return (codigo > 0 && codigo < 300);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - Nodo GATEWAY ===");

  Wire.begin(21, 22);
  if (!ads.begin(0x48)) {
    Serial.println("ERROR: ADS1115 no detectado.");
    while (1) { delay(1000); }
  }
  ads.setGain(GAIN_ONE);

  if (!radio.begin()) {
    Serial.println("ERROR: NRF24L01 no detectado.");
    while (1) { delay(1000); }
  }
  radio.setPALevel(RF24_PA_MAX);
  radio.setDataRate(RF24_250KBPS);
  radio.setChannel(90);
  radio.openReadingPipe(1, direccion);
  radio.startListening();

  Serial.print("Conectando a WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println(" conectado.");
}

void loop() {
  // Revisar constantemente si llegó una lectura retransmitida por radio
  if (radio.available()) {
    radio.read(&paqueteRecibido, sizeof(paqueteRecibido));
    paqueteRecibido.retransmitido = 1;

    Serial.println("---------------------------------------------");
    Serial.print("[RECIBIDO POR RADIO] del nodo ");
    Serial.println(paqueteRecibido.nodo_id);

    enviarAPI(paqueteRecibido, "retransmitido");
  }

  // Enviar la propia lectura cada INTERVALO_MS
  if (millis() - ultimaLectura >= INTERVALO_MS) {
    ultimaLectura = millis();
    leerSensores(paqueteLocal);

    Serial.println("---------------------------------------------");
    Serial.print("[LECTURA PROPIA] nodo ");
    Serial.println(paqueteLocal.nodo_id);

    enviarAPI(paqueteLocal, "directo");
  }
}
