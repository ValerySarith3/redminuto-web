// Formatos y tonos compartidos por el tablero y el reporte del admin.

export const pesos = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

export const pesosCompactos = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`
    : n >= 1_000
      ? `$${(n / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 0 })} mil`
      : pesos(n);

// Tonos de estado: éxito / en proceso / en espera / rechazo. Siempre van con etiqueta y conteo, nunca solo color.
export type Tono = "exito" | "proceso" | "espera" | "rechazo";
