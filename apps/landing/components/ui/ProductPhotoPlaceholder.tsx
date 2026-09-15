import { IconCamera } from "@tabler/icons-react";

interface ProductPhotoPlaceholderProps {
  label: string;
  className?: string;
  aspect?: string;
}

/**
 * Panel marcador para fotografía real de producto. El diseño está pensado
 * para verse bien con fotografía real (caja blanca, isotipo, malla del
 * sensor, antena, LED de estado, etiqueta EX amarilla) — este bloque es
 * solo el espacio reservado mientras no se tiene la foto final.
 */
export default function ProductPhotoPlaceholder({
  label,
  className = "",
  aspect = "aspect-square",
}: ProductPhotoPlaceholderProps) {
  return (
    <div
      className={`flex ${aspect} flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border-strong bg-bg-panel p-6 text-center text-text-muted ${className}`}
    >
      <IconCamera size={32} stroke={1.5} />
      <p className="max-w-xs text-xs leading-relaxed">{label}</p>
    </div>
  );
}
