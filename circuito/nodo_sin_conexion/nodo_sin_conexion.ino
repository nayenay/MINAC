/*
  MINAC - Nodo SIN CONEXIÓN GARANTIZADA
  Intenta enviar directo a la API por WiFi. Si no logra conectarse en el
  tiempo límite (simulando una zona de la mina sin señal), envía su
  lectura por radio NRF24L01 al nodo Gateway para que él la retransmita.

  Conexiones: mismas que en pruebas anteriores
  (ADS1115 por I2C, NRF24L01 por SPI, 4 sensores MQ con divisor de voltaje)

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
#define NODO_ID 1
const char* WIFI_SSID     = "Prueba";
const char* WIFI_PASSWORD = "sinconexion";
const char* API_URL       = "https://minac-production-9424.up.railway.app/monitoreo";
const unsigned long TIMEOUT_WIFI_MS = 5000; // Tiempo máximo esperando señal
// ============================================================

#define CE_PIN 4
#define CSN_PIN 5

Adafruit_ADS1115 ads;
RF24 radio(CE_PIN, CSN_PIN);

const byte direccion[6] = "GATE1"; // Debe coincidir con el pipe del gateway

const float FACTOR_DIVISOR = 30.0 / 20.0;

struct PaqueteSensores {
  uint8_t  nodo_id;
  float    mq2;
  float    mq7;
  float    mq135;
  float    mq136;
  uint32_t timestamp_ms;
  uint8_t  retransmitido; // 0 = enviado directo, 1 = llegó por radio a través de otro nodo
};

PaqueteSensores paquete;
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

bool enviarDirectoAPI(const PaqueteSensores &p) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  // Formato que espera el CreateMonitoreoDto real del backend
  String idEquipo = "ESP32-00" + String(p.nodo_id);

  String json = "{";
  json += "\"idEquipo\":\"" + idEquipo + "\",";
  json += "\"mq2\":" + String(p.mq2, 3) + ",";
  json += "\"mq7\":" + String(p.mq7, 3) + ",";
  json += "\"mq135\":" + String(p.mq135, 3) + ",";
  json += "\"mq136\":" + String(p.mq136, 3) + ",";
  json += "\"timestamp\":" + String(p.timestamp_ms) + ",";
  json += "\"via\":\"directo\"";
  json += "}";

  int codigo = http.POST(json);
  http.end();

  Serial.print("[API] POST directo -> código HTTP: ");
  Serial.println(codigo);

  return (codigo > 0 && codigo < 300);
}

void enviarPorRadio(const PaqueteSensores &p) {
  radio.stopListening();
  bool exito = radio.write(&p, sizeof(p));
  Serial.print("[RADIO] Retransmisión al gateway -> ");
  Serial.println(exito ? "confirmada (ACK)" : "SIN CONFIRMACIÓN");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - Nodo sin conexión garantizada ===");

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
  radio.setRetries(5, 15);
  radio.openWritingPipe(direccion);
}

void loop() {
  if (millis() - ultimaLectura >= INTERVALO_MS) {
    ultimaLectura = millis();

    leerSensores(paquete);
    Serial.println("---------------------------------------------");
    Serial.print("[LECTURA PROPIA] MQ-2: ");
    Serial.print(paquete.mq2, 3);
    Serial.print("V | MQ-7: ");
    Serial.print(paquete.mq7, 3);
    Serial.print("V | MQ-135: ");
    Serial.print(paquete.mq135, 3);
    Serial.print("V | MQ-136: ");
    Serial.print(paquete.mq136, 3);
    Serial.println("V");

    Serial.print("Intentando WiFi (máx ");
    Serial.print(TIMEOUT_WIFI_MS / 1000);
    Serial.println("s)...");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long inicioIntento = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - inicioIntento < TIMEOUT_WIFI_MS) {
      delay(200);
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("WiFi conectado. Enviando directo a la API.");
      enviarDirectoAPI(paquete);
      WiFi.disconnect(true); // Se apaga para no interferir con el radio ni gastar energía
    } else {
      Serial.println("SIN SEÑAL WIFI. Retransmitiendo por radio al gateway.");
      WiFi.disconnect(true);
      enviarPorRadio(paquete);
    }
  }
}
