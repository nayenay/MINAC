"use client";

import type { Pestana } from "@/lib/types";

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: "burn_in", label: "Burn-in" },
  { id: "calibracion", label: "Calibración activa" },
  { id: "practica", label: "Práctica activa" },
  { id: "burnin_24h", label: "Burn-in 24h" },
];

interface Props {
  pestana: Pestana;
  onChange: (pestana: Pestana) => void;
}

export function ModeTabs({ pestana, onChange }: Props) {
  return (
    <div className="flex gap-2 border-b border-[var(--color-border)]">
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            pestana === p.id
              ? "border-[var(--color-accent)] text-[var(--color-text-primary)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
