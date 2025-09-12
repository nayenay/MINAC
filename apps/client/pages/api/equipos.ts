import axios from "./axios";

export const getEquipos = async () => axios.get("/equipos");

export const createEquipo = async (equipo: any) => axios.post("/equipos", equipo);