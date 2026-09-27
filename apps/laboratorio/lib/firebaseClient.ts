import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

// SDK de Firebase para el NAVEGADOR (no el Admin SDK). A diferencia de
// FIREBASE_SERVICE_ACCOUNT (una credencial confidencial que solo vive en el
// servidor, ver lib/firebaseAdmin.ts), esta config de cliente está pensada
// para ser pública — Firebase la expone siempre en el bundle del navegador.
// La seguridad se aplica con las reglas de Realtime Database (ver
// firebase/database.rules.json), no ocultando estos valores.
//
// Solo se usa para el dashboard de solo lectura de "Burn-in 24h"
// (laboratorio/burnin/*), que necesita un listener en tiempo real (onValue)
// sin pasar por nuestro backend, ya que el ESP32 de burn-in autónomo sube
// directo por WiFi sin que el navegador esté abierto.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Inicialización perezosa: Next.js pre-renderiza "/" en el servidor durante
// `next build` (los Client Components también se ejecutan una vez del lado
// del servidor para generar el HTML inicial). getDatabase() valida
// databaseURL/projectId de forma síncrona y lanza si faltan — sin esto, el
// build fallaría en cualquier entorno sin config real de Firebase. Al
// diferirlo hasta la primera llamada real (dentro de un useEffect, que
// nunca corre en el servidor), solo se evalúa en el navegador.
let db: Database | null = null;

export function getRealtimeDb(): Database {
  if (!db) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db;
}
