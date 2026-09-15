import axios from "../pages/api/axios";
import type { CreateEquipoPayload, Equipo } from "../types/equipo";

export async function getEquipos(): Promise<Equipo[]> {
  const response = await axios.get<Equipo[]>("/equipos");
  return response.data ?? [];
}

export async function createEquipo(
  equipo: CreateEquipoPayload,
): Promise<Equipo> {
  const response = await axios.post<Equipo>("/equipos", equipo);
  return response.data;
}
