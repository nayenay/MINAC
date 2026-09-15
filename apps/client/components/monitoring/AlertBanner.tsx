import type { ReactNode } from "react";

interface AlertBannerProps {
  tone?: "warning" | "error" | "info";
  children: ReactNode;
}

const TONE_STYLES = {
  warning:
    "border-[#F8B519]/40 bg-[#F8B519]/10 text-[#F8B519]",
  error: "border-[#821600]/60 bg-[#821600]/20 text-[#ffb4a8]",
  info: "border-[#333333] bg-[#1a1a1a] text-[#cccccc]",
} as const;

export default function AlertBanner({
  tone = "warning",
  children,
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border px-4 py-3 text-sm ${TONE_STYLES[tone]}`}
    >
      {children}
    </div>
  );
}
