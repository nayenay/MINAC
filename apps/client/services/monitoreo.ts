import axios from "../pages/api/axios";
import type { MonitoreoMap } from "../types/monitoreo";

export async function getMonitoreoActual(): Promise<MonitoreoMap> {
  const response = await axios.get<MonitoreoMap>("/monitoreo");
  return response.data ?? null;
}
