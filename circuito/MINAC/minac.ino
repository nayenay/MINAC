#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ===== CONFIG WIFI =====
const char* ssid = "S24 FE de García Calvillo";
const char* password = "08Mayo_2006";

// ===== CONFIG API =====
const char* apiEndpointDatos = "https://minac-production-9424.up.railway.app/monitoreo";
const char* apiEndpointEmergencia = "https://minac-production-9424.up.railway.app/emergencia";

// ===== CONFIG EQUIPO =====
String idEquipo = "ESP32-001";

// ===== CONFIG SENSORES =====
#define DHTPIN 25        // Pin del DHT11 26
#define DHTTYPE DHT11
#define MQ2_PIN 32      // Pin analógico para MQ-2
#define BOTON_PIN 17    // Pin para el botón de emergencia 25

// ===== CONFIG LEDS SEMAFORO =====
#define LED_VERDE 26
#define LED_AMARILLO 27
#define LED_ROJO 14

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(BOTON_PIN, INPUT_PULLUP); // Botón con resistencia pull-up

  dht.begin();

  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado a WiFi!");
}

void loop() {
  // ===== Lectura de sensores =====
  float temperatura = dht.readTemperature();
  int gasValue = analogRead(MQ2_PIN);

  // ===== Validar lectura =====
  if (isnan(temperatura)) {
    Serial.println("Error leyendo DHT11!");
    return;
  } else{
    Serial.println("Temperatura: " + String(temperatura));
  }

  Serial.println("Gas: " + String(gasValue));
  
  // ===== Control semáforo =====
  if (gasValue < 200) {
    digitalWrite(LED_VERDE, HIGH);
    digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_ROJO, LOW);
    Serial.println("Estado: Verde (Seguro)");
  } 
  else if (gasValue >= 200 && gasValue <= 500) {
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_AMARILLO, HIGH);
    digitalWrite(LED_ROJO, LOW);
    Serial.println("Estado: Amarillo (Precaución)");
  } 
  else { // gasValue > 100
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_ROJO, HIGH);
    Serial.println("Estado: Rojo (Peligro)");
  }

   // ===== Crear JSON =====
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["idEquipo"] = idEquipo;
  jsonDoc["temperatura"] = temperatura;
  jsonDoc["gas"] = gasValue;

  String requestBody;
  serializeJson(jsonDoc, requestBody);

  // ===== Enviar a API =====
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiEndpointDatos);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(requestBody);
    if (httpResponseCode > 0) {
      Serial.print("Respuesta API datos: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error enviando datos: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }

  /* // ===== Verificar botón de emergencia =====
  if (digitalRead(BOTON_PIN) == LOW) { // LOW = presionado
    StaticJsonDocument<100> jsonEmergencia;
    jsonEmergencia["idEquipo"] = idEquipo;
    jsonEmergencia["emergencia"] = true;

    String bodyEmergencia;
    serializeJson(jsonEmergencia, bodyEmergencia);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(apiEndpointEmergencia);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(bodyEmergencia);
      if (httpResponseCode > 0) {
        Serial.print("Respuesta API emergencia: ");
        Serial.println(httpResponseCode);
      } else {
        Serial.print("Error enviando emergencia: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    }

    delay(2000); // Evita múltiples envíos al mantener presionado
  } */

  delay(1000); // Esperar 10s antes de siguiente lectura
}
