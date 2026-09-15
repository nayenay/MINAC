/*
  MINAC - Prueba de enlace RF (NODO RECEPTOR)
  Módulo: NRF24L01+PA+LNA (2.4GHz)
  Objetivo: validar comunicación aislada entre dos ESP32 antes de integrar sensores.

  Conexiones (ESP32) - IGUALES al nodo transmisor:
    CE   -> GPIO 4
    CSN  -> GPIO 5
    SCK  -> GPIO 18
    MOSI -> GPIO 23
    MISO -> GPIO 19
    VCC  -> 3.3V DEDICADO (con capacitor de desacople 10-100uF, NO el pin 3.3V del ESP32 directo)
    GND  -> tierra común con el otro nodo

  Librería requerida: RF24 by TMRh20
*/

#include <SPI.h>
#include <RF24.h>

#define CE_PIN 4
#define CSN_PIN 5
#define NODO_ID 1  // Cambiar a 2, 3, etc. si prueban más de dos nodos

RF24 radio(CE_PIN, CSN_PIN);

const byte direccion[6] = "MINAC"; // Debe coincidir EXACTO con el transmisor

struct PaquetePrueba {
  uint32_t contador;
  uint32_t timestamp_ms;
};

struct PaqueteAck {
  uint32_t contador_recibido;
  int8_t nodo_id;
};

PaquetePrueba paqueteRecibido;
PaqueteAck respuesta;

uint32_t totalRecibidos = 0;
uint32_t ultimoContador = 0;
bool primerPaquete = true;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== MINAC - Nodo RECEPTOR ===");

  if (!radio.begin()) {
    Serial.println("ERROR: no se detecta el módulo NRF24L01. Revisar conexiones/alimentación.");
    while (1) { delay(1000); }
  }

  radio.setPALevel(RF24_PA_MAX);
  radio.setDataRate(RF24_250KBPS);
  radio.setChannel(90); // MISMO canal que el transmisor
  radio.enableAckPayload();
  radio.openReadingPipe(1, direccion);

  // Preparamos un primer ack payload antes de escuchar (requisito de la librería)
  respuesta.contador_recibido = 0;
  respuesta.nodo_id = NODO_ID;
  radio.writeAckPayload(1, &respuesta, sizeof(respuesta));

  radio.startListening(); // Este nodo recibe

  Serial.println("Receptor escuchando...");
}

void loop() {
  if (radio.available()) {
    radio.read(&paqueteRecibido, sizeof(paqueteRecibido));
    totalRecibidos++;

    // Detectar paquetes perdidos comparando contra la secuencia esperada
    if (!primerPaquete && paqueteRecibido.contador != ultimoContador + 1) {
      uint32_t perdidos = paqueteRecibido.contador - ultimoContador - 1;
      Serial.print(">>> ALERTA: ");
      Serial.print(perdidos);
      Serial.println(" paquete(s) perdido(s) en la secuencia");
    }

    ultimoContador = paqueteRecibido.contador;
    primerPaquete = false;

    Serial.print("Recibido #");
    Serial.print(paqueteRecibido.contador);
    Serial.print(" | Latencia aprox: ");
    Serial.print(millis() - paqueteRecibido.timestamp_ms);
    Serial.print(" ms | Total recibidos: ");
    Serial.println(totalRecibidos);

    // Preparar el siguiente ack payload con confirmación
    respuesta.contador_recibido = paqueteRecibido.contador;
    respuesta.nodo_id = NODO_ID;
    radio.writeAckPayload(1, &respuesta, sizeof(respuesta));
  }
}
