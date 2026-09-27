"use client";

import { useState } from "react";
import { ModeTabs } from "@/components/ModeTabs";
import { SerialConnectPanel } from "@/components/SerialConnectPanel";
import { BurnInPanel } from "@/components/BurnInPanel";
import { CalibracionPanel } from "@/components/CalibracionPanel";
import { PracticaPanel } from "@/components/PracticaPanel";
import { Burnin24hPanel } from "@/components/Burnin24hPanel";
import { useEsp32Serial } from "@/hooks/useEsp32Serial";
import type { Modo, Pestana } from "@/lib/types";

function crearSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sesion-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const [pestana, setPestana] = useState<Pestana>("burn_in");
  const [sessionIds] = useState<Record<Modo, string>>(() => ({
    burn_in: crearSessionId(),
    calibracion: crearSessionId(),
    practica: crearSessionId(),
  }));

  const serial = useEsp32Serial();

  async function cerrarSesionPractica() {
    await fetch(`/api/laboratorio/sesiones/${sessionIds.practica}`, {
      method: "PATCH",
    });
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-xl font-bold">Laboratorio MINAC</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Burn-in, calibración activa y práctica activa — lectura directa del
          ESP32 por USB, sin script intermedio.
        </p>
      </header>

      {/* Burn-in 24h no usa Web Serial: el ESP32 autónomo sube por WiFi
          directo a Firebase, así que el panel de conexión USB no aplica. */}
      {pestana !== "burnin_24h" && (
        <SerialConnectPanel
          soportado={serial.soportado}
          estado={serial.estado}
          error={serial.error}
          totalLecturas={serial.lecturas.length}
          onConectar={serial.conectar}
          onDesconectar={serial.desconectar}
        />
      )}

      <ModeTabs pestana={pestana} onChange={setPestana} />

      {pestana === "burn_in" && (
        <BurnInPanel sessionId={sessionIds.burn_in} lecturas={serial.lecturas} />
      )}
      {pestana === "calibracion" && (
        <CalibracionPanel
          sessionId={sessionIds.calibracion}
          lecturas={serial.lecturas}
        />
      )}
      {pestana === "practica" && (
        <PracticaPanel
          sessionId={sessionIds.practica}
          lecturas={serial.lecturas}
          onCerrarSesion={cerrarSesionPractica}
        />
      )}
      {pestana === "burnin_24h" && <Burnin24hPanel />}
    </main>
  );
}
