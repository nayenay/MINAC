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

export type NodeStatus = "normal" | "advertencia" | "peligro" | "sin_datos";

export type SensorKey = "mq2" | "mq3" | "mq135" | "mq9";

export type SensorAlertLevel = "normal" | "advertencia" | "peligro";

export interface DashboardNode {
  id: string;
  equipo: Equipo | null;
  lectura: MonitoreoRecord | null;
}
