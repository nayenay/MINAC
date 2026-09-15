# MINAC — Landing page

Landing page corporativa de MINAC (Next.js + TypeScript + Tailwind CSS).

## Getting Started

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (o el puerto que indique la terminal) para ver el sitio.

## Formulario de contacto (Formspree)

El formulario de contacto (`components/forms/ContactForm.tsx`) envía las respuestas directamente a [Formspree](https://formspree.io) desde el navegador — no hay backend propio para esto. El endpoint se lee de la variable de entorno `NEXT_PUBLIC_FORMSPREE_ENDPOINT`, que **no está hardcodeada** en el código: mientras esa variable no esté configurada, el formulario muestra un mensaje de error en vez de fallar en silencio.

### Cómo activarlo

1. Crea una cuenta gratuita en [formspree.io](https://formspree.io).
2. Crea un formulario nuevo desde el dashboard de Formspree (dale un nombre como "MINAC — Contacto").
3. Copia el **form ID** que te da Formspree (la URL que te muestran tiene la forma `https://formspree.io/f/xxxxxxx`).
4. Copia `.env.example` a `.env.local` en esta carpeta (`apps/landing/.env.local`) y pega tu endpoint real:
   ```bash
   cp .env.example .env.local
   ```
   ```
   NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxx
   ```
5. Reinicia `npm run dev` para que Next.js recargue la variable de entorno.
6. Envía un mensaje de prueba desde el formulario. **Formspree pide confirmar tu correo la primera vez** que llega un envío a un formulario nuevo — revisa tu bandeja de entrada (y spam) y confirma, o ese primer envío (y los siguientes, hasta confirmar) no te llegará.

`.env.local` nunca se sube al repositorio (está en `.gitignore`); solo `.env.example` con el placeholder queda versionado.

### Protección anti-spam

El formulario incluye los dos mecanismos nativos de Formspree:

- Un campo honeypot oculto (`_gotcha`): si un bot lo rellena, Formspree descarta el envío silenciosamente.
- Un asunto fijo (`_subject`: "Nuevo contacto desde landing MINAC") para identificar estos correos en tu bandeja.

Ninguno de los dos requiere configuración adicional de tu parte en el dashboard de Formspree.

### Límite del plan gratuito

El plan gratuito de Formspree permite **50 envíos por mes** por formulario. Si el tráfico del sitio crece y se acerca a ese límite, hay que evaluar pasar a un plan de pago en [formspree.io/pricing](https://formspree.io/pricing).
