interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Cargando…",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-3xl border border-[#333333] bg-[#171717] px-6 py-8 text-center"
    >
      <div
        className="mx-auto mb-3 h-2 w-16 animate-pulse rounded-full bg-[#F8B519]/70"
        aria-hidden
      />
      <p className="text-sm text-[#cccccc]">{message}</p>
    </div>
  );
}
