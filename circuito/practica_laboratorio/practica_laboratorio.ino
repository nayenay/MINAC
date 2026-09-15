/*
  MINAC - Firmware de banco de pruebas para laboratorio
  Solo sensores + ADS1115 + semáforo. Sin WiFi ni RF — el ESP32 está
  conectado por USB a la laptop durante la práctica, y el script de
  Python (prueba_laboratorio.py) lee esta salida y la sube a Firebase
  en tiempo real.

  Salida: una línea JSON por segundo, ej.
  {"mq2":320.5,"mq3":0.8,"mq135":480.2,"mq9":12.4,"fueraDeRango":"MQ-9"}

  Conexiones: mismas que en pruebas anteriores
  (ADS1115 por I2C, 4 sensores MQ con divisor de voltaje 10k/20k,
  semáforo opcional en GPIO15/16/17)

  Librería requerida: Adafruit ADS1X15
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <math.h>

// ============================================================
// >>> CONFIGURAR ANTES DE SUBIR <<<
#define NODO1 1
#define NODO2 2
#define NODO NODO2   // <-- Cambiar según qué circuito están usando en el banco de pruebas
// ============================================================

#define LED_VERDE    15
#define LED_AMARILLO 16
#define LED_ROJO     17

Adafruit_ADS1115 ads;
const float FACTOR_DIVISOR = 30.0 / 20.0;
const float VC = 5.0;

struct ConfigSensor {
  const char* nombre;
  float a, b;
  float rsRoMin, rsRoMax;
  float vout0;
};

#if NODO == NODO1
  ConfigSensor sensores[4] = {
    { "MQ-2",   591.283f, -2.0765f, 0.256f, 1.685f, 0.9658f },
    { "MQ-3",     0.3923f, -1.4932f, 0.114f, 2.498f, 1.2645f },
    { "MQ-135", 110.379f, -2.7217f, 0.804f, 2.416f, 1.4056f },
    { "MQ-9",   400.0f,   -2.0f,    0.2f,   2.0f,   0.1993f },
  };
#else
  ConfigSensor sensores[4] = {
    { "MQ-2",   591.283f, -2.0765f, 0.256f, 1.685f, 1.4181f },
    { "MQ-3",     0.3923f, -1.4932f, 0.114f, 2.498f, 0.8282f },
    { "MQ-135", 110.379f, -2.7217f, 0.804f, 2.416f, 0.4505f },
    { "MQ-9",   400.0f,   -2.0f,    0.2f,   2.0f,   0.4278f },
  };
#endif

struct UmbralSemaforo { float amarillo, rojo; bool incluir; };
UmbralSemaforo umbrales[4] = {
  { 1000.0f, 5000.0f, true  },
  { 0.0f,    0.0f,    false },
  { 1000.0f, 5000.0f, true  },
  { 35.0f,   200.0f,  true  },
};

unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_MS = 1000;

float leerVoltajeSensor(int canal) {
  int16_t crudo = ads.readADC_SingleEnded(canal);
  return ads.computeVolts(crudo) * FACTOR_DIVISOR;
}

float calcularPPM(ConfigSensor &s, float voutActual, bool &fueraDeRango) {
  if (voutActual <= 0.001) { fueraDeRango = true; return 0.0f; }
  float numerador = (VC - voutActual) / voutActual;
  float denominador = (VC - s.vout0) / s.vout0;
  float rsRo = numerador / denominador;
  float ppm = s.a * pow(rsRo, s.b);
  fueraDeRango = !(rsRo >= s.rsRoMin && rsRo <= s.rsRoMax);
  return ppm;
}

int estadoDeSensor(int indice, float ppm, bool fueraDeRango) {
  if (!umbrales[indice].incluir) return -1;
  if (fueraDeRango) return 2;
  if (ppm >= umbrales[indice].rojo) return 2;
  if (ppm >= umbrales[indice].amarillo) return 1;
  return 0;
}

void actualizarSemaforo(int estado) {
  digitalWrite(LED_VERDE,    estado == 0 ? HIGH : LOW);
  digitalWrite(LED_AMARILLO, estado == 1 ? HIGH : LOW);
  digitalWrite(LED_ROJO,     estado == 2 ? HIGH : LOW);
}

String fueraDeRangoTexto(bool bits[4]) {
  String resultado = "";
  const char* nombres[4] = { "MQ-2", "MQ-3", "MQ-135", "MQ-9" };
  for (int i = 0; i < 4; i++) {
    if (bits[i]) {
      if (resultado.length() > 0) resultado += ",";
      resultado += nombres[i];
    }
  }
  return resultado;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);

  Wire.begin(21, 22);
  if (!ads.begin(0x48)) {
    Serial.println("{\"error\":\"ADS1115 no detectado\"}");
    while (1) { delay(1000); }
  }
  ads.setGain(GAIN_ONE);

  // Nota: estas primeras líneas de texto son solo informativas para quien
  // vea el monitor serial manualmente. El script de Python las ignora
  // automáticamente (solo procesa líneas que son JSON válido).
  Serial.println("MINAC - Banco de pruebas de laboratorio listo.");
}

void loop() {
  if (millis() - ultimaLectura < INTERVALO_MS) return;
  ultimaLectura = millis();

  float ppm[4];
  bool fdr[4];
  int peor = 0;

  for (int i = 0; i < 4; i++) {
    ppm[i] = calcularPPM(sensores[i], leerVoltajeSensor(i), fdr[i]);
    int estado = estadoDeSensor(i, ppm[i], fdr[i]);
    if (estado > peor) peor = estado;
  }
  actualizarSemaforo(peor);

  String json = "{";
  json += "\"mq2\":" + String(ppm[0], 2) + ",";
  json += "\"mq3\":" + String(ppm[1], 2) + ",";
  json += "\"mq135\":" + String(ppm[2], 2) + ",";
  json += "\"mq9\":" + String(ppm[3], 2) + ",";
  json += "\"fueraDeRango\":\"" + fueraDeRangoTexto(fdr) + "\"";
  json += "}";

  Serial.println(json);
}
