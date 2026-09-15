import React from "react";
import Layout from "../components/Layout";
import AlertBanner from "../components/monitoring/AlertBanner";
import EmptyState from "../components/monitoring/EmptyState";
import LoadingState from "../components/monitoring/LoadingState";
import MonitoringCard from "../components/monitoring/MonitoringCard";
import { useDashboardData } from "../hooks/useDashboardData";

function HomePage() {
  const {
    nodes,
    initialLoading,
    equiposError,
    monitoreoError,
    refreshWarning,
  } = useDashboardData();

  const showBlockingError =
    !initialLoading && monitoreoError !== null && nodes.length === 0;

  return (
    <Layout title="MINAC - Monitoreo">
      <div className="flex flex-col gap-5 pb-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-[26px] font-bold leading-tight md:text-[36px]">
            MINAC - Monitoreo en tiempo real
          </h1>
          <p className="max-w-2xl text-sm text-[#888888] md:text-base">
            Lecturas actuales de los nodos ESP32. El detalle histórico está en
            cada nodo.
          </p>
          {!initialLoading && nodes.length > 0 ? (
            <p className="text-xs text-[#666666]">
              {nodes.length} nodo{nodes.length === 1 ? "" : "s"} en vista
            </p>
          ) : null}
        </header>

        {equiposError ? (
          <AlertBanner tone="warning">{equiposError}</AlertBanner>
        ) : null}

        {refreshWarning ? (
          <AlertBanner tone="warning">{refreshWarning}</AlertBanner>
        ) : null}

        {initialLoading ? (
          <LoadingState message="Cargando monitoreo…" />
        ) : null}

        {!initialLoading && showBlockingError ? (
          <EmptyState
            title="No se pudo cargar el monitoreo"
            description="Verifica la conexión con el servidor y que NEXT_PUBLIC_BACKEND_URL esté configurada."
          />
        ) : null}

        {!initialLoading && !showBlockingError && nodes.length === 0 ? (
          <EmptyState
            title="Sin nodos para mostrar"
            description="No hay equipos registrados ni lecturas de monitoreo. Agrega un equipo o espera datos de los nodos ESP32."
          />
        ) : null}

        {!initialLoading && !showBlockingError && nodes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {nodes.map((node) => (
              <MonitoringCard key={node.id} node={node} />
            ))}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export default HomePage;
