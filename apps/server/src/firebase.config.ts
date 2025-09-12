import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'minac-b03d1',
    databaseURL: 'https://minac-b03d1-default-rtdb.firebaseio.com',
  });
}

// Exponer RTDB y (si ya existía) Firestore sin romperlo
export const rtdb = admin.database();
export const firestore = admin.firestore?.();
export { admin };
