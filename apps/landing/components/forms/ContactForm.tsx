"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IconCircleCheck, IconLoader2, IconSend } from "@tabler/icons-react";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

const tiposInteres = [
  { value: "institucion_educativa", label: "Institución educativa" },
  { value: "empresa_minera", label: "Empresa minera" },
  { value: "inversionista", label: "Inversionista" },
  { value: "medios", label: "Medios" },
  { value: "otro", label: "Otro" },
] as const;

const schema = yup.object({
  nombre: yup.string().trim().required("Ingresa tu nombre").min(2, "Nombre demasiado corto").max(100),
  correo: yup.string().trim().email("Correo inválido").required("Ingresa tu correo"),
  organizacion: yup.string().trim().max(150, "Máximo 150 caracteres").notRequired(),
  tipoInteres: yup
    .string()
    .oneOf(tiposInteres.map((t) => t.value), "Selecciona una opción válida")
    .required("Selecciona una opción"),
  mensaje: yup
    .string()
    .trim()
    .required("Escribe un mensaje")
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(2000, "Máximo 2000 caracteres"),
});

type ContactFormValues = yup.InferType<typeof schema>;

const inputClasses =
  "rounded-sm border border-border-strong bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      correo: "",
      organizacion: "",
      tipoInteres: undefined,
      mensaje: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("No se pudo enviar el mensaje");
      }

      setSubmitted(true);
    } catch {
      setSubmitError("No pudimos enviar tu mensaje. Intenta de nuevo en unos momentos.");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-signal-green bg-signal-green/10 p-8 text-center">
        <IconCircleCheck size={32} className="text-signal-green" stroke={1.75} />
        <p className="font-heading font-bold text-text-primary">Mensaje recibido</p>
        <p className="max-w-sm text-sm text-text-secondary">
          Gracias por escribirnos. Revisaremos tu mensaje y nos pondremos en contacto pronto.
        </p>
        <button
          type="button"
          className="mt-2 text-xs text-accent-strong underline underline-offset-2"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
          <input
            id="nombre"
            className={inputClasses}
            placeholder="Tu nombre completo"
            {...register("nombre")}
          />
        </Field>

        <Field label="Correo" htmlFor="correo" error={errors.correo?.message}>
          <input
            id="correo"
            type="email"
            className={inputClasses}
            placeholder="tu@correo.com"
            {...register("correo")}
          />
        </Field>

        <Field label="Organización" htmlFor="organizacion" optional error={errors.organizacion?.message}>
          <input
            id="organizacion"
            className={inputClasses}
            placeholder="Empresa, institución, etc."
            {...register("organizacion")}
          />
        </Field>

        <Field label="Tipo de interés" htmlFor="tipoInteres" error={errors.tipoInteres?.message}>
          <select id="tipoInteres" className={inputClasses} defaultValue="" {...register("tipoInteres")}>
            <option value="" disabled>
              Selecciona una opción
            </option>
            {tiposInteres.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Mensaje" htmlFor="mensaje" error={errors.mensaje?.message}>
        <textarea
          id="mensaje"
          rows={5}
          className={inputClasses}
          placeholder="Cuéntanos qué te interesa de MINAC"
          {...register("mensaje")}
        />
      </Field>

      {submitError && (
        <p className="text-sm text-signal-red" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
        {isSubmitting ? (
          <>
            <IconLoader2 size={18} className="animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <IconSend size={18} />
            Enviar mensaje
          </>
        )}
      </Button>
    </form>
  );
}
