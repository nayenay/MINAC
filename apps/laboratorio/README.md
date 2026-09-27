# Laboratorio MINAC

Herramienta web para el laboratorio de MINAC: una interfaz unificada para
**Burn-in**, **Calibración activa**, **Práctica activa** y **Burn-in 24h** de
los sensores MQ. Las primeras tres pestañas leen el ESP32 directo por USB
desde el navegador (Web Serial API), sin ningún script de Python intermedio,
y registran todo en Firebase. Burn-in 24h es un dashboard de solo lectura
sobre datos que un ESP32 autónomo sube directo por WiFi.

## Requisitos del navegador

Las pestañas Burn-in, Calibración activa y Práctica activa usan la
[Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API),
que **solo está disponible en Google Chrome y Microsoft Edge** (no funciona
en Firefox ni Safari). La UI muestra un aviso claro si el navegador no es
compatible. La pestaña Burn-in 24h no usa Web Serial y funciona en cualquier
navegador moderno.

## Arquitectura

- **Frontend (USB)**: `navigator.serial` conecta con el ESP32 a 115200 baud y
  lee líneas JSON. El esquema de sensores es **dinámico por práctica** —
  cada práctica transmite un número distinto de unidades del mismo sensor
  más un campo de temperatura común, por ejemplo:

  ```
  Práctica 2 -> {"mq9_1":..,"mq9_2":..,"mq9_3":..,"mq9_4":..,"t":..,"fueraDeRango":"..."}
  Práctica 4 -> {"mq8_1":..,"mq8_2":..,"t":..,"fueraDeRango":"..."}
  Práctica 5 -> {"mq136_1":..,"mq136_2":..,"t":..,"fueraDeRango":"..."}
  ```

  El parser (`hooks/useEsp32Serial.ts`) no asume nombres fijos: cualquier
  clave numérica que no sea `"t"` (temperatura del DHT11) ni
  `"fueraDeRango"` se trata como un canal de sensor y se grafica
  automáticamente con su propia línea y leyenda. Las líneas que no son JSON
  válido (mensajes de arranque del firmware, errores) se ignoran.
- **Temperatura en vivo**: el campo `"t"` alimenta en tiempo real el cálculo
  de ppm teórico en Calibración y Práctica (no se captura manualmente). Si el
  DHT11 falla reporta `-99`; en ese caso la UI pide una temperatura manual de
  respaldo solo para ese evento.
- **Backend**: route handlers de Next.js (`app/api/laboratorio/*`) reciben
  las lecturas/eventos del frontend por `fetch` y los escriben con el
  Firebase Admin SDK. El frontend **nunca** escribe `sesiones`, `lecturas` ni
  `eventos` directamente a Firebase — siempre pasa por el backend.
- **Burn-in 24h (WiFi, sin backend intermedio)**: el ESP32 en este modo sube
  directo a `laboratorio/burnin/{practica}` por WiFi cada 5 minutos, sin
  pasar por esta app ni necesitar el navegador abierto. La pestaña "Burn-in
  24h" es un dashboard de **solo lectura** que usa el **SDK cliente de
  Firebase** (no el Admin SDK) para escuchar ese nodo en tiempo real
  (`onValue`) — ver `lib/firebaseClient.ts`. Este es el único punto donde el
  navegador habla con Firebase directamente, y solo para leer.
- **Firebase**: todo va bajo la rama `laboratorio/` (`sesiones`, `lecturas`,
  `eventos`, `burnin`) de la **Realtime Database**. Esta app **nunca** debe
  escribir en `monitoreo/` ni `historico/` — esas ramas pertenecen al sistema
  de producción (`apps/server`).

## Configuración

```bash
cp .env.local.example .env.local
```

### Firebase Admin SDK (backend — confidencial)

Mismo proyecto que usa `apps/server`:

1. Firebase Console → ⚙️ Configuración del proyecto → **Cuentas de
   servicio** → "Generar nueva clave privada". Se descarga un archivo
   `.json`.
2. Pega el contenido completo de ese JSON, en una sola línea, en
   `FIREBASE_SERVICE_ACCOUNT` dentro de `.env.local`.
3. Copia la URL de tu Realtime Database (Firebase Console → **Realtime
   Database**) en `FIREBASE_DATABASE_URL`.

### Firebase SDK cliente (solo pestaña Burn-in 24h — público)

Estos valores **no son secretos** (Firebase los expone siempre en el bundle
del navegador por diseño; la seguridad se aplica con las reglas de la
Realtime Database, ver más abajo):

1. Firebase Console → ⚙️ Configuración del proyecto → **Tus apps** → app
   Web → "Configuración del SDK" (crea una app web si no existe ninguna).
2. Copia `apiKey`, `authDomain` y `projectId` a las variables
   `NEXT_PUBLIC_FIREBASE_*` en `.env.local`. `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   es la misma URL que `FIREBASE_DATABASE_URL`.

### Reglas de Realtime Database

`firebase/database.rules.json` en este directorio define el modelo de
seguridad:

- `laboratorio/sesiones|lecturas|eventos`: lectura pública, **escritura
  bloqueada** para cualquier cliente — solo el backend (Admin SDK, que
  ignora las reglas) puede escribir ahí.
- `laboratorio/burnin/{practica}`: lectura pública (la consume el dashboard),
  escritura restringida a un token con el claim personalizado
  `burnin_writer: true`. Ese token lo debe emitir/mantener quien administre
  el firmware del ESP32 de burn-in autónomo (fuera del alcance de esta app);
  aquí solo se define y documenta la regla.
- `monitoreo/` y `historico/`: lectura y escritura bloqueadas — nunca deben
  ser alcanzables desde este proyecto.

Para aplicarlas: Firebase Console → **Realtime Database** → pestaña
**Reglas** → pega el contenido de `firebase/database.rules.json`, o con la
CLI: `firebase deploy --only database`.

## Desarrollo

```bash
npm install
npm run dev -- -p 3200
```

## Las cuatro pestañas

- **Burn-in**: gráfica en vivo con una línea por canal recibido (el número de
  canales varía según cuántas unidades del sensor esté transmitiendo el
  firmware conectado), indicador de estabilidad por canal (variación <3% en
  los últimos minutos) y botón para guardar la sesión completa en
  `laboratorio/lecturas/{sessionId}`.
- **Calibración activa**: gráfica en vivo + panel para registrar eventos de
  referencia (práctica 2, 4 o 5, cantidad dosificada y, para las prácticas
  4/5, concentración de HCl — la temperatura se toma en vivo del DHT11). El
  ppm teórico se calcula en el navegador y cada evento se marca en la gráfica
  y se guarda en `laboratorio/eventos/{sessionId}`. Cuando la práctica activa
  es la 2, se muestra además una tabla comparando las 4 unidades de MQ-9
  (R² contra el ppm teórico y variación entre repeticiones) como ayuda visual
  para elegir candidatas a TRL 5.
- **Práctica activa**: igual que Calibración, más una tabla comparativa (hora,
  canal, ppm teórico, ppm real, diferencia %) con una fila por canal, y un
  botón "Cerrar sesión" que marca la sesión como completa en
  `laboratorio/sesiones/{sessionId}`.
- **Burn-in 24h**: dashboard de solo lectura (sin conexión USB) sobre
  `laboratorio/burnin/{practica}`, alimentado por un ESP32 autónomo que sube
  por WiFi cada 5 minutos. Selector de práctica, gráfica de voltaje crudo y
  temperatura contra minutos transcurridos, e indicador de estabilidad por
  canal sobre las últimas 6 lecturas (30 min).
