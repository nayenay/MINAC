"use client";

import { useRef, useState } from "react";
import { LiveChart } from "./LiveChart";
import { EventoForm } from "./EventoForm";
import { MultipuntoResumenTable } from "./MultipuntoResumenTable";
import type { EventoConMedicion, EventoReferencia, Lectura, Practica } from "@/lib/types";

interface Props {
  sessionId: string;
  lecturas: Lectura[];
}

export function CalibracionPanel({ sessionId, lecturas }: Props) {
  const [eventosConMedicion, setEventosConMedicion] = useState<EventoConMedicion[]>([]);
  const [practicaActiva, setPracticaActiva] = useState<Practica>(2);

  const lecturasRef = useRef(lecturas);
  lecturasRef.current = lecturas;

  const ultimaLectura = lecturas[lecturas.length - 1];
  const temperaturaLive = ultimaLectura?.temperaturaC;

  function onRegistrado(evento: EventoReferencia) {
    const ultima = lecturasRef.current[lecturasRef.current.length - 1];
    setEventosConMedicion((prev) => [
      ...prev,
      { evento, medicion: { ...(ultima?.canales ?? {}) } },
    ]);
  }

  const eventos = eventosConMedicion.map((p) => p.evento);
  const paresPractica2 = eventosConMedicion.filter(
    (p) => p.evento.practica === 2,
  );

  return (
    <div className="space-y-4">
      <LiveChart lecturas={lecturas} eventos={eventos} />
      <EventoForm
        sessionId={sessionId}
        modo="calibracion"
        temperaturaLive={temperaturaLive}
        onRegistrado={onRegistrado}
        onPracticaChange={setPracticaActiva}
      />
      {practicaActiva === 2 && <MultipuntoResumenTable pares={paresPractica2} />}
    </div>
  );
}
