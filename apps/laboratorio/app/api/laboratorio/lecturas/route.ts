import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import type { Lectura } from "@/lib/types";

interface GuardarLecturasBody {
  sessionId: string;
  modo: "burn_in";
  lecturas: Lectura[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as GuardarLecturasBody;

  if (!body.sessionId || !Array.isArray(body.lecturas)) {
    return NextResponse.json(
      { error: "sessionId y lecturas son requeridos." },
      { status: 400 },
    );
  }

  const db = getDb();
  const guardadoEn = Date.now();

  await db.ref(`laboratorio/lecturas/${body.sessionId}`).set({
    modo: body.modo,
    guardadoEn,
    lecturas: body.lecturas,
  });

  await db.ref(`laboratorio/sesiones/${body.sessionId}`).update({
    modo: body.modo,
    estado: "guardada",
    totalLecturas: body.lecturas.length,
    guardadaEn: guardadoEn,
  });

  return NextResponse.json({
    message: "Sesión de burn-in guardada.",
    totalLecturas: body.lecturas.length,
  });
}
