import React from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Layout from "../components/Layout";
import { IconTemperature, IconCarFan } from "@tabler/icons-react";

function HomePage() {
  const monitoreos = [
    {
      idEquipo: "EQM-001",
      gas: "50 ppm",
      temperatura: "25°C",
    },
    {
      idEquipo: "EQM-002",
      gas: "40 ppm",
      temperatura: "25°C",
    },
    {
      idEquipo: "EQM-003",
      gas: "30 ppm",
      temperatura: "25°C",
    },
  ];

  const setStatus = (gas: string) => {
    if (gas === "50 ppm") {
      return "No seguro";
    } else if (gas === "40 ppm") {
      return "Poco seguro";
    } else {
      return "Seguro";
    }
  };

  return (
    <Layout title="Home">
      <h1 className="text-[40px] font-bold">Monitoreo</h1>
      <div className="grid grid-cols-2 gap-4">
        {monitoreos.map((monitoreo) => (
          <Card
            shadow="lg"
            radius="lg"
            className="bg-[#171717] rounded-3xl shadow-xl"
            key={monitoreo.idEquipo}
          >
            <CardBody className="text-white p-7 flex flex-col gap-4">
              <h2 className="text-[28px] font-bold">{monitoreo.idEquipo}</h2>
              <Chip
                className={`${
                  setStatus(monitoreo.gas) == "No seguro"
                    ? "bg-[#821600]"
                    : setStatus(monitoreo.gas) == "Poco seguro"
                    ? "bg-[#F8B519]"
                    : "bg-[#00824F]"
                } text-white`}
              >
                {setStatus(monitoreo.gas)}
              </Chip>
              <div className="flex justify-between gap-4">
                <Card
                  className="border border-[#333333] rounded-3xl bg-[#171717]"
                  style={{ width: "200px", height: "140px" }}
                >
                  <CardBody className="p-4 flex justify-around gap-4">
                    <div className="flex justify-around items-center">
                      <IconTemperature size={52}/>
                      <p className="text-[32px] font-bold">{monitoreo.temperatura}</p>
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
                      <p className="text-[32px] font-bold">{monitoreo.gas}</p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Layout>
  );
}

export default HomePage;
