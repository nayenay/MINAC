"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EventoReferencia, Lectura } from "@/lib/types";

// Paleta rotativa: el número de canales varía por práctica (1, 2 o 4
// unidades del mismo sensor), así que los colores se asignan por índice en
// vez de por nombre fijo de sensor.
const PALETA = [
  "#f2a302",
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#0d9488",
];

function formatHora(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("es-MX", { hour12: false });
}

interface Props {
  lecturas: Lectura[];
  eventos?: EventoReferencia[];
  /** Si se define, solo grafica los últimos N ms (ventana deslizante). */
  ventanaMs?: number;
}

export function LiveChart({ lecturas, eventos = [], ventanaMs }: Props) {
  const lecturasVentana = ventanaMs
    ? lecturas.filter((l) => l.timestamp >= Date.now() - ventanaMs)
    : lecturas;

  const canales = Array.from(
    new Set(lecturasVentana.flatMap((l) => Object.keys(l.canales))),
  ).sort();

  const datos = lecturasVentana.map((l) => ({
    timestamp: l.timestamp,
    ...l.canales,
  }));

  if (datos.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] text-sm text-[var(--color-text-muted)]">
        Sin lecturas todavía. Conecta el ESP32 para ver la gráfica en vivo.
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="timestamp" tickFormatter={formatHora} minTickGap={40} />
          <YAxis />
          <Tooltip labelFormatter={(v) => formatHora(Number(v))} />
          <Legend />
          {canales.map((canal, i) => (
            <Line
              key={canal}
              type="monotone"
              dataKey={canal}
              name={canal}
              stroke={PALETA[i % PALETA.length]}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          ))}
          {eventos.map((evento, i) => (
            <ReferenceLine
              key={`${evento.timestamp}-${i}`}
              x={evento.timestamp}
              stroke="#57534e"
              strokeDasharray="4 4"
              label={{
                value: `ppm teórico: ${evento.ppmTeorico.toFixed(1)}`,
                position: "top",
                fontSize: 11,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
