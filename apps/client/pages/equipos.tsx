import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Button, Card, CardBody } from "@heroui/react";
import { useEquipos } from "../context/EquiposContext";
import { IconBrandAppleArcade } from "@tabler/icons-react";
import AddEquipoModal from "@/components/Modals/AddEquipoModal";
import AlertBanner from "@/components/monitoring/AlertBanner";
import EmptyState from "@/components/monitoring/EmptyState";
import LoadingState from "@/components/monitoring/LoadingState";

function Equipos() {
  const { equipos, fetchEquipos, loading, error } = useEquipos();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void fetchEquipos();
  }, [fetchEquipos]);

  return (
    <Layout title="Equipos">
      <div className="flex flex-col gap-5 pb-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[26px] font-bold md:text-[36px]">Equipos</h1>
            <p className="text-sm text-[#888888] md:text-base">
              Catálogo de nodos registrados en el sistema.
            </p>
          </div>
          <Button
            radius="full"
            variant="solid"
            className="bg-[#F8B519] text-[16px] font-bold text-[#0F0F0F] hover:bg-[#F8B519]"
            onPress={() => setVisible(true)}
            aria-label="Agregar equipo"
          >
            Agregar
          </Button>
        </header>

        {error ? <AlertBanner tone="error">{error}</AlertBanner> : null}

        {loading && equipos.length === 0 ? (
          <LoadingState message="Cargando equipos…" />
        ) : null}

        {!loading && equipos.length === 0 && !error ? (
          <EmptyState
            title="Sin equipos"
            description="Aún no hay equipos registrados. Usa Agregar para crear el primero."
          />
        ) : null}

        {equipos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {equipos.map((equipo) => (
              <Card
                shadow="lg"
                radius="lg"
                className="rounded-3xl border border-[#2a2a2a] bg-[#171717] shadow-xl"
                key={equipo._id}
              >
                <CardBody className="flex flex-col gap-4 p-5 text-white md:p-7">
                  <div className="flex items-start gap-4 md:items-center md:gap-6">
                    <IconBrandAppleArcade
                      size={64}
                      color="#F8B519"
                      className="shrink-0"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">
                        Equipo
                      </p>
                      <h2 className="break-all text-[22px] font-bold md:text-[26px]">
                        {equipo._id}
                      </h2>
                      <p className="mt-1 text-[15px] text-[#aaaaaa]">
                        Ubicación:{" "}
                        {equipo.ubicacion?.trim()
                          ? equipo.ubicacion
                          : "No disponible"}
                      </p>
                      <p className="text-[15px] text-[#aaaaaa]">
                        Altura:{" "}
                        {equipo.altura?.trim()
                          ? equipo.altura
                          : "No disponible"}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
      <AddEquipoModal visible={visible} setVisible={setVisible} />
    </Layout>
  );
}

export default Equipos;
