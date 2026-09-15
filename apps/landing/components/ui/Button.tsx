import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  solid:
    "bg-accent text-text-primary border border-accent hover:bg-accent-hover hover:border-accent-hover",
  outline:
    "bg-transparent text-text-primary border border-text-primary hover:border-accent hover:text-accent-strong",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:text-text-primary",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-heading uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

type AnchorProps = { href: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "className"
>;
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
>;

export default function Button({
  variant = "solid",
  size = "md",
  children,
  className = "",
  href,
  ...rest
}: CommonProps & Partial<AnchorProps> & Partial<NativeButtonProps>) {
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as Omit<AnchorProps, "href">)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as NativeButtonProps)}>
      {children}
    </button>
  );
}
