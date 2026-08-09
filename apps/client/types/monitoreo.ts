import type { Equipo } from "./equipo";

export type ViaTransmision = "directo" | "retransmitido";

export interface MonitoreoRecord {
  idEquipo: string;
  mq2: number;
  mq3: number;
  mq135: number;
  mq9: number;
  timestamp: number;
  via?: ViaTransmision;
  retransmitidoPor?: string;
  fueraDeRango?: string;
}

/** Respuesta de GET /monitoreo; null si Firebase no tiene lecturas. */
export type MonitoreoMap = Record<string, MonitoreoRecord> | null;

/** Respuesta de GET /monitoreo/historico/:idEquipo; null si no hay serie. */
export type HistoricoMap = Record<string, MonitoreoRecord> | null;

/** Entrada de UI: clave Firebase + registro (sin contaminar MonitoreoRecord). */
export interface HistoricoEntry {
  key: string;
  record: MonitoreoRecord;
}

export type NodeStatus = "normal" | "advertencia" | "peligro" | "sin_datos";

export type SensorKey = "mq2" | "mq3" | "mq135" | "mq9";

export type SensorAlertLevel = "normal" | "advertencia" | "peligro";

export interface DashboardNode {
  id: string;
  equipo: Equipo | null;
  lectura: MonitoreoRecord | null;
}
