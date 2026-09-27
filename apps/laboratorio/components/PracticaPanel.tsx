"use client";

import { useEffect, useRef, useState } from "react";
import { LiveChart } from "./LiveChart";
import { EventoForm } from "./EventoForm";
import { ComparisonTable, type FilaComparacion } from "./ComparisonTable";
import type { EventoReferencia, Lectura } from "@/lib/types";

const INTERVALO_FILA_MS = 10_000;

interface Props {
  sessionId: string;
  lecturas: Lectura[];
  onCerrarSesion: () => Promise<void> | void;
}

export function PracticaPanel({ sessionId, lecturas, onCerrarSesion }: Props) {
  const [eventos, setEventos] = useState<EventoReferencia[]>([]);
  const [filas, setFilas] = useState<FilaComparacion[]>([]);
  const [cerrando, setCerrando] = useState(false);
  const [sesionCerrada, setSesionCerrada] = useState(false);

  const eventoActivoRef = useRef<EventoReferencia | null>(null);
  const lecturasRef = useRef(lecturas);
  lecturasRef.current = lecturas;

  const ultimaLectura = lecturas[lecturas.length - 1];
  const temperaturaLive = ultimaLectura?.temperaturaC;

  function agregarFilas(evento: EventoReferencia) {
    const ultima = lecturasRef.current[lecturasRef.current.length - 1];
    const canales = ultima?.canales ?? {};
    const hora = Date.now();

    // Una fila por canal presente en la última lectura, comparada contra el
    // mismo ppm teórico del evento activo (ya no hay un único "sensor por
    // práctica": cada práctica trae varias unidades del mismo sensor).
    const nuevasFilas: FilaComparacion[] = Object.entries(canales).map(
      ([canal, ppmReal]) => ({
        hora,
        canal,
        ppmTeorico: evento.ppmTeorico,
        ppmReal,
        diferenciaPct:
          evento.ppmTeorico !== 0
            ? ((ppmReal - evento.ppmTeorico) / evento.ppmTeorico) * 100
            : null,
      }),
    );

    setFilas((prev) => [...prev, ...nuevasFilas]);
  }

  function onEventoRegistrado(evento: EventoReferencia) {
    eventoActivoRef.current = evento;
    setEventos((prev) => [...prev, evento]);
    agregarFilas(evento);
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (eventoActivoRef.current) agregarFilas(eventoActivoRef.current);
    }, INTERVALO_FILA_MS);
    return () => clearInterval(id);
  }, []);

  async function cerrarSesion() {
    setCerrando(true);
    try {
      await onCerrarSesion();
      setSesionCerrada(true);
    } finally {
      setCerrando(false);
    }
  }

  return (
    <div className="space-y-4">
      <LiveChart lecturas={lecturas} eventos={eventos} />
      <EventoForm
        sessionId={sessionId}
        modo="practica"
        temperaturaLive={temperaturaLive}
        onRegistrado={onEventoRegistrado}
      />
      <ComparisonTable filas={filas} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={cerrarSesion}
          disabled={cerrando || sesionCerrada}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
        >
          {sesionCerrada ? "Sesión cerrada" : cerrando ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}
