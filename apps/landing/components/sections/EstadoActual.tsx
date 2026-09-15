import { IconFlask2, IconTestPipe, IconRadio, IconAlertTriangle } from "@tabler/icons-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductPhotoPlaceholder from "@/components/ui/ProductPhotoPlaceholder";

const evidencia = [
  {
    icon: IconFlask2,
    title: "Calibración de sensores completada",
    description:
      "Tres rondas de calibración por el método Rs/R0, con la tercera ronda aceptada como oficial bajo un criterio de variación menor al 3% entre mediciones consecutivas.",
  },
  {
    icon: IconTestPipe,
    title: "Pruebas de detección validadas",
    description:
      "Detección validada con gases de referencia en una cámara de pruebas controlada de laboratorio.",
  },
  {
    icon: IconRadio,
    title: "Comunicación resiliente probada",
    description:
      "Arquitectura de dos nodos probada tanto con conectividad directa como retransmitiendo por radio cuando un nodo no tiene señal WiFi.",
  },
];

const limitaciones = [
  "El sensor MQ-135 de uno de los nodos mostró lecturas inconsistentes en pruebas de laboratorio; se optó por documentar la falla en vez de recalibrar sobre ella, y sigue en diagnóstico.",
  "La cobertura de sensores está en evolución: el circuito actual no mide SO2 ni déficit de O2 de forma directa frente a los 6 gases objetivo de MINAC — un hueco documentado como línea de trabajo futura.",
  "El sistema no incluye ventilación forzada en esta fase (decisión de alcance para el prototipo actual).",
  "Los umbrales de alerta usados son referencias de exposición ocupacional general (NIOSH/OSHA), no una certificación NOM-023-STPS.",
];

export default function EstadoActual() {
  return (
    <section id="estado-actual" className="border-b border-border py-16 md:py-24">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-accent bg-accent-soft px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide text-accent-strong">
            Prototipo funcional en validación de laboratorio (TRL 3-4)
          </span>
          <SectionHeading
            eyebrow="Estado actual"
            title="Resultados reales de una fase temprana, documentados sin adornos"
            subtitle="MINAC está en fase de validación de laboratorio. Compartimos tanto lo que ya funciona como lo que todavía no, porque esa honestidad es parte de cómo construimos un producto de seguridad industrial."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {evidencia.map((item) => (
            <Card key={item.title} className="flex flex-col gap-3 p-6">
              <item.icon size={24} className="text-accent-strong" stroke={1.75} />
              <h3 className="font-heading text-base font-bold text-text-primary">{item.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{item.description}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col gap-4 border-accent/40 bg-accent-soft/40 p-6">
          <div className="flex items-center gap-3">
            <IconAlertTriangle size={22} className="text-accent-strong" stroke={1.75} />
            <h3 className="font-heading text-base font-bold text-text-primary">Limitaciones conocidas</h3>
          </div>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-text-secondary">
            {limitaciones.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-text-muted">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* TODO: reemplazar con una fotografía real de la calibración/pruebas de laboratorio */}
          <ProductPhotoPlaceholder
            label="Foto real de calibración en laboratorio (pendiente)"
            aspect="aspect-video"
          />
          {/* TODO: reemplazar con una captura real del dashboard de Plataforma COM */}
          <ProductPhotoPlaceholder
            label="Captura real de Plataforma COM (pendiente)"
            aspect="aspect-video"
          />
        </div>
      </Container>
    </section>
  );
}
