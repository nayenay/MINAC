import type { Equipo } from "../types/equipo";
import type { DashboardNode, MonitoreoMap } from "../types/monitoreo";

/**
 * Une catálogo Mongo (Equipo._id) con lecturas RTDB (MonitoreoRecord.idEquipo).
 * - Equipo sin lectura → aparece (lectura null)
 * - Lectura sin equipo → aparece (equipo null)
 */
export function joinEquiposConMonitoreo(
  equipos: Equipo[],
  monitoreo: MonitoreoMap,
): DashboardNode[] {
  const lecturas = monitoreo ?? {};
  const seen = new Set<string>();
  const nodes: DashboardNode[] = [];

  for (const equipo of equipos) {
    seen.add(equipo._id);
    nodes.push({
      id: equipo._id,
      equipo,
      lectura: lecturas[equipo._id] ?? null,
    });
  }

  for (const [idEquipo, lectura] of Object.entries(lecturas)) {
    if (seen.has(idEquipo)) continue;
    nodes.push({
      id: idEquipo,
      equipo: null,
      lectura,
    });
  }

  return nodes.sort((a, b) => a.id.localeCompare(b.id));
}
