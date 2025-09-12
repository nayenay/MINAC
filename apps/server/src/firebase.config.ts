import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'minac-b03d1',
    databaseURL: 'https://minac-b03d1-default-rtdb.firebaseio.com',
  });
}

export const rtdb = admin.database();
export { admin };
