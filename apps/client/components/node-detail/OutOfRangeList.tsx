import type { HistoricoEntry } from "../../types/monitoreo";
import { formatViaLabel } from "../../utils/monitoreoStatus";
import { formatDeviceTimestamp } from "../../utils/historico";

interface OutOfRangeListProps {
  entries: HistoricoEntry[];
}

export default function OutOfRangeList({ entries }: OutOfRangeListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-[#888888] text-sm">
        Sin lecturas fuera de rango registradas
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => {
        const via =
          formatViaLabel(entry.record.via, entry.record.retransmitidoPor) ??
          "N/D";
        return (
          <li
            key={entry.key}
            className="rounded-2xl border border-[#821600]/50 bg-[#821600]/10 px-4 py-3 text-sm text-white"
          >
            <p className="font-semibold">
              {formatDeviceTimestamp(entry.record.timestamp)}
            </p>
            <p className="text-[#ffb4a8]">
              Fuera de rango: {entry.record.fueraDeRango}
            </p>
            <p className="text-[#cccccc]">Vía: {via}</p>
            {entry.record.retransmitidoPor ? (
              <p className="text-[#aaaaaa]">
                Retransmitido por: {entry.record.retransmitidoPor}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
