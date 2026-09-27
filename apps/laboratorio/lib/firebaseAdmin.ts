import * as admin from "firebase-admin";

// Inicialización perezosa: Next.js evalúa los route handlers durante
// `next build` (fase "Collecting page data") para inspeccionar sus exports,
// sin ejecutar los handlers. Si initializeApp() corriera a nivel de módulo
// (como en apps/server/src/firebase.ts), el build fallaría en cualquier
// entorno sin credenciales reales de Firebase (CI, build sin secrets). Al
// diferirlo a la primera llamada real de getDb(), solo se ejecuta cuando de
// verdad llega una request.
let app: admin.app.App | null = null;

function getApp() {
  if (!app) {
    app = admin.apps.length
      ? admin.apps[0]!
      : admin.initializeApp({
          credential: admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}"),
          ),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
  }
  return app;
}

export function getDb() {
  return getApp().database();
}
