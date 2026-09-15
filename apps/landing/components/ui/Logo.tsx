import Image from "next/image";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const LOGO_WIDTH = 1983;
const LOGO_HEIGHT = 528;

/**
 * Logo real de MINAC (public/minac-logo.png): isotipo de pico minero +
 * wordmark "MINAC" con la "N" en mostaza-naranja + "Soluciones Mineras".
 * No hay una versión recortada distinta para el header — solo cambia el
 * tamaño de render entre la barra de navegación (compacta) y el hero
 * (grande, como elemento principal de marca).
 */
export default function Logo({ size = "sm", className = "" }: LogoProps) {
  const heightClass = size === "lg" ? "h-14 sm:h-20" : "h-8";

  return (
    <Image
      src="/minac-logo.png"
      alt="MINAC — Soluciones Mineras"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={size === "lg"}
      className={`w-auto ${heightClass} ${className}`}
    />
  );
}
