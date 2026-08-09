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
  return "border-[#333333]";
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

  return (
    <Card
      className={`border rounded-2xl bg-[#171717] ${levelBorder(level)}`}
    >
      <CardBody className="p-3 gap-1">
        <p className="text-[13px] font-semibold text-white">{label.name}</p>
        <p className="text-[11px] text-[#888888]">{label.gas}</p>
        <p className="text-[20px] font-bold text-white mt-1">
          {value === null ? "—" : `${value.toFixed(1)} ppm`}
        </p>
      </CardBody>
    </Card>
  );
}
