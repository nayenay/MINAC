import { Injectable, NotFoundException } from '@nestjs/common';
import { rtdb } from './firebase.config';

@Injectable()
export class MonitoreoService {
  private path(idEquipo: string) {
    return `api_en_firebase/monitoreo/${idEquipo}`;
  }

  async upsert(idEquipo: string, gas: string, temperatura: string) {
    const ref = rtdb.ref(this.path(idEquipo));
    const payload = {
      gas,
      temperatura,
      timestamp: Date.now(),
    };
    await ref.set(payload);
    return { ok: true, idEquipo, ...payload };
  }

  async getOne(idEquipo: string) {
    const ref = rtdb.ref(this.path(idEquipo));
    const snap = await ref.get();
    const data = snap.val();
    if (!data) {
      throw new NotFoundException('No hay datos para este idEquipo');
    }
    // Responder con Date legible (ISO)
    const ts = typeof data.timestamp === 'number' ? data.timestamp : Date.now();
    return {
      idEquipo,
      gas: String(data.gas ?? ''),
      temperatura: String(data.temperatura ?? ''),
      timestamp: new Date(ts).toISOString(),
    };
  }
}
