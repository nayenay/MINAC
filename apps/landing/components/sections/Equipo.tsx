import { IconUser } from "@tabler/icons-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

// TODO: reemplazar estos 4 placeholders con los integrantes reales del
// equipo (foto de perfil, rol y nombre completo) antes de publicar.
// No se han inventado nombres ni roles.
const integrantes = [1, 2, 3, 4];

export default function Equipo() {
  return (
    <section id="equipo" className="border-b border-border py-16 md:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading eyebrow="Equipo" title="Quiénes están detrás de MINAC" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {integrantes.map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-bg p-6 text-center shadow-sm"
            >
              {/* TODO: reemplazar con la fotografía real de perfil del integrante */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border-strong bg-bg-panel text-text-muted">
                <IconUser size={36} stroke={1.5} />
              </div>

              {/* TODO: reemplazar "ROL" y "Nombre Apellido" con los datos reales de este integrante */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-primary">ROL</p>
                <p className="mt-1 text-lg font-extrabold text-text-primary">Nombre Apellido</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
