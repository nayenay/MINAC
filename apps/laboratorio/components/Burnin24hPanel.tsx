"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBurnin24h } from "@/hooks/useBurnin24h";
import { calcularVariacion } from "@/lib/estabilidad";
import type { Practica } from "@/lib/types";

const VENTANA_LECTURAS = 6; // últimas 6 lecturas = 30 min a 5 min/lectura
const UMBRAL_VARIACION = 0.03; // 3%
const MUESTRAS_MINIMAS = 3;

const PALETA = [
  "#f2a302",
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#0d9488",
];

const PRACTICAS: { id: Practica; label: string }[] = [
  { id: 2, label: "2 — Butano (MQ-9 ×4)" },
  { id: 4, label: "4 — H2 (MQ-8 ×2)" },
  { id: 5, label: "5 — H2S (MQ-136 ×2)" },
];

export function Burnin24hPanel() {
  const [practica, setPractica] = useState<Practica>(2);
  const { lecturas, error } = useBurnin24h(practica);

  const canales = useMemo(
    () =>
      Array.from(
        new Set(lecturas.flatMap((l) => Object.keys(l.canales))),
      ).sort(),
    [lecturas],
  );

  const datosGrafica = useMemo(
    () =>
      lecturas.map((l) => ({
        minutos: l.minutos,
        temperaturaC: l.temperaturaC,
        ...l.canales,
      })),
    [lecturas],
  );

  const estabilidad = useMemo(() => {
    const ventana = lecturas.slice(-VENTANA_LECTURAS);
    const resultado: Record<string, { estable: boolean; variacion: number }> = {};
    for (const canal of canales) {
      const valores = ventana
        .map((l) => l.canales[canal])
        .filter((v): v is number => typeof v === "number");
      if (valores.length < MUESTRAS_MINIMAS) continue;
      const variacion = calcularVariacion(valores);
      resultado[canal] = { estable: variacion < UMBRAL_VARIACION, variacion };
    }
    return resultado;
  }, [lecturas, canales]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          Práctica
          <select
            value={practica}
            onChange={(e) => setPractica(Number(e.target.value) as Practica)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-2 py-1.5 text-sm"
          >
            {PRACTICAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-[var(--color-text-muted)]">
          {lecturas.length} lectura{lecturas.length === 1 ? "" : "s"} recibidas
          por WiFi (cada 5 min) — no requiere el navegador abierto ni el
          ESP32 conectado por USB.
        </span>
      </div>

      {error && (
        <p className="text-sm text-[var(--color-signal-red)]">{error}</p>
      )}

      {datosGrafica.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] text-sm text-[var(--color-text-muted)]">
          Sin lecturas todavía para la práctica {practica}.
        </div>
      ) : (
        <div className="h-80 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datosGrafica}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="minutos"
                label={{
                  value: "Minutos transcurridos",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis />
              <Tooltip />
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
              <Line
                type="monotone"
                dataKey="temperaturaC"
                name="Temperatura (°C)"
                stroke="#57534e"
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {Object.entries(estabilidad).map(([canal, est]) => (
          <span
            key={canal}
            className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold ${
              est.estable
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {canal.toUpperCase()}: {est.estable ? "estable" : "aún estabilizando"}{" "}
            ({(est.variacion * 100).toFixed(1)}%)
          </span>
        ))}
      </div>
    </div>
  );
}
