interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">
        {eyebrow}
      </span>
      <h2 className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-base text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
