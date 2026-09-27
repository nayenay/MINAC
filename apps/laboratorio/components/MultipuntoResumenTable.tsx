"use client";

import { useMemo } from "react";
import { calcularR2 } from "@/lib/estadistica";
import { calcularVariacion } from "@/lib/estabilidad";
import type { EventoConMedicion } from "@/lib/types";

interface FilaResumen {
  canal: string;
  r2: number | null;
  variacionPromedio: number | null;
  muestras: number;
}

function calcularResumen(pares: EventoConMedicion[]): FilaResumen[] {
  const canales = Array.from(
    new Set(pares.flatMap(({ medicion }) => Object.keys(medicion))),
  );

  // Agrupa por dosis (cantidadMl) para medir variación entre repeticiones
  // de la misma dosis — solo tiene sentido si el operador repitió la
  // misma cantidad más de una vez.
  const gruposPorDosis = new Map<number, EventoConMedicion[]>();
  for (const par of pares) {
    const grupo = gruposPorDosis.get(par.evento.cantidadMl) ?? [];
    grupo.push(par);
    gruposPorDosis.set(par.evento.cantidadMl, grupo);
  }

  return canales
    .map((canal) => {
      const puntos = pares
        .map((p) => ({ x: p.evento.ppmTeorico, y: p.medicion[canal] }))
        .filter((p): p is { x: number; y: number } => typeof p.y === "number");

      const variacionesPorGrupo = Array.from(gruposPorDosis.values())
        .filter((grupo) => grupo.length > 1)
        .map((grupo) =>
          calcularVariacion(
            grupo
              .map((p) => p.medicion[canal])
              .filter((v): v is number => typeof v === "number"),
          ),
        )
        .filter((v) => !Number.isNaN(v));

      const variacionPromedio =
        variacionesPorGrupo.length > 0
          ? variacionesPorGrupo.reduce((a, b) => a + b, 0) /
            variacionesPorGrupo.length
          : null;

      return {
        canal,
        r2: calcularR2(puntos),
        variacionPromedio,
        muestras: puntos.length,
      };
    })
    .sort((a, b) => (b.r2 ?? -1) - (a.r2 ?? -1));
}

interface Props {
  pares: EventoConMedicion[];
}

/**
 * Ayuda visual para la práctica 2 (4 unidades de MQ-9): compara qué tan bien
 * cada unidad sigue el ppm teórico a lo largo de la calibración multipunto.
 * Es solo orientativa — la decisión de qué unidades avanzan a TRL 5 la toma
 * el equipo.
 */
export function MultipuntoResumenTable({ pares }: Props) {
  const filas = useMemo(() => calcularResumen(pares), [pares]);

  if (filas.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Registra al menos dos eventos de práctica 2 para comparar las
        unidades de MQ-9.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">
        Comparación multipunto — unidades MQ-9 (práctica 2)
      </h3>
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-panel)] text-left">
            <tr>
              <th className="px-3 py-2">Unidad</th>
              <th className="px-3 py-2">R² (ppm teórico vs. medido)</th>
              <th className="px-3 py-2">Variación entre repeticiones</th>
              <th className="px-3 py-2">Muestras</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr
                key={fila.canal}
                className={`border-t border-[var(--color-border)] ${
                  i < 2 ? "bg-green-50" : ""
                }`}
              >
                <td className="px-3 py-2 font-mono text-xs">
                  {fila.canal}
                  {i < 2 && (
                    <span className="ml-2 rounded-[var(--radius-sm)] bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800">
                      candidata a TRL 5
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {fila.r2 !== null ? fila.r2.toFixed(3) : "—"}
                </td>
                <td className="px-3 py-2">
                  {fila.variacionPromedio !== null
                    ? `${(fila.variacionPromedio * 100).toFixed(1)}%`
                    : "sin repeticiones"}
                </td>
                <td className="px-3 py-2">{fila.muestras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Solo una ayuda visual — el equipo decide qué unidades avanzan.
      </p>
    </div>
  );
}
