import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

const estilos: Record<Variante, string> = {
  primary:
    "bg-royal-600 text-white shadow-sm shadow-royal-900/20 hover:bg-royal-700 hover:shadow-md hover:shadow-royal-900/25 focus-visible:outline-royal-600",
  accent:
    "bg-gold-400 text-royal-900 shadow-sm shadow-gold-700/20 hover:bg-gold-300 hover:shadow-md focus-visible:outline-gold-500",
  secondary: "bg-royal-900 text-white hover:bg-royal-950 focus-visible:outline-royal-900",
  outline: "border border-royal-300 text-royal-700 hover:border-royal-500 hover:bg-royal-50 focus-visible:outline-royal-600",
  ghost: "text-ink-600 hover:bg-ink-100 focus-visible:outline-ink-400",
  danger: "border border-clay-500 text-clay-600 hover:bg-clay-100 focus-visible:outline-clay-500",
};

export function Button({ variante = "primary", cargando, className = "", children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`shine-hover inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150 ease-out will-change-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${estilos[variante]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
