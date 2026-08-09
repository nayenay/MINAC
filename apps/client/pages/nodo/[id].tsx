import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Layout from "../../components/Layout";
import AlertBanner from "../../components/monitoring/AlertBanner";
import EmptyState from "../../components/monitoring/EmptyState";
import LoadingState from "../../components/monitoring/LoadingState";
import StatusBadge from "../../components/monitoring/StatusBadge";
import SensorValue from "../../components/monitoring/SensorValue";
import SensorSelector from "../../components/node-detail/SensorSelector";
import HistoricalTable from "../../components/node-detail/HistoricalTable";
import OutOfRangeList from "../../components/node-detail/OutOfRangeList";
import { getEquipos } from "../../services/equipos";
import {
  getHistoricoEquipo,
  getMonitoreoActual,
} from "../../services/monitoreo";
import type { Equipo } from "../../types/equipo";
import type {
  HistoricoEntry,
  MonitoreoRecord,
  SensorKey,
} from "../../types/monitoreo";
import {
  filterFueraDeRango,
  historicoMapToEntries,
  sortHistoricoByTimestampDesc,
} from "../../utils/historico";
import {
  formatViaLabel,
  getNodeStatus,
  getNodeStatusReasons,
  getSensorStatusLabel,
  hasFueraDeRango,
  SENSOR_LABELS,
} from "../../utils/monitoreoStatus";

const SensorHistoryChart = dynamic(
  () => import("../../components/node-detail/SensorHistoryChart"),
  {
    ssr: false,
    loading: () => (
      <LoadingState message="Cargando gráfica…" />
    ),
  },
);

