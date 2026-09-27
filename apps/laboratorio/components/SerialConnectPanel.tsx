"use client";

import type { EstadoSerial } from "@/hooks/useEsp32Serial";

const ETIQUETAS_ESTADO: Record<EstadoSerial, string> = {
  inactivo: "Sin conectar",
  conectando: "Conectando…",
  conectado: "Conectado",
  desconectado: "Desconectado",
  error: "Error de conexión",
};

interface Props {
  soportado: boolean;
  estado: EstadoSerial;
  error: string | null;
  totalLecturas: number;
  onConectar: () => void;
  onDesconectar: () => void;
}

export function SerialConnectPanel({
  soportado,
  estado,
  error,
  totalLecturas,
  onConectar,
  onDesconectar,
}: Props) {
  if (!soportado) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-signal-red)] bg-red-50 p-4 text-sm text-[var(--color-text-primary)]">
        <p className="font-semibold">Navegador no compatible</p>
        <p>
          Esta herramienta requiere <strong>Google Chrome</strong> o{" "}
          <strong>Microsoft Edge</strong>. Web Serial API no está disponible
          en Firefox ni Safari.
        </p>
      </div>
    );
  }

  const colorIndicador =
    estado === "conectado"
      ? "bg-[var(--color-signal-green)]"
      : estado === "conectando"
        ? "bg-[var(--color-signal-yellow)]"
        : "bg-[var(--color-signal-red)]";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-4">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorIndicador}`} />
      <span className="text-sm font-medium">{ETIQUETAS_ESTADO[estado]}</span>
      <span className="text-sm text-[var(--color-text-muted)]">
        {totalLecturas} lectura{totalLecturas === 1 ? "" : "s"} capturada
        {totalLecturas === 1 ? "" : "s"}
      </span>
      <div className="ml-auto flex gap-2">
        {estado === "conectado" ? (
          <button
            type="button"
            onClick={onDesconectar}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-bg-subtle)]"
          >
            Desconectar
          </button>
        ) : (
          <button
            type="button"
            onClick={onConectar}
            disabled={estado === "conectando"}
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            Conectar ESP32
          </button>
        )}
      </div>
      {error && (
        <p className="w-full text-sm text-[var(--color-signal-red)]">{error}</p>
      )}
    </div>
  );
}
