import React from "react";
import Layout from "../components/Layout";
import { Button } from "@heroui/react";

function Equipos() {
  return (
    <Layout title="Equipos">
      <div className="flex flex-col gap-4">
        <h1 className="text-[40px] font-bold">Equipos</h1>
        <div className="flex justify-end">
          <Button
            radius="full"
            variant="solid"
            className="bg-[#F8B519] hover:bg-[#F8B519] text-[#ffffff] font-bold text-[16px]"
          >
            Agregar
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default Equipos;
