"use client";

import { useMemo, useState } from "react";
import { LiveChart } from "./LiveChart";
import { calcularVariacion } from "@/lib/estabilidad";
import type { Lectura } from "@/lib/types";

const VENTANA_ESTABILIDAD_MS = 3 * 60 * 1000; // 3 minutos
const UMBRAL_VARIACION = 0.03; // 3%
const MUESTRAS_MINIMAS = 5;

function calcularEstabilidad(lecturas: Lectura[]) {
  const corte = Date.now() - VENTANA_ESTABILIDAD_MS;
  const ventana = lecturas.filter((l) => l.timestamp >= corte);
  const canales = Array.from(
    new Set(ventana.flatMap((l) => Object.keys(l.canales))),
  ).sort();

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
}

interface Props {
  sessionId: string;
  lecturas: Lectura[];
}

export function BurnInPanel({ sessionId, lecturas }: Props) {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estabilidad = useMemo(() => calcularEstabilidad(lecturas), [lecturas]);

  async function guardarSesion() {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const res = await fetch("/api/laboratorio/lecturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, modo: "burn_in", lecturas }),
      });
      if (!res.ok) throw new Error("El servidor rechazó la sesión.");
      setMensaje(`Sesión guardada con ${lecturas.length} lecturas.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la sesión.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-4">
      <LiveChart lecturas={lecturas} />
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
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={guardarSesion}
          disabled={guardando || lecturas.length === 0}
          className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar sesión de burn-in"}
        </button>
        {mensaje && <span className="text-sm text-green-700">{mensaje}</span>}
        {error && (
          <span className="text-sm text-[var(--color-signal-red)]">{error}</span>
        )}
      </div>
    </div>
  );
}
