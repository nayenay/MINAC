import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Button, Card, CardBody } from "@heroui/react";
import { useEquipos } from "../context/EquiposContext";
import { IconBrandAppleArcade } from "@tabler/icons-react";
import AddEquipoModal from "@/components/Modals/AddEquipoModal";

function Equipos() {
  const { equipos, fetchEquipos, loading, error } = useEquipos();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void fetchEquipos();
  }, [fetchEquipos]);

  return (
    <Layout title="Equipos">
      <div className="flex flex-col gap-4">
        <h1 className="text-[40px] font-bold">Equipos</h1>
        <div className="flex justify-end">
          <Button
            radius="full"
            variant="solid"
            className="bg-[#F8B519] hover:bg-[#F8B519] text-[#ffffff] font-bold text-[16px]"
            onClick={() => setVisible(true)}
          >
            Agregar
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[#821600] bg-[#821600]/20 px-4 py-3 text-white text-sm">
            {error}
          </div>
        ) : null}

        {loading && equipos.length === 0 ? (
          <p className="text-[#aaaaaa]">Cargando equipos…</p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && equipos.length === 0 && !error ? (
            <p>No hay equipos</p>
          ) : null}
          {equipos.map((equipo) => (
            <Card
              shadow="lg"
              radius="lg"
              className="bg-[#171717] rounded-3xl shadow-xl"
              key={equipo._id}
            >
              <CardBody className="text-white p-7 flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <IconBrandAppleArcade size={80} color="#F8B519" />
                  <div>
                    <h2 className="text-[28px] font-bold">ID: {equipo._id}</h2>
                    <p className="text-[16px]">
                      Ubicacion: {equipo.ubicacion ?? "—"}
                    </p>
                    <p className="text-[16px]">
                      Altura: {equipo.altura ?? "—"}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      <AddEquipoModal visible={visible} setVisible={setVisible} />
    </Layout>
  );
}

export default Equipos;
