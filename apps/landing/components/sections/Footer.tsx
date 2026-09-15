import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-panel">
      <Container className="flex flex-col gap-6 py-10 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          {/* <Logo size="sm" /> */}
          <p className="max-w-sm">
            Monitoreo inteligente de atmósferas críticas en minas subterráneas.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#problema" className="hover:text-text-primary">
            El problema
          </a>
          <a href="#solucion" className="hover:text-text-primary">
            La solución
          </a>
          <a href="#estado-actual" className="hover:text-text-primary">
            Estado actual
          </a>
          <a href="#equipo" className="hover:text-text-primary">
            Equipo
          </a>
          <a href="#contacto" className="hover:text-text-primary">
            Contacto
          </a>
        </nav>
        {/* TODO: agregar enlaces reales a redes sociales o sitio institucional cuando estén disponibles */}
      </Container>
    </footer>
  );
}
