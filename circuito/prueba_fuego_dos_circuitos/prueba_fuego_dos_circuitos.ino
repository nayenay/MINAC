/*
  MINAC - PRUEBA DE FUEGO: dos circuitos completos comunicándose
  (ADS1115 + 4 sensores MQ + NRF24L01+PA+LNA) por cada nodo

  ============================================================
  CÓMO USAR ESTE ARCHIVO (mismo código para los dos ESP32):
  ============================================================

  RONDA 1:
    Circuito 1 -> configurar: ROL = MAESTRO   , NODO_ID = 1
    Circuito 2 -> configurar: ROL = ESCLAVO   , NODO_ID = 2

  RONDA 2 (después de validar la ronda 1):
    Circuito 1 -> configurar: ROL = ESCLAVO   , NODO_ID = 1
    Circuito 2 -> configurar: ROL = MAESTRO   , NODO_ID = 2

  Solo cambien las dos líneas marcadas más abajo y vuelvan a subir
  el programa a cada ESP32 correspondiente.
  ============================================================

  Conexiones (IGUALES en ambos circuitos):
    ADS1115  SDA -> GPIO21, SCL -> GPIO22, VDD -> 3.3V dedicado, ADDR -> GND
    NRF24L01 CE  -> GPIO4,  CSN -> GPIO5,  SCK -> GPIO18, MOSI -> GPIO23, MISO -> GPIO19
             VCC -> 3.3V dedicado con capacitor de desacople (separado del ADS1115 si es posible)
    Sensores MQ  -> divisor 10k/20k -> canales A0(MQ-2) A1(MQ-7) A2(MQ-135) A3(MQ-136)
    Sensores MQ VCC -> riel de 5V dedicado (separado del 3.3V de lógica)

  Librerías requeridas: Adafruit ADS1X15, RF24 (TMRh20)
*/

#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <SPI.h>
#include <RF24.h>

// ============================================================
// >>> CONFIGURACIÓN QUE CAMBIA ENTRE CIRCUITOS Y RONDAS <<<
#define MAESTRO 1
#define ESCLAVO 2

#define ROL      ESCLAVO   // <-- Cambiar a ESCLAVO en el otro circuito / otra ronda
#define NODO_ID  2         // <-- 1 para circuito 1, 2 para circuito 2 (no cambia entre rondas)
// ============================================================

#define CE_PIN 4
#define CSN_PIN 5

Adafruit_ADS1115 ads;
RF24 radio(CE_PIN, CSN_PIN);

const byte direccion[6] = "MINAC"; // Debe ser idéntica en ambos circuitos

const float FACTOR_DIVISOR = 30.0 / 20.0; // R1=10k, R2=20k

struct PaqueteSensores {
  uint8_t  nodo_id;
  float    mq2;
  float    mq7;
  float    mq135;
  float    mq136;
  uint32_t timestamp_ms;
};

PaqueteSensores paqueteLocal;   // Lo que este nodo mide
PaqueteSensores paqueteRemoto;  // Lo que este nodo recibe del otro (solo esclavo)

unsigned long ultimoEnvio = 0;
const unsigned long INTERVALO_MS = 2000;

// ---------- Lectura de sensores propios ----------
void leerSensoresLocales(PaqueteSensores &p) {
  p.nodo_id      = NODO_ID;
  p.mq2          = ads.computeVolts(ads.readADC_SingleEnded(0)) * FACTOR_DIVISOR;
  p.mq7          = ads.computeVolts(ads.readADC_SingleEnded(1)) * FACTOR_DIVISOR;
  p.mq135        = ads.computeVolts(ads.readADC_SingleEnded(2)) * FACTOR_DIVISOR;
  p.mq136        = ads.computeVolts(ads.readADC_SingleEnded(3)) * FACTOR_DIVISOR;
  p.timestamp_ms = millis();
}

void imprimirPaquete(const char* etiqueta, const PaqueteSensores &p) {
  Serial.print(etiqueta);
  Serial.print(" nodo ");
  Serial.print(p.nodo_id);
  Serial.print(" | MQ-2: ");
  Serial.print(p.mq2, 3);
  Serial.print("V | MQ-7: ");
  Serial.print(p.mq7, 3);
  Serial.print("V | MQ-135: ");
  Serial.print(p.mq135, 3);
  Serial.print("V | MQ-136: ");
  Serial.print(p.mq136, 3);
  Serial.print("V | t=");
  Serial.print(p.timestamp_ms);
  Serial.println(" ms");
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("=== MINAC - Prueba de fuego: circuito completo ===");
  Serial.print("Este nodo es NODO_ID ");
  Serial.print(NODO_ID);
  Serial.print(" | Rol: ");
  Serial.println(ROL == MAESTRO ? "MAESTRO" : "ESCLAVO");

  Wire.begin(21, 22);
  if (!ads.begin(0x48)) {
    Serial.println("ERROR: no se detecta el ADS1115.");
    while (1) { delay(1000); }
  }
  ads.setGain(GAIN_ONE);

  if (!radio.begin()) {
    Serial.println("ERROR: no se detecta el NRF24L01.");
    while (1) { delay(1000); }
  }
  radio.setPALevel(RF24_PA_MAX);
  radio.setDataRate(RF24_250KBPS);
  radio.setChannel(90);
  radio.setRetries(5, 15);

  #if ROL == MAESTRO
    radio.openWritingPipe(direccion);
    radio.stopListening();
    Serial.println("Configurado como TRANSMISOR.");
  #else
    radio.openReadingPipe(1, direccion);
    radio.startListening();
    Serial.println("Configurado como RECEPTOR.");
  #endif

  Serial.println("Iniciando en 3 segundos (dejen estabilizar el radio)...");
  delay(3000);
}

void loop() {
  #if ROL == MAESTRO
  // ---------------- MODO MAESTRO ----------------
  if (millis() - ultimoEnvio >= INTERVALO_MS) {
    ultimoEnvio = millis();

    leerSensoresLocales(paqueteLocal);

    Serial.println("---------------------------------------------");
    imprimirPaquete("[LECTURA PROPIA]", paqueteLocal);

    bool exito = radio.write(&paqueteLocal, sizeof(paqueteLocal));

    Serial.print("[ENVIADO] -> ");
    Serial.println(exito ? "confirmado por el esclavo (ACK)" : "SIN CONFIRMACIÓN (revisar alcance/alimentación)");
  }

  #else
  // ---------------- MODO ESCLAVO ----------------
  // Revisa si llegó un paquete del maestro
  if (radio.available()) {
    radio.read(&paqueteRemoto, sizeof(paqueteRemoto));
    Serial.println("---------------------------------------------");
    imprimirPaquete("[RECIBIDO DEL MAESTRO]", paqueteRemoto);
  }

  // En paralelo, también reporta su propia lectura cada INTERVALO_MS
  if (millis() - ultimoEnvio >= INTERVALO_MS) {
    ultimoEnvio = millis();
    leerSensoresLocales(paqueteLocal);
    imprimirPaquete("[LECTURA PROPIA]", paqueteLocal);
  }
  #endif
}
