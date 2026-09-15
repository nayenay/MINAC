import Hero from "@/components/sections/Hero";
import Problema from "@/components/sections/Problema";
import Solucion from "@/components/sections/Solucion";
import EstadoActual from "@/components/sections/EstadoActual";
import Equipo from "@/components/sections/Equipo";
import Contacto from "@/components/sections/Contacto";

export default function Home() {
  return (
    <>
      <Hero />
      <Problema />
      <Solucion />
      <EstadoActual />
      <Equipo />
      <Contacto />
    </>
  );
}
