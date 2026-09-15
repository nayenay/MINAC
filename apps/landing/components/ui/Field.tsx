import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  optional?: boolean;
}

export default function Field({ label, htmlFor, error, children, optional }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-heading text-xs uppercase tracking-wide text-text-secondary"
      >
        {label}
        {optional && <span className="ml-1 normal-case text-text-muted">(opcional)</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-signal-red" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
