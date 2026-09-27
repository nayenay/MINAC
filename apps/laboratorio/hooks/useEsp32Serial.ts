"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lectura } from "@/lib/types";

export type EstadoSerial =
  | "inactivo"
  | "conectando"
  | "conectado"
  | "desconectado"
  | "error";

interface UseEsp32SerialResult {
  soportado: boolean;
  estado: EstadoSerial;
  error: string | null;
  lecturas: Lectura[];
  ultimaLectura: Lectura | null;
  conectar: () => Promise<void>;
  desconectar: () => Promise<void>;
}

export function useEsp32Serial(): UseEsp32SerialResult {
  const [estado, setEstado] = useState<EstadoSerial>("inactivo");
  const [error, setError] = useState<string | null>(null);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  // Se detecta en useEffect (no durante el render) para que el HTML
  // renderizado en servidor y la primera pasada del cliente coincidan —
  // `navigator` no existe en el servidor, así que evaluarlo directamente en
  // el render causaría un hydration mismatch.
  const [soportado, setSoportado] = useState(false);

  useEffect(() => {
    setSoportado(typeof navigator !== "undefined" && "serial" in navigator);
  }, []);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const cierreIntencionalRef = useRef(false);

  const cerrarPuerto = useCallback(async () => {
    cierreIntencionalRef.current = true;
    try {
      await readerRef.current?.cancel();
    } catch {
      // el puerto puede ya estar cerrado
    }
    readerRef.current = null;
    try {
      await portRef.current?.close();
    } catch {
      // ignorar
    }
    portRef.current = null;
  }, []);

  const leerLineas = useCallback(async (port: SerialPort) => {
    if (!port.readable) return;
    const textDecoder = new TextDecoderStream();
    // lib.dom tipa TextDecoderStream.writable como WritableStream<BufferSource>;
    // Uint8Array es un BufferSource válido en tiempo de ejecución.
    const cierre = port.readable.pipeTo(
      textDecoder.writable as WritableStream<Uint8Array>,
    );
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;

        let idx: number;
        while ((idx = buffer.indexOf("\n")) >= 0) {
          const linea = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!linea) continue;

          try {
            const datos = JSON.parse(linea) as Record<string, unknown>;
            if (datos && typeof datos === "object" && !("error" in datos)) {
              // El número y nombre de canales varía por práctica (ej.
              // mq9_1..mq9_4, o mq8_1..mq8_2): cualquier clave numérica que
              // no sea "t" (temperatura) ni "fueraDeRango" es un canal.
              const canales: Record<string, number> = {};
              let temperaturaC: number | undefined;
              let fueraDeRango: string | undefined;
              for (const [clave, valor] of Object.entries(datos)) {
                if (clave === "t") {
                  if (typeof valor === "number") temperaturaC = valor;
                } else if (clave === "fueraDeRango") {
                  if (typeof valor === "string") fueraDeRango = valor;
                } else if (typeof valor === "number") {
                  canales[clave] = valor;
                }
              }
              setLecturas((prev) => [
                ...prev,
                { timestamp: Date.now(), temperaturaC, fueraDeRango, canales },
              ]);
            }
          } catch {
            // Línea no-JSON (mensajes de arranque del firmware, errores de
            // hardware, etc.) — se ignora, igual que hacía el script de
            // Python original.
          }
        }
      }
    } catch {
      if (!cierreIntencionalRef.current) {
        setError(
          "Se perdió la conexión con el ESP32 (¿se desconectó el cable?). Las lecturas ya capturadas siguen disponibles.",
        );
        setEstado("desconectado");
      }
    } finally {
      reader.releaseLock();
      await cierre.catch(() => {});
    }
  }, []);

  const conectar = useCallback(async () => {
    if (!soportado) {
      setError(
        "Web Serial API no está disponible en este navegador. Usa Chrome o Edge.",
      );
      return;
    }
    setError(null);
    setEstado("conectando");
    cierreIntencionalRef.current = false;
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setEstado("conectado");
      void leerLineas(port);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo conectar con el ESP32.",
      );
      setEstado("error");
    }
  }, [soportado, leerLineas]);

  const desconectar = useCallback(async () => {
    await cerrarPuerto();
    setEstado("inactivo");
  }, [cerrarPuerto]);

  useEffect(() => {
    if (!soportado) return;
    const onDisconnect = (event: Event) => {
      if (event.target === portRef.current) {
        cierreIntencionalRef.current = true;
        portRef.current = null;
        readerRef.current = null;
        setEstado("desconectado");
        setError(
          "El ESP32 se desconectó. Las lecturas ya capturadas siguen disponibles para guardar.",
        );
      }
    };
    navigator.serial.addEventListener("disconnect", onDisconnect);
    return () => navigator.serial.removeEventListener("disconnect", onDisconnect);
  }, [soportado]);

  useEffect(() => {
    return () => {
      void cerrarPuerto();
    };
  }, [cerrarPuerto]);

  return {
    soportado,
    estado,
    error,
    lecturas,
    ultimaLectura: lecturas.length > 0 ? lecturas[lecturas.length - 1] : null,
    conectar,
    desconectar,
  };
}
