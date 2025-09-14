import React, { useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Layout from "../components/Layout";
import { IconTemperature, IconCarFan } from "@tabler/icons-react";
import { getMonitoreo } from "./api/monitoreo";
import { useEffect } from "react";

function HomePage() {
  const [monitoreo, setMonitoreo] = useState({
    EQM_001: {
      idEquipo: "",
      gas: "",
      temperatura: "",
    },
  });

  useEffect(() => {
    getMonitoreo().then((res) => setMonitoreo(res.data));
    console.log(monitoreo);
  }, [monitoreo]);

  const setStatus = (gas: string) => {
    if (Number(gas) < 50) {
      return "Seguro";
    } else if (Number(gas) >= 50 && Number(gas) < 100) {
      return "Poco seguro";
    } else {
      return "No seguro"; 
    }
  };

  return (
    <Layout title="Home">
      <h1 className="text-[40px] font-bold">Monitoreo</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card
          shadow="lg"
          radius="lg"
          className="bg-[#171717] rounded-3xl shadow-xl"
          key={monitoreo.EQM_001.idEquipo}
        >
          <CardBody className="text-white p-7 flex flex-col gap-4">
            <h2 className="text-[28px] font-bold">{monitoreo.EQM_001.idEquipo}</h2>
            <Chip
              className={`${
                setStatus(monitoreo.EQM_001.gas) == "No seguro"
                  ? "bg-[#821600]"
                  : setStatus(monitoreo.EQM_001.gas) == "Poco seguro"
                  ? "bg-[#F8B519]"
                  : "bg-[#00824F]"
              } text-white`}
            >
              {setStatus(monitoreo.EQM_001.gas)}
            </Chip>
            <div className="flex justify-between gap-4">
              <Card
                className="border border-[#333333] rounded-3xl bg-[#171717]"
                style={{ width: "200px", height: "140px" }}
              >
                <CardBody className="p-4 flex justify-around gap-4">
                  <div className="flex justify-around items-center">
                    <IconTemperature size={52} />
                    <p className="text-[32px] font-bold">
                      {monitoreo.EQM_001.temperatura} °C
                    </p>
                  </div>
                </CardBody>
              </Card>
              <Card
                className="border border-[#333333] rounded-3xl bg-[#171717]"
                style={{ width: "200px", height: "140px" }}
              >
                <CardBody className="p-4 flex justify-around gap-4">
                  <div className="flex justify-around items-center">
                    <IconCarFan size={52} />
                    <p className="text-[32px] font-bold">{monitoreo.EQM_001.gas} ppm</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}

export default HomePage;
