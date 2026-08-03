/*
  MINAC - Cálculo de ppm en tiempo real (prueba con gas de referencia)
  Lee los 4 sensores MQ vía ADS1115, calcula Rs/Ro y ppm en vivo usando
  los mismos coeficientes del script de Python (calculo_ppm.py), y
  advierte si la lectura sale del rango validado del datasheet.

  Uso: acerquen el encendedor de butano (MQ-2/MQ-9) o alcohol (MQ-3)
  y observen el ppm subir en tiempo real por el monitor serial.

  Conexiones: mismas que en pruebas anteriores
  (ADS1115 por I2C, 4 sensores MQ con divisor de voltaje 10k/20k)

  Librería requerida: Adafruit ADS1X15
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <math.h>

// ============================================================
// >>> CONFIGURAR ANTES DE SUBIR <<<
#define NODO1 1
#define NODO2 2

#define NODO NODO2   // <-- Cambiar a NODO2 según en cuál estén probando
// ============================================================

Adafruit_ADS1115 ads;
const float FACTOR_DIVISOR = 30.0 / 20.0; // R1=10k, R2=20k
const float VC = 5.0;

// --- Vout0 por nodo (aire limpio, ya calibrados) ---
#if NODO == NODO1
  const float VOUT0_MQ2   = 0.9658;
  const float VOUT0_MQ3   = 1.2645;
  const float VOUT0_MQ135 = 1.4056;
  const float VOUT0_MQ9   = 0.1993;
#else
  const float VOUT0_MQ2   = 1.4181;
  const float VOUT0_MQ3   = 0.8282;
  const float VOUT0_MQ135 = 0.4505;
  const float VOUT0_MQ9   = 0.4278;
#endif

// --- Coeficientes ppm = a * (Rs/Ro)^b, mismos que calculo_ppm.py ---
struct ConfigSensor {
  const char* nombre;
  float a, b;
  float rsRoMin, rsRoMax;
  float vout0;
};

ConfigSensor sensores[4] = {
  { "MQ-2",   591.283f, -2.0765f, 0.256f, 1.685f, VOUT0_MQ2   },
  { "MQ-3",     0.3923f, -1.4932f, 0.114f, 2.498f, VOUT0_MQ3   },
  { "MQ-135", 110.379f, -2.7217f, 0.804f, 2.416f, VOUT0_MQ135 },
  { "MQ-9",   400.0f,   -2.0f,    0.2f,   2.0f,   VOUT0_MQ9   },
};

float leerVoltajeSensor(int canal) {
  int16_t crudo = ads.readADC_SingleEnded(canal);
  float voltajeADC = ads.computeVolts(crudo);
  return voltajeADC * FACTOR_DIVISOR;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - ppm en tiempo real ===");
  Serial.print("Nodo configurado: ");
  Serial.println(NODO == NODO1 ? "NODO 1" : "NODO 2");

  Wire.begin(21, 22);
  if (!ads.begin(0x48)) {
    Serial.println("ERROR: ADS1115 no detectado.");
    while (1) { delay(1000); }
  }
  ads.setGain(GAIN_ONE);

  Serial.println("Listo. Acerquen el gas de referencia y observen el ppm.");
  Serial.println();
}

void loop() {
  Serial.println("---------------------------------------------");

  for (int canal = 0; canal < 4; canal++) {
    ConfigSensor &s = sensores[canal];
    float voutActual = leerVoltajeSensor(canal);

    if (voutActual <= 0.001) {
      Serial.print(s.nombre);
      Serial.println(": ADVERTENCIA - lectura casi en cero, revisar conexión.");
      continue;
    }

    float numerador = (VC - voutActual) / voutActual;
    float denominador = (VC - s.vout0) / s.vout0;
    float rsRo = numerador / denominador;

    float ppm = s.a * pow(rsRo, s.b);

    bool enRango = (rsRo >= s.rsRoMin && rsRo <= s.rsRoMax);

    Serial.print(s.nombre);
    Serial.print(" | Vout: ");
    Serial.print(voutActual, 3);
    Serial.print("V | Rs/Ro: ");
    Serial.print(rsRo, 4);
    Serial.print(" | ppm: ");
    Serial.print(ppm, 1);

    if (!enRango) {
      Serial.print("  <-- FUERA DE RANGO (no confiable)");
    }
    Serial.println();
  }

  delay(1000);
}
