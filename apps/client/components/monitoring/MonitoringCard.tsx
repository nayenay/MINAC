import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useRouter } from "next/router";
import type { DashboardNode, NodeStatus } from "../../types/monitoreo";
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

const STATUS_EDGE: Record<NodeStatus, string> = {
  normal: "border-l-[#00824F]",
  advertencia: "border-l-[#F8B519]",
  peligro: "border-l-[#821600]",
  sin_datos: "border-l-[#555555]",
};

export default function MonitoringCard({ node }: MonitoringCardProps) {
  const router = useRouter();
  const { equipo, lectura } = node;
  const status = getNodeStatus(lectura);
  const viaLabel = formatViaLabel(lectura?.via, lectura?.retransmitidoPor);
  const fueraDeRangoActivo = hasFueraDeRango(lectura?.fueraDeRango);
  const ubicacion = equipo?.ubicacion?.trim() || "No disponible";
  const altura = equipo?.altura?.trim() || "No disponible";

  return (
    <Card
      shadow="lg"
      radius="lg"
      className={`rounded-3xl border border-[#2a2a2a] border-l-4 bg-[#171717] shadow-xl ${STATUS_EDGE[status]}`}
    >
      <CardBody className="flex flex-col gap-4 p-5 text-white md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">
              Nodo
            </p>
            <h2 className="break-all text-[22px] font-bold md:text-[26px]">
              {node.id}
            </h2>
            {equipo ? (
              <>
                <p className="text-[14px] text-[#aaaaaa]">
                  Ubicación: {ubicacion}
                </p>
                <p className="text-[14px] text-[#aaaaaa]">Altura: {altura}</p>
              </>
            ) : (
              <p className="text-[13px] text-[#888888]">Nodo no registrado</p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {viaLabel ? (
            <Chip className="bg-[#222222] text-[12px] text-[#dddddd]">
              {viaLabel}
            </Chip>
          ) : (
            <Chip className="bg-[#222222] text-[12px] text-[#888888]">
              Vía: No disponible
            </Chip>
          )}
          {fueraDeRangoActivo ? (
            <Chip className="bg-[#821600] text-[12px] text-white">
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
          <div className="rounded-2xl border border-dashed border-[#333333] p-6 text-center text-sm text-[#888888]">
            Sin datos
          </div>
        )}

        <div className="flex justify-end">
          <Button
            radius="full"
            variant="bordered"
            className="border-[#F8B519] text-[#F8B519] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8B519]"
            aria-label={`Ver detalle del nodo ${node.id}`}
            onPress={() =>
              router.push(`/nodo/${encodeURIComponent(node.id)}`)
            }
          >
            Ver detalle
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
