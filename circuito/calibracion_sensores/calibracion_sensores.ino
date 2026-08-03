/*
  MINAC - Calibración de sensores (R0 / Vout0)
  Calcula el voltaje de referencia en aire limpio para cada sensor,
  usando el método simplificado del manual (no requiere conocer RL,
  se cancela en la razón Rs/R0).

  Uso:
    1. Modo BURN-IN: deja correr el sensor y reporta cada minuto para
       que monitoreen visualmente cuándo se estabiliza la lectura.
    2. Cuando decidan que ya se estabilizó, corran el modo CALIBRAR
       (cambiar MODO abajo) en aire limpio para obtener Vout0 de cada sensor.

  Conexiones: mismas que en pruebas anteriores
  (ADS1115 por I2C, 4 sensores MQ con divisor de voltaje 10k/20k)

  Librería requerida: Adafruit ADS1X15
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>

// ============================================================
// >>> CONFIGURAR ANTES DE SUBIR <<<
enum ModoOperacion { BURN_IN, CALIBRAR };
const ModoOperacion MODO = CALIBRAR; // Cambiar a CALIBRAR cuando el burn-in termine
// ============================================================

Adafruit_ADS1115 ads;
const float FACTOR_DIVISOR = 30.0 / 20.0; // R1=10k, R2=20k

const char* NOMBRE_SENSOR[4] = { "MQ2", "MQ3", "MQ135", "MQ9" };

// --- Variables para modo CALIBRAR ---
const int MUESTRAS_CALIBRACION = 50;
const int INTERVALO_MUESTRA_MS = 2000; // ~2 min de calibración total (50 x 2s)
float sumaVoltajes[4] = {0, 0, 0, 0};

// --- Variables para modo BURN_IN ---
unsigned long tiempoInicio;
unsigned long ultimoReporte = 0;
const unsigned long INTERVALO_REPORTE_MS = 60000; // cada 1 min

float leerVoltajeSensor(int canal) {
  int16_t crudo = ads.readADC_SingleEnded(canal);
  float voltajeADC = ads.computeVolts(crudo);
  return voltajeADC * FACTOR_DIVISOR;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - Calibración de sensores ===");

  Wire.begin(21, 22);
  if (!ads.begin(0x48)) {
    Serial.println("ERROR: ADS1115 no detectado.");
    while (1) { delay(1000); }
  }
  ads.setGain(GAIN_ONE);

  if (MODO == BURN_IN) {
    Serial.println("Modo: BURN-IN. Reportando cada 1 minuto.");
    Serial.println("Observen cuándo las lecturas dejan de cambiar significativamente.");
    tiempoInicio = millis();
  } else {
    Serial.println("Modo: CALIBRAR. Asegúrense de estar en aire limpio y ventilado.");
    Serial.print("Tomando ");
    Serial.print(MUESTRAS_CALIBRACION);
    Serial.println(" muestras...");
  }
}

void loop() {
  if (MODO == BURN_IN) {
    if (millis() - ultimoReporte >= INTERVALO_REPORTE_MS) {
      ultimoReporte = millis();
      float horas = (millis() - tiempoInicio) / 3600000.0;

      Serial.println("---------------------------------------------");
      Serial.print("Tiempo transcurrido: ");
      Serial.print(horas, 2);
      Serial.println(" h");

      for (int canal = 0; canal < 4; canal++) {
        float v = leerVoltajeSensor(canal);
        Serial.print(NOMBRE_SENSOR[canal]);
        Serial.print(": ");
        Serial.print(v, 3);
        Serial.println(" V");
      }
    }

  } else { // MODO == CALIBRAR
    static int muestraActual = 0;

    if (muestraActual < MUESTRAS_CALIBRACION) {
      for (int canal = 0; canal < 4; canal++) {
        sumaVoltajes[canal] += leerVoltajeSensor(canal);
      }
      muestraActual++;

      Serial.print("Muestra ");
      Serial.print(muestraActual);
      Serial.print("/");
      Serial.println(MUESTRAS_CALIBRACION);

      delay(INTERVALO_MUESTRA_MS);

    } else {
      Serial.println("===============================================");
      Serial.println("CALIBRACIÓN COMPLETA - valores Vout0 (aire limpio):");
      Serial.println("Copien estos valores a su código principal.");
      Serial.println("===============================================");

      for (int canal = 0; canal < 4; canal++) {
        float promedio = sumaVoltajes[canal] / MUESTRAS_CALIBRACION;
        Serial.print("const float VOUT0_");
        Serial.print(NOMBRE_SENSOR[canal]);
        Serial.print(" = ");
        Serial.print(promedio, 4);
        Serial.println("; // V");
      }

      Serial.println();
      Serial.println("Repitan este proceso en un día distinto y comparen");
      Serial.println("los valores para confirmar consistencia antes de usarlos.");

      while (1) { delay(1000); } // Detener aquí, ya terminó
    }
  }
}
