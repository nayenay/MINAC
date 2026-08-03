import { Injectable } from '@nestjs/common';
import { CreateMonitoreoDto } from './dto/create-monitoreo.dto';
import { db } from '../firebase';

export interface MonitoreoRecord {
  idEquipo: string;
  mq2: number;
  mq3: number;
  mq135: number;
  mq9: number;
  timestamp: number;
  via?: 'directo' | 'retransmitido';
  retransmitidoPor?: string;
  fueraDeRango?: string;
}

type MonitoreoPorEquipo = Record<string, MonitoreoRecord> | null;
type HistoricoPorClave = Record<string, MonitoreoRecord> | null;

@Injectable()
export class MonitoreoService {
  async create(createMonitoreoDto: CreateMonitoreoDto) {
    const timestamp = createMonitoreoDto.timestamp ?? Date.now();
    const dataConTimestamp: MonitoreoRecord = {
      ...createMonitoreoDto,
      timestamp,
    };

    const refActual = db.ref(`monitoreo/${createMonitoreoDto.idEquipo}`);
    await refActual.set(dataConTimestamp);

    const refHistorico = db.ref(`historico/${createMonitoreoDto.idEquipo}`);
    await refHistorico.push(dataConTimestamp);

    return {
      message: `Datos del equipo ${createMonitoreoDto.idEquipo} guardados.`,
    };
  }

  async findAll(): Promise<MonitoreoPorEquipo> {
    const snapshot = await db.ref('monitoreo').once('value');
    return snapshot.val() as MonitoreoPorEquipo;
  }

  async findHistorico(idEquipo: string): Promise<HistoricoPorClave> {
    const snapshot = await db.ref(`historico/${idEquipo}`).once('value');
    return snapshot.val() as HistoricoPorClave;
  }
}
