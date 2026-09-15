type Signal = "green" | "yellow" | "red";

interface StatusBadgeProps {
  signal: Signal;
  label: string;
  className?: string;
}

const signalClasses: Record<Signal, string> = {
  green: "border-signal-green text-signal-green bg-signal-green/10",
  yellow: "border-signal-yellow text-signal-yellow bg-signal-yellow/10",
  red: "border-signal-red text-signal-red bg-signal-red/10",
};

export default function StatusBadge({ signal, label, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1 font-heading text-xs uppercase tracking-wide ${signalClasses[signal]} ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full bg-current ${signal !== "green" ? "" : "animate-signal-pulse"}`}
        aria-hidden
      />
      {label}
    </span>
  );
}
