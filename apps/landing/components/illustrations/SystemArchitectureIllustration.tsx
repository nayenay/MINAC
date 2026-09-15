interface SystemArchitectureIllustrationProps {
  className?: string;
}

/**
 * Diagrama esquemático de las 3 capas del sistema: Detección, Comunicación
 * y Gestión — refleja circuito/README.md y apps/README.md, sin inventar
 * componentes que no estén documentados. Los 3 puntos de color del
 * "semáforo local" son el único uso decorativo del semáforo funcional,
 * el resto del diagrama usa el acento de marca.
 */
export default function SystemArchitectureIllustration({
  className = "",
}: SystemArchitectureIllustrationProps) {
  const panelProps = {
    fill: "var(--color-bg)",
    stroke: "var(--color-border-strong)",
    strokeWidth: 1.5,
    rx: 6,
  };

  return (
    <svg
      viewBox="0 0 900 260"
      className={className}
      role="img"
      aria-label="Diagrama de arquitectura de tres capas: detección con sensores y ADC, comunicación entre nodos por radio y WiFi, gestión con la Plataforma COM"
    >
      {/* Panel 1: Detección */}
      <rect x="20" y="30" width="250" height="200" {...panelProps} />
      <text
        x="40"
        y="60"
        fill="var(--color-accent-strong)"
        fontSize="12"
        fontWeight="700"
        fontFamily="var(--font-heading)"
        letterSpacing="1"
      >
        01 · DETECCIÓN
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={40 + i * 50}
          y="85"
          width="36"
          height="24"
          rx="2"
          fill="var(--color-bg-panel)"
          stroke="var(--color-border-strong)"
        />
      ))}
      <text x="40" y="126" fill="var(--color-text-muted)" fontSize="9">
        4x sensores MQ
      </text>
      <line
        x1="130"
        y1="120"
        x2="130"
        y2="150"
        stroke="var(--color-border-strong)"
      />
      <rect
        x="80"
        y="150"
        width="100"
        height="30"
        rx="3"
        fill="var(--color-bg-panel)"
        stroke="var(--color-border-strong)"
      />
      <text
        x="95"
        y="169"
        fill="var(--color-text-secondary)"
        fontSize="9"
        fontFamily="var(--font-mono)"
      >
        ADS1115 · ADC
      </text>
      <circle cx="60" cy="205" r="5" fill="var(--color-signal-green)" />
      <circle cx="80" cy="205" r="5" fill="var(--color-signal-yellow)" />
      <circle cx="100" cy="205" r="5" fill="var(--color-signal-red)" />
      <text x="115" y="209" fill="var(--color-text-muted)" fontSize="9">
        Semáforo local
      </text>

      {/* Flecha 1 -> 2 */}
      <path
        d="M270 130 H310"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
        markerEnd="url(#arrow)"
      />

      {/* Panel 2: Comunicación */}
      <rect x="325" y="30" width="250" height="200" {...panelProps} />
      <text
        x="345"
        y="60"
        fill="var(--color-accent-strong)"
        fontSize="12"
        fontWeight="700"
        fontFamily="var(--font-heading)"
        letterSpacing="1"
      >
        02 · COMUNICACIÓN
      </text>
      <rect
        x="345"
        y="90"
        width="80"
        height="50"
        rx="4"
        fill="var(--color-bg-panel)"
        stroke="var(--color-border-strong)"
      />
      <text x="355" y="118" fill="var(--color-text-secondary)" fontSize="9">
        Nodo 1
      </text>
      <text x="355" y="130" fill="var(--color-text-muted)" fontSize="8">
        sin señal
      </text>
      <line
        x1="425"
        y1="115"
        x2="475"
        y2="115"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <rect
        x="480"
        y="90"
        width="80"
        height="50"
        rx="4"
        fill="var(--color-bg-panel)"
        stroke="var(--color-accent)"
      />
      <text x="490" y="118" fill="var(--color-text-secondary)" fontSize="9">
        Gateway
      </text>
      <text x="490" y="130" fill="var(--color-accent-strong)" fontSize="8">
        WiFi activo
      </text>
      <text x="345" y="200" fill="var(--color-text-muted)" fontSize="9">
        Retransmisión por radio si
      </text>
      <text x="345" y="212" fill="var(--color-text-muted)" fontSize="9">
        el nodo no tiene cobertura
      </text>

      {/* Flecha 2 -> 3 */}
      <path
        d="M575 130 H615"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
        markerEnd="url(#arrow)"
      />

      {/* Panel 3: Gestión */}
      <rect x="630" y="30" width="250" height="200" {...panelProps} />
      <text
        x="650"
        y="60"
        fill="var(--color-accent-strong)"
        fontSize="12"
        fontWeight="700"
        fontFamily="var(--font-heading)"
        letterSpacing="1"
      >
        03 · GESTIÓN
      </text>
      <rect
        x="650"
        y="85"
        width="210"
        height="110"
        rx="4"
        fill="var(--color-bg-panel)"
        stroke="var(--color-border-strong)"
      />
      <polyline
        points="665,175 690,150 715,160 740,120 765,135 790,100 815,110 840,90"
        fill="none"
        stroke="var(--color-accent-strong)"
        strokeWidth="2"
      />
      <text x="650" y="212" fill="var(--color-text-muted)" fontSize="9">
        Plataforma COM · tiempo real
      </text>

      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text-muted)" />
        </marker>
      </defs>
    </svg>
  );
}
