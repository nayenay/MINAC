/*
  MINAC - NODO 2 (GATEWAY, con conexión)
  Lee sus propios 4 sensores, calcula ppm en vivo, envía directo a la
  API por WiFi. Además escucha por radio NRF24L01 lecturas del Nodo 1
  (cuando no tiene señal) y las retransmite.

  Conexiones: mismas que en pruebas anteriores
  Librerías requeridas: Adafruit ADS1X15, RF24 (TMRh20), WiFi (incluida en ESP32)
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <SPI.h>
#include <RF24.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <math.h>

// ============================================================
// >>> CONFIGURAR ANTES DE SUBIR <<<
#define NODO_ID 2
const char* WIFI_SSID     = "Mega-2.4G-2FAD";
const char* WIFI_PASSWORD = "nXBSaB2QfT";
const char* API_URL       = "https://minac-production-9424.up.railway.app/monitoreo";
// ============================================================

#define CE_PIN 4
#define CSN_PIN 5

Adafruit_ADS1115 ads;
RF24 radio(CE_PIN, CSN_PIN);

const byte direccion[6] = "GATE1";

const float FACTOR_DIVISOR = 30.0 / 20.0;
const float VC = 5.0;

// --- Vout0 del Nodo 2 (calibración confirmada, aire limpio) ---
// NOTA: el MQ-135 de este nodo dio lecturas inconsistentes en las
// pruebas de laboratorio (posible falla de hardware, pendiente de
// diagnóstico). Se deja calibrado con el último valor estable
// conocido, pero sus datos deben tratarse con reserva hasta resolverlo.
struct ConfigSensor {
  const char* nombre;
  float a, b;
  float rsRoMin, rsRoMax;
  float vout0;
};

// ============================================================
// Semáforo (3 LEDs) - pines sugeridos, no chocan con I2C/SPI
// ============================================================
#define LED_VERDE    15
#define LED_AMARILLO 16
#define LED_ROJO     17

ConfigSensor sensores[4] = {
  { "MQ-2",   591.283f, -2.0765f, 0.256f, 1.685f, 1.4181f },
  { "MQ-3",     0.3923f, -1.4932f, 0.114f, 2.498f, 0.8282f },
  { "MQ-135", 110.379f, -2.7217f, 0.804f, 2.416f, 0.4505f },
  { "MQ-9",   400.0f,   -2.0f,    0.2f,   2.0f,   0.4278f },
};

// Umbrales de semáforo por sensor (ppm). MQ-3 no participa (incluir=false).
// MQ-135 sigue incluido, pero recuerden que este nodo tiene pendiente
// el diagnóstico de hardware de ese sensor específico.
struct UmbralSemaforo {
  float amarillo, rojo;
  bool incluir;
};

UmbralSemaforo umbrales[4] = {
  { 1000.0f, 5000.0f, true  }, // MQ-2
  { 0.0f,    0.0f,    false }, // MQ-3 (no participa)
  { 1000.0f, 5000.0f, true  }, // MQ-135
  { 35.0f,   200.0f,  true  }, // MQ-9
};

struct PaqueteSensores {
  uint8_t  nodo_id;
  float    mq2;
  float    mq3;
  float    mq135;
  float    mq9;
  uint8_t  fueraDeRangoBits;
  uint32_t timestamp_ms;
  uint8_t  retransmitido;
};

PaqueteSensores paqueteLocal;
PaqueteSensores paqueteRecibido;

unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_MS = 5000;

float leerVoltajeSensor(int canal) {
  int16_t crudo = ads.readADC_SingleEnded(canal);
  float voltajeADC = ads.computeVolts(crudo);
  return voltajeADC * FACTOR_DIVISOR;
}

float calcularPPM(ConfigSensor &s, float voutActual, bool &fueraDeRango) {
  if (voutActual <= 0.001) {
    fueraDeRango = true;
    return 0.0f;
  }
  float numerador = (VC - voutActual) / voutActual;
  float denominador = (VC - s.vout0) / s.vout0;
  float rsRo = numerador / denominador;
  float ppm = s.a * pow(rsRo, s.b);
  fueraDeRango = !(rsRo >= s.rsRoMin && rsRo <= s.rsRoMax);
  return ppm;
}

void leerYCalcularSensores(PaqueteSensores &p) {
  p.nodo_id = NODO_ID;
  p.fueraDeRangoBits = 0;

  bool fdr;
  p.mq2 = calcularPPM(sensores[0], leerVoltajeSensor(0), fdr);
  if (fdr) p.fueraDeRangoBits |= (1 << 0);

  p.mq3 = calcularPPM(sensores[1], leerVoltajeSensor(1), fdr);
  if (fdr) p.fueraDeRangoBits |= (1 << 1);

  p.mq135 = calcularPPM(sensores[2], leerVoltajeSensor(2), fdr);
  if (fdr) p.fueraDeRangoBits |= (1 << 2);

  p.mq9 = calcularPPM(sensores[3], leerVoltajeSensor(3), fdr);
  if (fdr) p.fueraDeRangoBits |= (1 << 3);

  p.timestamp_ms  = millis();
  p.retransmitido = 0;
}

String fueraDeRangoTexto(uint8_t bits) {
  String resultado = "";
  const char* nombres[4] = { "MQ-2", "MQ-3", "MQ-135", "MQ-9" };
  for (int i = 0; i < 4; i++) {
    if (bits & (1 << i)) {
      if (resultado.length() > 0) resultado += ",";
      resultado += nombres[i];
    }
  }
  return resultado;
}

// 0 = verde, 1 = amarillo, 2 = rojo, -1 = no participa en el semáforo
int estadoDeSensor(int indice, float ppm, bool fueraDeRango) {
  if (!umbrales[indice].incluir) return -1;
  if (fueraDeRango) return 2;
  if (ppm >= umbrales[indice].rojo) return 2;
  if (ppm >= umbrales[indice].amarillo) return 1;
  return 0;
}

int calcularEstadoGeneral(const PaqueteSensores &p) {
  float valores[4] = { p.mq2, p.mq3, p.mq135, p.mq9 };
  int peor = 0;
  for (int i = 0; i < 4; i++) {
    bool fdr = p.fueraDeRangoBits & (1 << i);
    int estado = estadoDeSensor(i, valores[i], fdr);
    if (estado > peor) peor = estado;
  }
  return peor;
}

void actualizarSemaforo(int estado) {
  digitalWrite(LED_VERDE,    estado == 0 ? HIGH : LOW);
  digitalWrite(LED_AMARILLO, estado == 1 ? HIGH : LOW);
  digitalWrite(LED_ROJO,     estado == 2 ? HIGH : LOW);
}

bool enviarAPI(const PaqueteSensores &p, const char* via) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  String idEquipo = "ESP32-00" + String(p.nodo_id);
  String idGateway = "ESP32-00" + String(NODO_ID);
  String fdr = fueraDeRangoTexto(p.fueraDeRangoBits);

  String json = "{";
  json += "\"idEquipo\":\"" + idEquipo + "\",";
  json += "\"mq2\":" + String(p.mq2, 2) + ",";
  json += "\"mq3\":" + String(p.mq3, 2) + ",";
  json += "\"mq135\":" + String(p.mq135, 2) + ",";
  json += "\"mq9\":" + String(p.mq9, 2) + ",";
  json += "\"timestamp\":" + String(p.timestamp_ms) + ",";
  json += "\"via\":\"" + String(via) + "\",";
  json += "\"fueraDeRango\":\"" + fdr + "\"";
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
  Serial.println("=== MINAC - Nodo 2 (GATEWAY) ===");

  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  digitalWrite(LED_VERDE, HIGH);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_ROJO, LOW);

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
  if (radio.available()) {
    radio.read(&paqueteRecibido, sizeof(paqueteRecibido));
    paqueteRecibido.retransmitido = 1;

    Serial.println("---------------------------------------------");
    Serial.print("[RECIBIDO POR RADIO] del nodo ");
    Serial.println(paqueteRecibido.nodo_id);

    enviarAPI(paqueteRecibido, "retransmitido");
  }

  if (millis() - ultimaLectura >= INTERVALO_MS) {
    ultimaLectura = millis();
    leerYCalcularSensores(paqueteLocal);

    int estado = calcularEstadoGeneral(paqueteLocal);
    actualizarSemaforo(estado);

    Serial.println("---------------------------------------------");
    Serial.print("[SEMÁFORO] ");
    Serial.println(estado == 0 ? "VERDE" : (estado == 1 ? "AMARILLO" : "ROJO"));
    Serial.print("[LECTURA] MQ-2: ");
    Serial.print(paqueteLocal.mq2, 1);
    Serial.print(" ppm | MQ-3: ");
    Serial.print(paqueteLocal.mq3, 1);
    Serial.print(" ppm | MQ-135: ");
    Serial.print(paqueteLocal.mq135, 1);
    Serial.print(" ppm | MQ-9: ");
    Serial.print(paqueteLocal.mq9, 1);
    Serial.println(" ppm");

    enviarAPI(paqueteLocal, "directo");
  }
}
