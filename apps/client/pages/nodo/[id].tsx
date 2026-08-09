import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Layout from "../../components/Layout";
import StatusBadge from "../../components/monitoring/StatusBadge";
import SensorValue from "../../components/monitoring/SensorValue";
import SensorSelector from "../../components/node-detail/SensorSelector";
import HistoricalTable from "../../components/node-detail/HistoricalTable";
import OutOfRangeList from "../../components/node-detail/OutOfRangeList";

const SensorHistoryChart = dynamic(
  () => import("../../components/node-detail/SensorHistoryChart"),
  {
    ssr: false,
    loading: () => (
      <p className="text-[#888888] text-sm rounded-2xl border border-dashed border-[#333333] p-6 text-center">
        Cargando gráfica…
      </p>
    ),
  },
);
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
          setEquiposError("No se pudo cargar el catálogo de equipos.");
        });

      const monitoreoPromise = getMonitoreoActual()
        .then((map) => {
          if (cancelled) return;
          setLectura(map?.[nodeId] ?? null);
        })
        .catch(() => {
          if (cancelled) return;
          setLectura(null);
          setMonitoreoError("No se pudo cargar la lectura actual.");
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
            "Histórico temporalmente no disponible.",
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
        <p className="text-[#aaaaaa]">Cargando nodo…</p>
      </Layout>
    );
  }

  return (
    <Layout title={`Nodo ${nodeId}`}>
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="bordered"
            radius="full"
            className="border-[#333333] text-white"
            onPress={() => router.push("/")}
          >
            ← Volver al monitoreo
          </Button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-bold break-all">
              {nodeId}
            </h1>
            {equipo ? (
              <div className="mt-2 text-[#aaaaaa] text-sm md:text-base">
                <p>
                  Ubicación:{" "}
                  {equipo.ubicacion?.trim() ? equipo.ubicacion : "N/D"}
                </p>
                <p>
                  Altura: {equipo.altura?.trim() ? equipo.altura : "N/D"}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[#888888] text-sm">
                Nodo no registrado
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        {equiposError ? (
          <div className="rounded-2xl border border-[#F8B519]/40 bg-[#F8B519]/10 px-4 py-3 text-[#F8B519] text-sm">
            {equiposError}
          </div>
        ) : null}

        {initialLoading ? (
          <p className="text-[#aaaaaa]">Cargando detalle del nodo…</p>
        ) : null}

        {!initialLoading && notFound ? (
          <Card className="bg-[#171717] rounded-3xl">
            <CardBody className="p-8 text-center text-[#cccccc] gap-4">
              <p>
                No se encontró información para el nodo{" "}
                <span className="font-semibold text-white">{nodeId}</span>.
              </p>
              <Button
                radius="full"
                className="bg-[#F8B519] text-[#0F0F0F] font-semibold self-center"
                onPress={() => router.push("/")}
              >
                Volver al monitoreo
              </Button>
            </CardBody>
          </Card>
        ) : null}

        {!initialLoading && !notFound ? (
          <>
            <Card className="bg-[#171717] rounded-3xl">
              <CardBody className="p-6 flex flex-col gap-4 text-white">
                <h2 className="text-[20px] font-bold">Estado actual</h2>
                {monitoreoError ? (
                  <p className="text-[#F8B519] text-sm">{monitoreoError}</p>
                ) : null}
                <ul className="list-disc list-inside text-sm text-[#cccccc] space-y-1">
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {viaLabel ? (
                    <Chip className="bg-[#222222] text-[#dddddd]">{viaLabel}</Chip>
                  ) : (
                    <Chip className="bg-[#222222] text-[#dddddd]">Vía: N/D</Chip>
                  )}
                  {fueraDeRangoActivo ? (
                    <Chip className="bg-[#821600] text-white">
                      Fuera de rango: {lectura?.fueraDeRango}
                    </Chip>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            <section className="flex flex-col gap-3">
              <h2 className="text-[20px] font-bold">Lectura actual</h2>
              {lectura ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                <p className="text-[#888888] text-sm">Sin datos</p>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">Sensor</h2>
              <SensorSelector
                selected={selectedSensor}
                onSelect={setSelectedSensor}
              />
              <Card className="bg-[#171717] rounded-3xl">
                <CardBody className="p-5 text-white gap-2">
                  <p className="text-lg font-semibold">
                    {sensorMeta.name} · {sensorMeta.gas}
                  </p>
                  <p className="text-[28px] font-bold">
                    {lectura
                      ? `${lectura[selectedSensor].toFixed(1)} ppm`
                      : "N/D"}
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

            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-[20px] font-bold">Gráfica histórica</h2>
                <p className="text-xs text-[#666666]">
                  Eje X: marca del dispositivo (ms), no fecha/hora absoluta.
                </p>
              </div>
              {historicoError ? (
                <div className="rounded-2xl border border-[#F8B519]/40 bg-[#F8B519]/10 px-4 py-3 text-[#F8B519] text-sm">
                  No se puede graficar: {historicoError}
                </div>
              ) : (
                <SensorHistoryChart
                  sensor={selectedSensor}
                  entries={historico}
                />
              )}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-[20px] font-bold">Histórico disponible</h2>
                <p className="text-xs text-[#666666]">
                  Ordenado por marca del dispositivo (más reciente primero). No
                  representa fecha/hora absoluta.
                </p>
              </div>
              {historicoError ? (
                <div className="rounded-2xl border border-[#F8B519]/40 bg-[#F8B519]/10 px-4 py-3 text-[#F8B519] text-sm">
                  Información actual disponible. {historicoError}
                </div>
              ) : (
                <HistoricalTable
                  sensor={selectedSensor}
                  entries={historico}
                />
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-[20px] font-bold">
                Lecturas fuera de rango
              </h2>
              {historicoError ? (
                <p className="text-[#888888] text-sm">
                  No se puede listar fuera de rango sin histórico.
                </p>
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
