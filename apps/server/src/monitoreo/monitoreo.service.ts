import { Injectable } from '@nestjs/common';
import { CreateMonitoreoDto } from './dto/create-monitoreo.dto';
import { db } from '../firebase';

@Injectable()
export class MonitoreoService {
  async create(createMonitoreoDto: CreateMonitoreoDto) {
    const ref = db.ref(`monitoreo/${createMonitoreoDto.idEquipo}`);
    await ref.set(createMonitoreoDto);
    return { message: `Datos del equipo ${createMonitoreoDto.idEquipo} guardados.` };
  }

  async findAll() {
    const snapshot = await db.ref('monitoreo').once('value');
    const data = snapshot.val();
    return data;
  }
}
