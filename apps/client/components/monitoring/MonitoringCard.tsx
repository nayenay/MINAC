import { Card, CardBody, Chip } from "@heroui/react";
import type { DashboardNode } from "../../types/monitoreo";
import {
  formatViaLabel,
  getNodeStatus,
  hasFueraDeRango,
} from "../../utils/monitoreoStatus";
import SensorValue from "./SensorValue";
import StatusBadge from "./StatusBadge";

interface MonitoringCardProps {
  node: DashboardNode;
}

export default function MonitoringCard({ node }: MonitoringCardProps) {
  const { equipo, lectura } = node;
  const status = getNodeStatus(lectura);
  const viaLabel = formatViaLabel(lectura?.via, lectura?.retransmitidoPor);
  const fueraDeRangoActivo = hasFueraDeRango(lectura?.fueraDeRango);

  return (
    <Card
      shadow="lg"
      radius="lg"
      className="bg-[#171717] rounded-3xl shadow-xl"
    >
      <CardBody className="text-white p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="text-[24px] md:text-[28px] font-bold break-all">
              {node.id}
            </h2>
            {equipo ? (
              <>
                <p className="text-[14px] text-[#aaaaaa]">
                  Ubicación: {equipo.ubicacion?.trim() ? equipo.ubicacion : "—"}
                </p>
                <p className="text-[14px] text-[#aaaaaa]">
                  Altura: {equipo.altura?.trim() ? equipo.altura : "—"}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-[#888888]">
                Sin registro en catálogo (ubicacion/altura no disponibles)
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {viaLabel ? (
            <Chip className="bg-[#222222] text-[#dddddd] text-[12px]">
              {viaLabel}
            </Chip>
          ) : null}
          {fueraDeRangoActivo ? (
            <Chip className="bg-[#821600] text-white text-[12px]">
              Fuera de rango: {lectura?.fueraDeRango}
            </Chip>
          ) : null}
        </div>

        {lectura ? (
          <div className="grid grid-cols-2 gap-3">
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
          <div className="rounded-2xl border border-dashed border-[#333333] p-6 text-center text-[#888888]">
            Sin datos
          </div>
        )}
      </CardBody>
    </Card>
  );
}
