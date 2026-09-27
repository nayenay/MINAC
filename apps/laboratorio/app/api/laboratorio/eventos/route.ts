import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import type { EventoReferencia } from "@/lib/types";

export async function POST(request: NextRequest) {
  const evento = (await request.json()) as EventoReferencia;

  if (!evento.sessionId || typeof evento.ppmTeorico !== "number") {
    return NextResponse.json(
      { error: "sessionId y ppmTeorico son requeridos." },
      { status: 400 },
    );
  }

  const db = getDb();
  const registradoEn = Date.now();

  await db.ref(`laboratorio/eventos/${evento.sessionId}`).push({
    ...evento,
    registradoEn,
  });

  const sesionRef = db.ref(`laboratorio/sesiones/${evento.sessionId}`);
  const snapshot = await sesionRef.once("value");
  const sesionExistente = snapshot.val() as { estado?: string } | null;

  await sesionRef.update({
    modo: evento.modo,
    practica: evento.practica,
    ultimaActividad: registradoEn,
    // No se pisa el estado si la sesión ya existía (por ejemplo, si ya se
    // marcó como "completa" y se registra un evento tardío).
    ...(sesionExistente?.estado
      ? {}
      : { estado: "abierta", creadaEn: registradoEn }),
  });

  return NextResponse.json({ message: "Evento registrado." });
}
