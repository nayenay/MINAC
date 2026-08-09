import { useCallback, useEffect, useRef, useState } from "react";
import { getEquipos } from "../services/equipos";
import { getMonitoreoActual } from "../services/monitoreo";
import type { Equipo } from "../types/equipo";
import type { DashboardNode, MonitoreoMap } from "../types/monitoreo";
import { joinEquiposConMonitoreo } from "../utils/joinNodos";

const POLLING_MS = 5000;

interface DashboardDataState {
  nodes: DashboardNode[];
  equipos: Equipo[];
  monitoreo: MonitoreoMap;
  initialLoading: boolean;
  equiposError: string | null;
  monitoreoError: string | null;
  refreshWarning: string | null;
}

export function useDashboardData(): DashboardDataState {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [monitoreo, setMonitoreo] = useState<MonitoreoMap>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [equiposError, setEquiposError] = useState<string | null>(null);
  const [monitoreoError, setMonitoreoError] = useState<string | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);

  const hasFetchedMonitoreoRef = useRef(false);
  const inFlightRef = useRef(false);
  const cancelledRef = useRef(false);

  const fetchMonitoreo = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const data = await getMonitoreoActual();
      if (cancelledRef.current) return;
      setMonitoreo(data);
      hasFetchedMonitoreoRef.current = true;
      setMonitoreoError(null);
      setRefreshWarning(null);
    } catch {
      if (cancelledRef.current) return;
      if (!hasFetchedMonitoreoRef.current) {
        setMonitoreoError("No se pudo cargar el monitoreo.");
      } else {
        setRefreshWarning(
          "No se pudo actualizar el monitoreo. Se muestran los últimos datos disponibles.",
        );
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    const loadInitial = async () => {
      setInitialLoading(true);

      const equiposPromise = getEquipos()
        .then((data) => {
          if (cancelledRef.current) return;
          setEquipos(data);
          setEquiposError(null);
        })
        .catch(() => {
          if (cancelledRef.current) return;
          setEquipos([]);
          setEquiposError(
            "No se pudo cargar el catálogo de equipos. Se muestran solo lecturas disponibles.",
          );
        });

      await Promise.all([equiposPromise, fetchMonitoreo()]);
      if (!cancelledRef.current) {
        setInitialLoading(false);
      }
    };

    void loadInitial();

    const intervalId = window.setInterval(() => {
      void fetchMonitoreo();
    }, POLLING_MS);

    return () => {
      cancelledRef.current = true;
      window.clearInterval(intervalId);
    };
  }, [fetchMonitoreo]);

  const nodes = joinEquiposConMonitoreo(equipos, monitoreo);

  return {
    nodes,
    equipos,
    monitoreo,
    initialLoading,
    equiposError,
    monitoreoError,
    refreshWarning,
  };
}
