/*
  MINAC - Prueba de enlace RF (NODO TRANSMISOR)
  Módulo: NRF24L01+PA+LNA (2.4GHz)
  Objetivo: validar comunicación aislada entre dos ESP32 antes de integrar sensores.

  Conexiones (ESP32):
    CE   -> GPIO 4
    CSN  -> GPIO 5
    SCK  -> GPIO 18
    MOSI -> GPIO 23
    MISO -> GPIO 19
    VCC  -> 3.3V DEDICADO (con capacitor de desacople 10-100uF, NO el pin 3.3V del ESP32 directo)
    GND  -> tierra común con el otro nodo

  Librería requerida: RF24 by TMRh20
  (Arduino IDE -> Administrar bibliotecas -> buscar "RF24")
*/

#include <SPI.h>
#include <RF24.h>

#define CE_PIN 4
#define CSN_PIN 5

RF24 radio(CE_PIN, CSN_PIN);

// Dirección del "tubo" de comunicación (debe coincidir exactamente en ambos nodos)
const byte direccion[6] = "MINAC";

struct PaquetePrueba {
  uint32_t contador;
  uint32_t timestamp_ms;
};

struct PaqueteAck {
  uint32_t contador_recibido;
  int8_t nodo_id; // identificador simple del receptor
};

PaquetePrueba paqueteEnviado;
PaqueteAck respuesta;

uint32_t contadorGlobal = 0;
uint32_t enviados = 0;
uint32_t confirmados = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - Nodo TRANSMISOR ===");

  if (!radio.begin()) {
    Serial.println("ERROR: no se detecta el módulo NRF24L01. Revisar conexiones/alimentación.");
    while (1) { delay(1000); }
  }

  radio.setPALevel(RF24_PA_MAX);       // Módulo PA+LNA soporta máxima potencia
  radio.setDataRate(RF24_250KBPS);     // Velocidad baja = mayor alcance y estabilidad
  radio.setChannel(90);                // Canal alejado de interferencia WiFi típica (2.4GHz)
  radio.enableAckPayload();            // Permite recibir datos en la confirmación (ACK)
  radio.setRetries(5, 15);             // 5 = espera entre reintentos, 15 = número de reintentos
  radio.openWritingPipe(direccion);

  radio.stopListening(); // Este nodo transmite

  Serial.println("Transmisor listo. Enviando cada 1 segundo...");
}

void loop() {
  paqueteEnviado.contador = contadorGlobal++;
  paqueteEnviado.timestamp_ms = millis();

  enviados++;
  bool exito = radio.write(&paqueteEnviado, sizeof(paqueteEnviado));

  Serial.print("Enviado #");
  Serial.print(paqueteEnviado.contador);
  Serial.print(" -> ");

  if (exito) {
    confirmados++;
    Serial.print("OK (ack recibido)");

    // Si el receptor mandó payload en el ack, leerlo
    if (radio.isAckPayloadAvailable()) {
      radio.read(&respuesta, sizeof(respuesta));
      Serial.print(" | Nodo receptor ID: ");
      Serial.print(respuesta.nodo_id);
      Serial.print(" confirmó contador: ");
      Serial.print(respuesta.contador_recibido);
    }
  } else {
    Serial.print("FALLÓ (sin respuesta - revisar alcance/alimentación/canal)");
  }

  float porcentajeExito = (100.0 * confirmados) / enviados;
  Serial.print(" | Tasa de éxito acumulada: ");
  Serial.print(porcentajeExito, 1);
  Serial.println("%");

  delay(1000);
}