function NodeDetailPage() {
  const router = useRouter();
  const rawId = router.query.id;
  const nodeId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : "";

  const [selectedSensor, setSelectedSensor] = useState<SensorKey>("mq2");
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [lectura, setLectura] = useState<MonitoreoRecord | null>(null);
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [equiposError, setEquiposError] = useState<string | null>(null);
  const [monitoreoError, setMonitoreoError] = useState<string | null>(null);
  const [historicoError, setHistoricoError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !nodeId) return;

    let cancelled = false;

    const load = async () => {
      setInitialLoading(true);
      setEquiposError(null);
      setMonitoreoError(null);
      setHistoricoError(null);

      const equiposPromise = getEquipos()
        .then((equipos) => {
          if (cancelled) return;
          setEquipo(equipos.find((item) => item._id === nodeId) ?? null);
        })
        .catch(() => {
          if (cancelled) return;
          setEquipo(null);
          setEquiposError(
            "No se pudo cargar el catálogo de equipos. Verifica la conexión con el servidor.",
          );
        });

      const monitoreoPromise = getMonitoreoActual()
        .then((map) => {
          if (cancelled) return;
          setLectura(map?.[nodeId] ?? null);
        })
        .catch(() => {
          if (cancelled) return;
          setLectura(null);
          setMonitoreoError(
            "No se pudo cargar la lectura actual. Verifica la conexión con el servidor.",
          );
        });

      const historicoPromise = getHistoricoEquipo(nodeId)
        .then((map) => {
          if (cancelled) return;
          const entries = sortHistoricoByTimestampDesc(
            historicoMapToEntries(map),
          );
          setHistorico(entries);
        })
        .catch(() => {
          if (cancelled) return;
          setHistorico([]);
          setHistoricoError(
            "No se pudo cargar el histórico. Verifica la conexión con el servidor.",
          );
        });

      await Promise.all([equiposPromise, monitoreoPromise, historicoPromise]);
      if (!cancelled) setInitialLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, nodeId]);

  const status = getNodeStatus(lectura);
  const reasons = getNodeStatusReasons(lectura);
  const viaLabel = formatViaLabel(lectura?.via, lectura?.retransmitidoPor);
  const fueraDeRangoActivo = hasFueraDeRango(lectura?.fueraDeRango);
  const sensorMeta = SENSOR_LABELS[selectedSensor];

  const fueraDeRangoEntries = useMemo(
    () => filterFueraDeRango(historico),
    [historico],
  );

  const notFound =
    !initialLoading &&
    !equipo &&
    !lectura &&
    historico.length === 0 &&
    !historicoError &&
    !monitoreoError;

  if (!router.isReady || !nodeId) {
    return (
      <Layout title="Detalle de nodo">
        <LoadingState message="Cargando nodo…" />
      </Layout>
    );
  }

  return (
    <Layout title={`Nodo ${nodeId}`}>
      <div className="flex flex-col gap-6 pb-10">
        <div>
          <Button
            variant="bordered"
            radius="full"
            className="border-[#333333] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8B519]"
            aria-label="Volver al monitoreo"
            onPress={() => router.push("/")}
          >
            ← Volver al monitoreo
          </Button>
        </div>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">
              Nodo
            </p>
            <h1 className="break-all text-[26px] font-bold md:text-[36px]">
              {nodeId}
            </h1>
            {equipo ? (
              <div className="mt-2 text-sm text-[#aaaaaa] md:text-base">
                <p>
                  Ubicación:{" "}
                  {equipo.ubicacion?.trim()
                    ? equipo.ubicacion
                    : "No disponible"}
                </p>
                <p>
                  Altura:{" "}
                  {equipo.altura?.trim() ? equipo.altura : "No disponible"}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[#888888]">Nodo no registrado</p>
            )}
          </div>
          <StatusBadge status={status} />
        </header>

        {equiposError ? (
          <AlertBanner tone="warning">{equiposError}</AlertBanner>
        ) : null}

        {initialLoading ? (
          <LoadingState message="Cargando detalle del nodo…" />
        ) : null}

        {!initialLoading && notFound ? (
          <EmptyState
            title="Nodo no encontrado"
            description={`No se encontró información para el nodo ${nodeId}.`}
          />
        ) : null}

        {!initialLoading && notFound ? (
          <div className="flex justify-center">
            <Button
              radius="full"
              className="bg-[#F8B519] font-semibold text-[#0F0F0F]"
              onPress={() => router.push("/")}
            >
              Volver al monitoreo
            </Button>
          </div>
        ) : null}

        {!initialLoading && !notFound ? (
          <>
            <section aria-labelledby="estado-actual-title">
              <Card className="rounded-3xl border border-[#2a2a2a] bg-[#171717]">
                <CardBody className="flex flex-col gap-4 p-5 text-white md:p-6">
                  <h2
                    id="estado-actual-title"
                    className="text-[20px] font-bold"
                  >
                    Estado
                  </h2>
                  {monitoreoError ? (
                    <AlertBanner tone="warning">{monitoreoError}</AlertBanner>
                  ) : null}
                  <ul className="list-inside list-disc space-y-1 text-sm text-[#cccccc]">
                    {reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {viaLabel ? (
                      <Chip className="bg-[#222222] text-[#dddddd]">
                        {viaLabel}
                      </Chip>
                    ) : (
                      <Chip className="bg-[#222222] text-[#888888]">
                        Vía: No disponible
                      </Chip>
                    )}
                    {fueraDeRangoActivo ? (
                      <Chip className="bg-[#821600] text-white">
                        Fuera de rango: {lectura?.fueraDeRango}
                      </Chip>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            </section>

            <section
              className="flex flex-col gap-3"
              aria-labelledby="lectura-actual-title"
            >
              <h2 id="lectura-actual-title" className="text-[20px] font-bold">
                Lectura actual
              </h2>
              {lectura ? (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <SensorValue
                    sensor="mq2"
                    value={lectura.mq2}
                    participatesInSemaphore
                  />
                  <SensorValue
                    sensor="mq3"
                    value={lectura.mq3}
                    participatesInSemaphore={false}
                  />
                  <SensorValue
                    sensor="mq135"
                    value={lectura.mq135}
                    participatesInSemaphore
                  />
                  <SensorValue
                    sensor="mq9"
                    value={lectura.mq9}
                    participatesInSemaphore
                  />
                </div>
              ) : (
                <EmptyState
                  title="Sin datos"
                  description="Este nodo no tiene lectura de monitoreo disponible."
                />
              )}
            </section>

            <section
              className="flex flex-col gap-4"
              aria-labelledby="sensor-title"
            >
              <h2 id="sensor-title" className="text-[20px] font-bold">
                Sensor seleccionado
              </h2>
              <SensorSelector
                selected={selectedSensor}
                onSelect={setSelectedSensor}
              />
              <Card className="rounded-3xl border border-[#2a2a2a] bg-[#171717]">
                <CardBody className="gap-2 p-5 text-white">
                  <p className="text-lg font-semibold">
                    {sensorMeta.name} · {sensorMeta.gas}
                  </p>
                  <p className="text-[28px] font-bold">
                    {lectura
                      ? `${lectura[selectedSensor].toFixed(1)} ppm`
                      : "No disponible"}
                  </p>
                  <p className="text-sm text-[#aaaaaa]">
                    Estado del sensor:{" "}
                    {lectura
                      ? getSensorStatusLabel(
                          selectedSensor,
                          lectura[selectedSensor],
                        )
                      : "Sin datos"}
                  </p>
                </CardBody>
              </Card>
            </section>

            <section
              className="flex flex-col gap-3"
              aria-labelledby="grafica-title"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 id="grafica-title" className="text-[20px] font-bold">
                  Gráfica
                </h2>
                <p className="text-xs text-[#666666]">
                  Eje X: marca del dispositivo (ms), no fecha/hora absoluta.
                </p>
              </div>
              {historicoError ? (
                <AlertBanner tone="warning">
                  No se puede graficar. {historicoError}
                </AlertBanner>
              ) : (
                <SensorHistoryChart
                  sensor={selectedSensor}
                  entries={historico}
                />
              )}
            </section>

            <section
              className="flex flex-col gap-3"
              aria-labelledby="historico-title"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 id="historico-title" className="text-[20px] font-bold">
                  Histórico
                </h2>
                <p className="text-xs text-[#666666]">
                  Ordenado por marca del dispositivo (más reciente primero).
                </p>
              </div>
              {historicoError ? (
                <AlertBanner tone="warning">
                  Lectura actual disponible. {historicoError}
                </AlertBanner>
              ) : (
                <HistoricalTable
                  sensor={selectedSensor}
                  entries={historico}
                />
              )}
            </section>

            <section
              className="flex flex-col gap-3"
              aria-labelledby="fuera-rango-title"
            >
              <h2 id="fuera-rango-title" className="text-[20px] font-bold">
                Fuera de rango
              </h2>
              {historicoError ? (
                <AlertBanner tone="info">
                  No se puede listar fuera de rango sin histórico.
                </AlertBanner>
              ) : (
                <OutOfRangeList entries={fueraDeRangoEntries} />
              )}
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  );
}

export default NodeDetailPage;
