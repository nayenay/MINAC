interface HazardMarkProps {
  className?: string;
}

/**
 * Rombo de advertencia tipo señalética industrial (referencia a las
 * etiquetas de atmósfera explosiva del dispositivo real) — usado como
 * acento de textura puntual, no como patrón decorativo de toda la página.
 */
export default function HazardMark({ className = "" }: HazardMarkProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect
        x="4"
        y="4"
        width="32"
        height="32"
        rx="2"
        transform="rotate(45 20 20)"
        fill="var(--color-accent-soft)"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
      <rect x="18.5" y="12" width="3" height="12" fill="var(--color-accent)" />
      <rect x="18.5" y="26" width="3" height="3" fill="var(--color-accent)" />
    </svg>
  );
}
