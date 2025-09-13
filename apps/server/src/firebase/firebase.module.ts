// firebase.module.ts
import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

// Inicializa Firebase una sola vez
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || '{}', // Usa variable de entorno
);

const firebaseApp = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

const firestore = firebaseApp.firestore();

@Global() // <- hace que este módulo esté disponible globalmente
@Module({
  providers: [
    {
      provide: 'FIRESTORE', // Token para inyección
      useValue: firestore,
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirebaseModule {}