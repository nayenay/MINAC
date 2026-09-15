import { NextResponse } from "next/server";
import * as yup from "yup";

const tiposInteres = ["institucion_educativa", "empresa_minera", "inversionista", "medios", "otro"] as const;

const contactSchema = yup.object({
  nombre: yup.string().trim().required().min(2).max(100),
  correo: yup.string().trim().email().required(),
  organizacion: yup.string().trim().max(150).notRequired(),
  tipoInteres: yup.string().oneOf(tiposInteres).required(),
  mensaje: yup.string().trim().required().min(10).max(2000),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo de la solicitud inválido" }, { status: 400 });
  }

  try {
    // Nunca confiar solo en la validación del cliente: se revalida en servidor.
    const data = await contactSchema.validate(body, { abortEarly: false, stripUnknown: true });

    // TODO(integración real): aquí es donde se conectaría un servicio real de
    // correo/backend — por ejemplo Resend (https://resend.com) usando
    // process.env.RESEND_API_KEY, o guardar el mensaje en una base de datos /
    // Firebase como hace apps/server. Por ahora esta ruta solo valida el
    // payload y responde éxito, para poder probar el formulario end-to-end
    // en desarrollo sin depender de credenciales reales.
    void data;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json({ ok: false, error: error.errors.join(", ") }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "Error inesperado" }, { status: 500 });
  }
}
