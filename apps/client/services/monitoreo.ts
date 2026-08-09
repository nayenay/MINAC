import axios from "../pages/api/axios";
import type { HistoricoMap, MonitoreoMap } from "../types/monitoreo";

export async function getMonitoreoActual(): Promise<MonitoreoMap> {
  const response = await axios.get<MonitoreoMap>("/monitoreo");
  return response.data ?? null;
}

export async function getHistoricoEquipo(idEquipo: string): Promise<HistoricoMap> {
  const encodedId = encodeURIComponent(idEquipo);
  const response = await axios.get<HistoricoMap>(
    `/monitoreo/historico/${encodedId}`,
  );
  return response.data ?? null;
}
