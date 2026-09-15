import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import ProductPhotoPlaceholder from "@/components/ui/ProductPhotoPlaceholder";
//import Logo from "@/components/ui/Logo";

export default function Hero() {
  return (
    <section id="top" className="border-b border-border bg-bg-subtle">
      <Container className="flex flex-col gap-12 py-16 md:py-24 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-6">
          {/*<Logo size="sm" />*/}

          <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            Detección temprana de gases tóxicos en minas subterráneas, en tiempo real y en cada punto de la mina — no solo en la entrada.
          </h1>

          <p className="max-w-xl text-base text-text-secondary sm:text-lg">
            MINAC combina una red de dispositivos <strong className="text-text-primary">Centinela Minero</strong> con
            comunicación resiliente entre nodos y un panel de gestión, <strong className="text-text-primary">Plataforma COM</strong>,
            para dar visibilidad centralizada a toda la operación, no solo detección individual.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button href="#contacto" size="lg">
              Contactar
            </Button>
            <Button href="#solucion" variant="outline" size="lg">
              Ver la solución
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <StatusBadge signal="green" label="Seguro" />
            <StatusBadge signal="yellow" label="Precaución" />
            <StatusBadge signal="red" label="Alerta" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {/* TODO: reemplazar con fotografía real del dispositivo Centinela Minero
              (caja PC-ESD blanca, isotipo MINAC, malla circular del sensor, antena,
              LED de estado, etiqueta EX amarilla) */}
          <ProductPhotoPlaceholder
            label="Fotografía real del dispositivo Centinela Minero (pendiente)"
            aspect="aspect-[4/5]"
            className="w-full max-w-sm"
          />
        </div>
      </Container>
    </section>
  );
}
