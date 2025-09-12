import { Global, Module } from '@nestjs/common';
import { firestore } from './firebase.config';

@Global()
@Module({
  providers: [
    {
      provide: 'FIRESTORE',
      useValue: firestore,
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirestoreModule {}
