import { Injectable, NotFoundException } from '@nestjs/common';
import { rtdb } from './firebase.config';

@Injectable()
export class MonitoreoService {
  private path = (id: string) => `api_en_firebase/monitoreo/${id}`;

  async upsert(idEquipo: string, gas: string, temperatura: string) {
    const payload = { gas, temperatura, timestamp: Date.now() };
    await rtdb.ref(this.path(idEquipo)).set(payload);
    return { ok: true, idEquipo, ...payload };
  }

  async getOne(idEquipo: string) {
    const snap = await rtdb.ref(this.path(idEquipo)).get();
    const data = snap.val();
    if (!data) throw new NotFoundException('No hay datos para este idEquipo');
    const ts = typeof data.timestamp === 'number' ? data.timestamp : Date.now();
    return { idEquipo, gas: String(data.gas ?? ''), temperatura: String(data.temperatura ?? ''), timestamp: new Date(ts).toISOString() };
  }
}
