import { IconWind, IconFlame, IconDroplet, IconCloudFog, IconAtom2, IconLungsOff, IconGavel } from "@tabler/icons-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import HazardMark from "@/components/ui/HazardMark";

const gases = [
  {
    icon: IconFlame,
    name: "CH4",
    label: "Metano",
    note: "Inflamable — riesgo de explosión en concentraciones altas.",
  },
  {
    icon: IconLungsOff,
    name: "CO",
    label: "Monóxido de carbono",
    note: "Inodoro — imperceptible sin instrumentación.",
  },
  {
    icon: IconDroplet,
    name: "H2S",
    label: "Ácido sulfhídrico",
    note: "Paraliza el olfato a concentraciones altas, dejando de percibirse justo cuando es más peligroso.",
  },
  {
    icon: IconCloudFog,
    name: "SO2",
    label: "Dióxido de azufre",
    note: "Irritante respiratorio en exposición prolongada.",
  },
  {
    icon: IconAtom2,
    name: "CO2",
    label: "Dióxido de carbono",
    note: "Desplaza el oxígeno disponible en espacios cerrados.",
  },
  {
    icon: IconWind,
    name: "O2",
    label: "Déficit de oxígeno",
    note: "Una atmósfera puede volverse irrespirable sin ningún cambio visible.",
  },
];

export default function Problema() {
  return (
    <section id="problema" className="border-b border-border py-16 md:py-24">
      <Container className="flex flex-col gap-12">
        <div className="flex items-start justify-between gap-6">
          <SectionHeading
            eyebrow="El problema"
            title="La detección individual no da visibilidad de toda la operación"
            subtitle="Los detectores personales tradicionales son reactivos: avisan a quien los porta, en el momento en que ya está expuesto. No ofrecen a la operación una visibilidad centralizada y en tiempo real de lo que ocurre en cada punto de la mina."
          />
          <HazardMark className="hidden h-16 w-16 shrink-0 sm:block" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {gases.map((gas) => (
            <Card key={gas.name} className="flex flex-col gap-3 p-4">
              <gas.icon size={22} className="text-accent-strong" stroke={1.75} />
              <div>
                <p className="font-heading text-lg font-bold text-text-primary">{gas.name}</p>
                <p className="text-xs text-text-secondary">{gas.label}</p>
              </div>
              <p className="text-xs leading-relaxed text-text-muted">{gas.note}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col gap-3 bg-bg-panel p-6 md:flex-row md:items-start md:gap-6">
          <IconGavel size={28} className="shrink-0 text-accent-strong" stroke={1.75} />
          <p className="text-sm leading-relaxed text-text-secondary">
            El marco normativo del sector, la <strong className="text-text-primary">NOM-023-STPS-2012</strong>, establece
            condiciones de seguridad para las actividades de minería subterránea. Contar con monitoreo continuo y
            centralizado de atmósferas críticas no es solo una mejora operativa — es parte de cómo una mina demuestra
            cumplimiento normativo de forma verificable.
          </p>
        </Card>
      </Container>
    </section>
  );
}
