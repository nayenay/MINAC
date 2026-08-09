import React from "react";
import Layout from "../components/Layout";
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
      <div className="flex flex-col gap-4 pb-8">
        <h1 className="text-[28px] md:text-[40px] font-bold">
          MINAC - Monitoreo en tiempo real
        </h1>

        {equiposError ? (
          <div className="rounded-2xl border border-[#F8B519]/40 bg-[#F8B519]/10 px-4 py-3 text-[#F8B519] text-sm">
            {equiposError}
          </div>
        ) : null}

        {refreshWarning ? (
          <div className="rounded-2xl border border-[#F8B519]/40 bg-[#F8B519]/10 px-4 py-3 text-[#F8B519] text-sm">
            {refreshWarning}
          </div>
        ) : null}

        {initialLoading ? <LoadingState /> : null}

        {!initialLoading && showBlockingError ? (
          <EmptyState
            title="No se pudo cargar el monitoreo"
            description="Verifica que el backend esté disponible y que NEXT_PUBLIC_BACKEND_URL esté configurada."
          />
        ) : null}

        {!initialLoading && !showBlockingError && nodes.length === 0 ? (
          <EmptyState
            title="Sin nodos para mostrar"
            description="No hay equipos registrados ni lecturas de monitoreo. Agrega un equipo o espera datos de los nodos ESP32."
          />
        ) : null}

        {!initialLoading && !showBlockingError && nodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
