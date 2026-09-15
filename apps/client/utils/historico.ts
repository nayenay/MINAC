import type { HistoricoEntry, HistoricoMap } from "../types/monitoreo";
import { hasFueraDeRango } from "./monitoreoStatus";

/** Convierte el mapa Firebase push-key → lista UI. */
export function historicoMapToEntries(map: HistoricoMap): HistoricoEntry[] {
  if (!map) return [];
  return Object.entries(map).map(([key, record]) => ({ key, record }));
}

/** Más reciente primero según timestamp numérico del dispositivo (millis). */
export function sortHistoricoByTimestampDesc(
  entries: HistoricoEntry[],
): HistoricoEntry[] {
  return [...entries].sort(
    (a, b) => b.record.timestamp - a.record.timestamp,
  );
}

export function filterFueraDeRango(
  entries: HistoricoEntry[],
): HistoricoEntry[] {
  return entries.filter((entry) =>
    hasFueraDeRango(entry.record.fueraDeRango),
  );
}

export function formatDeviceTimestamp(timestamp: number): string {
  return `Marca del dispositivo: ${timestamp} ms`;
}
