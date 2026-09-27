import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  await getDb().ref(`laboratorio/sesiones/${sessionId}`).update({
    estado: "completa",
    cerradaEn: Date.now(),
  });

  return NextResponse.json({ message: "Sesión cerrada." });
}
