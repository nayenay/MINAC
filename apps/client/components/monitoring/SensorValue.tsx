import { Card, CardBody } from "@heroui/react";
import type { SensorAlertLevel, SensorKey } from "../../types/monitoreo";
import { SENSOR_LABELS, getSensorStatus } from "../../utils/monitoreoStatus";

interface SensorValueProps {
  sensor: SensorKey;
  value: number | null;
  participatesInSemaphore: boolean;
}

function levelBorder(level: SensorAlertLevel | "sin_datos"): string {
  if (level === "peligro") return "border-[#821600]";
  if (level === "advertencia") return "border-[#F8B519]";
  if (level === "sin_datos") return "border-[#444444] border-dashed";
  return "border-[#333333]";
}

function levelLabel(level: SensorAlertLevel | "sin_datos"): string | null {
  if (level === "peligro") return "Peligro";
  if (level === "advertencia") return "Advertencia";
  if (level === "sin_datos") return "Sin datos";
  return null;
}

export default function SensorValue({
  sensor,
  value,
  participatesInSemaphore,
}: SensorValueProps) {
  const label = SENSOR_LABELS[sensor];
  const level: SensorAlertLevel | "sin_datos" =
    value === null
      ? "sin_datos"
      : participatesInSemaphore && sensor !== "mq3"
        ? getSensorStatus(sensor, value)
        : "normal";
  const statusText = levelLabel(level);
  const valueText =
    value === null ? "No disponible" : `${value.toFixed(1)} ppm`;

  return (
    <Card
      className={`rounded-2xl border bg-[#171717] ${levelBorder(level)}`}
      aria-label={`${label.name} ${label.gas}: ${valueText}${statusText ? `, ${statusText}` : ""}`}
    >
      <CardBody className="gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-white">{label.name}</p>
          {statusText ? (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                level === "peligro"
                  ? "text-[#ff8a80]"
                  : level === "advertencia"
                    ? "text-[#F8B519]"
                    : "text-[#888888]"
              }`}
            >
              {statusText}
            </span>
          ) : null}
        </div>
        <p className="text-[11px] text-[#888888]">{label.gas}</p>
        <p className="mt-1 text-[20px] font-bold text-white">{valueText}</p>
        {!participatesInSemaphore ? (
          <p className="text-[10px] text-[#666666]">Informativo</p>
        ) : null}
      </CardBody>
    </Card>
  );
}
