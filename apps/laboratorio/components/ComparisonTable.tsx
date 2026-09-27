export interface FilaComparacion {
  hora: number;
  canal: string;
  ppmTeorico: number;
  ppmReal: number | null;
  diferenciaPct: number | null;
}

function formatHora(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("es-MX", { hour12: false });
}

interface Props {
  filas: FilaComparacion[];
}

export function ComparisonTable({ filas }: Props) {
  if (filas.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Aún no hay filas. Registra un evento de referencia para empezar a
        comparar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-bg-panel)] text-left">
          <tr>
            <th className="px-3 py-2">Hora</th>
            <th className="px-3 py-2">Canal</th>
            <th className="px-3 py-2">ppm teórico</th>
            <th className="px-3 py-2">ppm real</th>
            <th className="px-3 py-2">Diferencia %</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-t border-[var(--color-border)]">
              <td className="px-3 py-2">{formatHora(fila.hora)}</td>
              <td className="px-3 py-2 font-mono text-xs">{fila.canal}</td>
              <td className="px-3 py-2">{fila.ppmTeorico.toFixed(1)}</td>
              <td className="px-3 py-2">
                {fila.ppmReal !== null ? fila.ppmReal.toFixed(1) : "—"}
              </td>
              <td className="px-3 py-2">
                {fila.diferenciaPct !== null
                  ? `${fila.diferenciaPct.toFixed(1)}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
