"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { getRealtimeDb } from "@/lib/firebaseClient";
import type { LecturaBurnin, Practica } from "@/lib/types";

interface UseBurnin24hResult {
  lecturas: LecturaBurnin[];
  error: string | null;
}

export function useBurnin24h(practica: Practica): UseBurnin24hResult {
  const [lecturas, setLecturas] = useState<LecturaBurnin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLecturas([]);
    setError(null);

    // getRealtimeDb()/ref() lanzan de forma síncrona si la config de
    // Firebase falta o es inválida (ej. NEXT_PUBLIC_FIREBASE_DATABASE_URL
    // sin configurar) — se captura para mostrar el error solo en este panel
    // en vez de tumbar toda la página.
    let unsubscribe: (() => void) | undefined;
    try {
      const nodoRef = ref(getRealtimeDb(), `laboratorio/burnin/${practica}`);
      unsubscribe = onValue(
        nodoRef,
        (snapshot) => {
          const valor = snapshot.val() as Record<
            string,
            Record<string, unknown>
          > | null;

          if (!valor) {
            setLecturas([]);
            return;
          }

          const filas = Object.values(valor)
            .map((registro) => {
              const canales: Record<string, number> = {};
              let minutos = 0;
              let temperaturaC: number | undefined;
              for (const [clave, val] of Object.entries(registro)) {
                if (clave === "minutos" && typeof val === "number") {
                  minutos = val;
                } else if (
                  clave === "temp_camara" &&
                  typeof val === "number"
                ) {
                  temperaturaC = val;
                } else if (typeof val === "number") {
                  canales[clave] = val;
                }
              }
              return { minutos, temperaturaC, canales };
            })
            .sort((a, b) => a.minutos - b.minutos);

          setLecturas(filas);
        },
        (err) => setError(err.message),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con Firebase. Revisa la configuración NEXT_PUBLIC_FIREBASE_* en .env.local.",
      );
    }

    return () => unsubscribe?.();
  }, [practica]);

  return { lecturas, error };
}
