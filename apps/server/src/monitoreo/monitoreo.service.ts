import { Injectable } from '@nestjs/common';
import { CreateMonitoreoDto } from './dto/create-monitoreo.dto';
import { db } from '../firebase';

// Forma real de un registro guardado (DTO + timestamp garantizado)
export interface MonitoreoRecord {
  idEquipo: string;
  mq2: number;
  mq7: number;
  mq135: number;
  mq136: number;
  timestamp: number;
  via?: 'directo' | 'retransmitido';
  retransmitidoPor?: string;
}

// findAll() regresa un diccionario { idEquipo: MonitoreoRecord }
type MonitoreoPorEquipo = Record<string, MonitoreoRecord> | null;

// findHistorico() regresa un diccionario { pushKeyDeFirebase: MonitoreoRecord }
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
