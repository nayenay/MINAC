import type { HistoricoEntry, SensorKey } from "../../types/monitoreo";
import {
  formatViaLabel,
  getSensorStatusLabel,
  SENSOR_LABELS,
} from "../../utils/monitoreoStatus";
import { formatDeviceTimestamp } from "../../utils/historico";

interface HistoricalTableProps {
  sensor: SensorKey;
  entries: HistoricoEntry[];
}

export default function HistoricalTable({
  sensor,
  entries,
}: HistoricalTableProps) {
  const sensorLabel = SENSOR_LABELS[sensor];

  if (entries.length === 0) {
    return (
      <p className="text-[#888888] text-sm">
        No hay histórico disponible para este nodo.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#333333]">
      <table className="min-w-full text-left text-sm text-white">
        <thead className="bg-[#1f1f1f] text-[#aaaaaa]">
          <tr>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Marca del dispositivo</th>
            <th className="px-4 py-3 font-medium">
              {sensorLabel.name} ({sensorLabel.gas})
            </th>
            <th className="px-4 py-3 font-medium">Vía</th>
            <th className="px-4 py-3 font-medium">Fuera de rango</th>
            <th className="px-4 py-3 font-medium">Estado sensor</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const value = entry.record[sensor];
            const via =
              formatViaLabel(
                entry.record.via,
                entry.record.retransmitidoPor,
              ) ?? "N/D";
            const fuera = entry.record.fueraDeRango?.trim()
              ? entry.record.fueraDeRango
              : "—";

            return (
              <tr
                key={entry.key}
                className="border-t border-[#333333] odd:bg-[#171717] even:bg-[#141414]"
              >
                <td className="px-4 py-3 text-[#888888]">{index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDeviceTimestamp(entry.record.timestamp)}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {value.toFixed(1)} ppm
                </td>
                <td className="px-4 py-3">{via}</td>
                <td className="px-4 py-3">{fuera}</td>
                <td className="px-4 py-3">
                  {getSensorStatusLabel(sensor, value)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
