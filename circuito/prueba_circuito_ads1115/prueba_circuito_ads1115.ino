/*
  MINAC - Prueba de circuito: ADS1115 + sensores MQ-2, MQ-7, MQ-135, MQ-136
  Objetivo: verificar que cada sensor entrega una lectura estable a través
  del ADC externo y del divisor de voltaje, antes de iniciar calibración.

  Conexiones (ESP32 <-> ADS1115):
    SDA  -> GPIO 21
    SCL  -> GPIO 22
    VDD  -> 3.3V DEDICADO (mismo riel de lógica que el ESP32)
    GND  -> tierra común
    ADDR -> GND (fija dirección I2C en 0x48)

  Conexiones (sensor -> divisor -> ADS1115):
    MQ-2 AOUT   -> divisor 10k/20k -> A0
    MQ-7 AOUT   -> divisor 10k/20k -> A1
    MQ-135 AOUT -> divisor 10k/20k -> A2
    MQ-136 AOUT -> divisor 10k/20k -> A3

  Los sensores MQ se alimentan de un riel de 5V SEPARADO (el de los calentadores),
  nunca del mismo riel de 3.3V que el ADS1115/ESP32.

  Librería requerida: Adafruit ADS1X15
  (Arduino IDE -> Administrar bibliotecas -> buscar "Adafruit ADS1X15")
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>

Adafruit_ADS1115 ads;

// Relación del divisor: R1=10k (arriba), R2=20k (abajo)
// Vsensor_real = Vmedido * (R1+R2)/R2
const float FACTOR_DIVISOR = 30.0 / 20.0; // = 1.5

// Nombres de cada sensor por canal, para que la lectura sea legible
const char* NOMBRE_SENSOR[4] = {
  "MQ-2  (CH4)",
  "MQ-7  (CO)",
  "MQ-135 (CO2 aprox)",
  "MQ-136 (H2S)"
};

unsigned long tiempoInicio;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - Prueba de circuito ADS1115 + sensores MQ ===");

  Wire.begin(21, 22); // SDA, SCL

  if (!ads.begin(0x48)) {
    Serial.println("ERROR: no se detecta el ADS1115 en la dirección 0x48.");
    Serial.println("Revisar: alimentación 3.3V, conexión ADDR a GND, cableado SDA/SCL.");
    while (1) { delay(1000); }
  }

  // Ganancia GAIN_ONE = rango +-4.096V, suficiente para nuestro máximo de ~3.3V post-divisor
  ads.setGain(GAIN_ONE);

  Serial.println("ADS1115 detectado correctamente.");
  Serial.println();
  Serial.println("IMPORTANTE: los sensores MQ necesitan 24-48h de precalentamiento");
  Serial.println("(burn-in) para estabilizar su línea base. Las lecturas de los");
  Serial.println("primeros minutos van a variar bastante, eso es normal.");
  Serial.println();

  tiempoInicio = millis();
}

void loop() {
  Serial.println("---------------------------------------------");
  Serial.print("Tiempo desde encendido: ");
  Serial.print((millis() - tiempoInicio) / 60000.0, 1);
  Serial.println(" min");

  for (int canal = 0; canal < 4; canal++) {
    int16_t lecturaCruda = ads.readADC_SingleEnded(canal);
    float voltajeMedido = ads.computeVolts(lecturaCruda);
    float voltajeSensor = voltajeMedido * FACTOR_DIVISOR;

    Serial.print(NOMBRE_SENSOR[canal]);
    Serial.print(" | Canal A");
    Serial.print(canal);
    Serial.print(" | Crudo: ");
    Serial.print(lecturaCruda);
    Serial.print(" | Voltaje en ADC: ");
    Serial.print(voltajeMedido, 3);
    Serial.print(" V | Voltaje real del sensor: ");
    Serial.print(voltajeSensor, 3);
    Serial.println(" V");

    // Alerta simple si el voltaje se acerca al límite del divisor (posible saturación)
    if (voltajeMedido > 3.2) {
      Serial.println("   >>> ADVERTENCIA: voltaje cerca del límite del ADS1115. Revisar divisor.");
    }
    if (voltajeMedido < 0.05) {
      Serial.println("   >>> ADVERTENCIA: lectura casi en cero. Revisar conexión del sensor.");
    }
  }

  Serial.println();
  delay(2000);
}
