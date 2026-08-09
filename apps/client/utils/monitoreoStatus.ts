import type {
  MonitoreoRecord,
  NodeStatus,
  SensorAlertLevel,
  SensorKey,
} from "../types/monitoreo";

/** Umbrales documentados en circuito/README.md y firmware. */
export const SENSOR_THRESHOLDS = {
  mq2: { advertencia: 1000, peligro: 5000 },
  mq135: { advertencia: 1000, peligro: 5000 },
  mq9: { advertencia: 35, peligro: 200 },
} as const;

/** MQ-3 se muestra pero no participa en el semáforo general. */
export const SEMAPHORE_SENSORS: Array<Exclude<SensorKey, "mq3">> = [
  "mq2",
  "mq135",
  "mq9",
];

export const SENSOR_LABELS: Record<
  SensorKey,
  { name: string; gas: string }
> = {
  mq2: { name: "MQ-2", gas: "CH₄" },
  mq3: { name: "MQ-3", gas: "Alcohol" },
  mq135: { name: "MQ-135", gas: "CO₂ aprox." },
  mq9: { name: "MQ-9", gas: "CO" },
};

export function hasFueraDeRango(fueraDeRango?: string): boolean {
  return typeof fueraDeRango === "string" && fueraDeRango.trim().length > 0;
}

export function getSensorStatus(
  sensor: Exclude<SensorKey, "mq3">,
  value: number,
): SensorAlertLevel {
  const thresholds = SENSOR_THRESHOLDS[sensor];
  if (value >= thresholds.peligro) return "peligro";
  if (value >= thresholds.advertencia) return "advertencia";
  return "normal";
}

/**
 * Precedencia:
 * sin lectura → Sin datos
 * fueraDeRango → Peligro
 * algún sensor participante en peligro → Peligro
 * algún sensor participante en advertencia → Advertencia
 * else → Normal
 *
 * MQ-3 no participa.
 */
export function getNodeStatus(
  lectura: MonitoreoRecord | null | undefined,
): NodeStatus {
  if (!lectura) return "sin_datos";

  if (hasFueraDeRango(lectura.fueraDeRango)) return "peligro";

  let worst: SensorAlertLevel = "normal";

  for (const sensor of SEMAPHORE_SENSORS) {
    const level = getSensorStatus(sensor, lectura[sensor]);
    if (level === "peligro") return "peligro";
    if (level === "advertencia") worst = "advertencia";
  }

  return worst === "advertencia" ? "advertencia" : "normal";
}

export function formatViaLabel(
  via?: MonitoreoRecord["via"],
  retransmitidoPor?: string,
): string | null {
  if (!via) return null;
  if (via === "directo") return "Directo";
  if (via === "retransmitido") {
    return retransmitidoPor
      ? `Retransmitido vía ${retransmitidoPor}`
      : "Retransmitido";
  }
  return null;
}

export const NODE_STATUS_LABELS: Record<NodeStatus, string> = {
  normal: "Normal",
  advertencia: "Advertencia",
  peligro: "Peligro",
  sin_datos: "Sin datos",
};
