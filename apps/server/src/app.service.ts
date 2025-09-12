import { Inject, Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class AppService {
  constructor(@Inject('FIRESTORE') private readonly db: Firestore) {}

  async createUser(uid: string, data: any) {
    const ref = this.db.collection('users').doc(uid);
    await ref.set(data);
    return { ok: true, uid };
  }

  async getUser(uid: string) {
    const snap = await this.db.collection('users').doc(uid).get();
    if (!snap.exists) return { error: 'Not found' };
    return snap.data();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
