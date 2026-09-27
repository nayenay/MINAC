"use client";

import { useEffect, useMemo, useState } from "react";
import { ppmPractica2, ppmPractica4, ppmPractica5 } from "@/lib/calibracion";
import { TEMPERATURA_INVALIDA } from "@/lib/types";
import type { EventoReferencia, Practica } from "@/lib/types";

interface Props {
  sessionId: string;
  modo: "calibracion" | "practica";
  /** Temperatura en vivo leída del DHT11 (campo "t" del JSON del ESP32). */
  temperaturaLive: number | undefined;
  onRegistrado: (evento: EventoReferencia) => void;
  /** Notifica a la pestaña contenedora qué práctica está seleccionada. */
  onPracticaChange?: (practica: Practica) => void;
}

export function EventoForm({
  sessionId,
  modo,
  temperaturaLive,
  onRegistrado,
  onPracticaChange,
}: Props) {
  const [practica, setPractica] = useState<Practica>(2);
  const [cantidadMl, setCantidadMl] = useState("");
  const [mHcl, setMHcl] = useState("");
  const [temperaturaManual, setTemperaturaManual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onPracticaChange?.(practica);
  }, [practica, onPracticaChange]);

  const necesitaTemperatura = practica === 4 || practica === 5;
  const necesitaHcl = practica === 4 || practica === 5;
  const temperaturaInvalida =
    temperaturaLive === undefined || temperaturaLive === TEMPERATURA_INVALIDA;

  const temperaturaEfectiva = necesitaTemperatura
    ? temperaturaInvalida
      ? parseFloat(temperaturaManual)
      : temperaturaLive
    : undefined;

  const ppmTeorico = useMemo(() => {
    const cantidad = parseFloat(cantidadMl);
    if (Number.isNaN(cantidad)) return null;

    if (practica === 2) return ppmPractica2(cantidad);

    const concentracion = parseFloat(mHcl);
    if (
      temperaturaEfectiva === undefined ||
      Number.isNaN(temperaturaEfectiva) ||
      Number.isNaN(concentracion)
    ) {
      return null;
    }

    return practica === 4
      ? ppmPractica4(cantidad, concentracion, temperaturaEfectiva)
      : ppmPractica5(cantidad, concentracion, temperaturaEfectiva);
  }, [practica, cantidadMl, mHcl, temperaturaEfectiva]);

  async function registrarEvento() {
    if (ppmTeorico === null) return;
    setGuardando(true);
    setError(null);

    const evento: EventoReferencia = {
      sessionId,
      modo,
      practica,
      cantidadMl: parseFloat(cantidadMl),
      temperaturaC: temperaturaEfectiva ?? 0,
      temperaturaFuente: necesitaTemperatura
        ? temperaturaInvalida
          ? "manual"
          : "dht11"
        : undefined,
      mHcl: necesitaHcl ? parseFloat(mHcl) : undefined,
      ppmTeorico,
      timestamp: Date.now(),
    };

    try {
      const res = await fetch("/api/laboratorio/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evento),
      });
      if (!res.ok) throw new Error("El servidor rechazó el evento.");
      onRegistrado(evento);
      setCantidadMl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el evento.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-4">
      <h3 className="text-sm font-semibold">Registrar evento de referencia</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
          Práctica
          <select
            value={practica}
            onChange={(e) => setPractica(Number(e.target.value) as Practica)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-2 py-1.5 text-sm"
          >
            <option value={2}>2 — Butano</option>
            <option value={4}>4 — H2 (Zn + HCl)</option>
            <option value={5}>5 — H2S (FeS + HCl)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
          {practica === 2
            ? "Volumen inyectado (mL)"
            : "Volumen de HCl dosificado (mL)"}
          <input
            type="number"
            value={cantidadMl}
            onChange={(e) => setCantidadMl(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-2 py-1.5 text-sm"
          />
        </label>
        {necesitaTemperatura && (
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
            Temperatura de la cámara (°C)
            {temperaturaInvalida ? (
              <>
                <input
                  type="number"
                  value={temperaturaManual}
                  onChange={(e) => setTemperaturaManual(e.target.value)}
                  placeholder="DHT11 no disponible — ingresa manualmente"
                  className="rounded-[var(--radius-sm)] border border-[var(--color-signal-red)] px-2 py-1.5 text-sm"
                />
                <span className="text-[10px] font-normal text-[var(--color-signal-red)]">
                  El DHT11 reportó una lectura inválida.
                </span>
              </>
            ) : (
              <span className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-2 py-1.5 text-sm">
                {temperaturaLive!.toFixed(1)} °C{" "}
                <span className="font-normal text-[var(--color-text-muted)]">
                  (en vivo)
                </span>
              </span>
            )}
          </label>
        )}
        {necesitaHcl && (
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
            Concentración de HCl (mol/L)
            <input
              type="number"
              value={mHcl}
              onChange={(e) => setMHcl(e.target.value)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-2 py-1.5 text-sm"
            />
          </label>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">
          ppm teórico:{" "}
          <strong>{ppmTeorico !== null ? ppmTeorico.toFixed(1) : "—"}</strong>
        </span>
        <button
          type="button"
          onClick={registrarEvento}
          disabled={ppmTeorico === null || guardando}
          className="ml-auto rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Registrar evento"}
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-signal-red)]">{error}</p>}
    </div>
  );
}
