import type { ReactNode } from "react";
import { ETIQUETAS_ESTADO } from "../../types";

type Tono = "neutral" | "success" | "warning" | "danger";

const tonos: Record<Tono, string> = {
  neutral: "bg-ink-100 text-ink-600",
  success: "bg-royal-100 text-royal-700",
  warning: "bg-gold-100 text-gold-700",
  danger: "bg-clay-100 text-clay-600",
};

const puntos: Record<Tono, string> = {
  neutral: "bg-ink-400",
  success: "bg-royal-500",
  warning: "bg-gold-500",
  danger: "bg-clay-500",
};

const porEstado: Record<string, Tono> = {
  PENDIENTE: "warning",
  EN_REVISION: "warning",
  COMPLETADA: "success",
  ACEPTADA: "success",
  APROBADA: "success",
  FALLIDA: "danger",
  RECHAZADA: "danger",
};

export function Badge({ children, tono }: { children: ReactNode; tono?: Tono }) {
  const resuelto = tono ?? porEstado[String(children)] ?? "neutral";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${tonos[resuelto]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${puntos[resuelto]}`} />
      {typeof children === "string" ? (ETIQUETAS_ESTADO[children] ?? children) : children}
    </span>
  );
}
