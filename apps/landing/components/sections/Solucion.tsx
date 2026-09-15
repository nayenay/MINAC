import {
  IconFlask2,
  IconRadio,
  IconGauge,
  IconShieldCheck,
  IconBattery3,
  IconMapPin,
  IconFileCheck,
} from "@tabler/icons-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductPhotoPlaceholder from "@/components/ui/ProductPhotoPlaceholder";
import SystemArchitectureIllustration from "@/components/illustrations/SystemArchitectureIllustration";
import Image from "next/image";

const layers = [
  {
    icon: IconFlask2,
    title: "Detección",
    description:
      "Cada dispositivo Centinela Minero integra 4 sensores de gas leídos por un ADC externo de 4 canales, calibrados mediante el método Rs/R0 tras un periodo de precalentamiento (burn-in) para reportar concentraciones confiables, no solo lecturas crudas.",
  },
  {
    icon: IconRadio,
    title: "Comunicación",
    description:
      "Los nodos forman una red inalámbrica de bajo consumo: uno o más nodos sin conexión WiFi garantizada retransmiten sus lecturas por radio a un nodo Gateway, que es el único que necesita señal WiFi. Así el sistema es resiliente a zonas sin cobertura, comunes en una mina real.",
  },
  {
    icon: IconMapPin,
    title: "Gestión",
    description:
      "La Plataforma COM concentra cada lectura en un mapa georreferenciado de la operación, genera alertas automáticas por umbral y produce reportes orientados a cumplimiento normativo — no solo un historial de datos.",
  },
];

export default function Solucion() {
  return (
    <section
      id="solucion"
      className="border-b border-border bg-bg-subtle py-16 md:py-24"
    >
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="La solución"
          title="Centinela Minero + Plataforma COM"
          subtitle="No es solo detección individual: es conciencia situacional centralizada para toda la operación, con una arquitectura de tres capas pensada para el entorno real de una mina subterránea."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {layers.map((layer) => (
            <Card key={layer.title} className="flex flex-col gap-4 p-6">
              <layer.icon
                size={28}
                className="text-accent-strong"
                stroke={1.75}
              />
              <h3 className="font-heading text-lg font-bold text-text-primary">
                {layer.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {layer.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-bg p-4">
          <SystemArchitectureIllustration className="h-auto w-full min-w-[640px]" />
        </div>

        <div className="grid gap-8 rounded-lg border border-border bg-bg p-6 md:grid-cols-2 md:p-10">
          <div className="flex flex-col gap-4">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">
              El dispositivo
            </span>
            <h3 className="font-heading text-xl font-extrabold text-text-primary md:text-2xl">
              Centinela Minero
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <IconShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-accent-strong"
                  stroke={1.75}
                />
                Carcasa en Policarbonato con Disipación Electrostática (PC-ESD),
                con protección IP67, diseñada para atmósferas Clase I División
                1.
              </li>
              <li className="flex items-start gap-3">
                <IconGauge
                  size={18}
                  className="mt-0.5 shrink-0 text-accent-strong"
                  stroke={1.75}
                />
                Semáforo visual de 3 LEDs en cada dispositivo: indica el estado
                localmente, sin depender solo del dashboard.
              </li>
              <li className="flex items-start gap-3">
                <IconBattery3
                  size={18}
                  className="mt-0.5 shrink-0 text-accent-strong"
                  stroke={1.75}
                />
                Diseño con autonomía de batería, pensado para seguir operando
                incluso ante un corte de energía.
              </li>
              <li className="flex items-start gap-3">
                <IconFileCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-accent-strong"
                  stroke={1.75}
                />
                Datos centralizados en Plataforma COM para respaldar reportes de
                cumplimiento normativo.
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            {/* TODO: reemplazar con fotografía real mostrando el semáforo de 3 LEDs,
                la etiqueta EX amarilla y la antena del dispositivo */}
            <Image
              src="/centinela-minero2.jpeg"
              alt="Centinela Minero"
              width={400}
              height={400}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
