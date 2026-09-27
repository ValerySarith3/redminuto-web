
export const pesos = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

export const pesosCompactos = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`
    : n >= 1_000
      ? `$${(n / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 0 })} mil`
      : pesos(n);

export type Tono = "exito" | "proceso" | "espera" | "rechazo";
