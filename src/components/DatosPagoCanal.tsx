import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { CanalDonacion, DatosPago } from "../types";

// Datos para pagar por fuera de la pasarela: a dónde transferir, qué llave usar o dónde llevar el efectivo.
export function DatosPagoCanal({
  canal,
  datos,
  comprobante,
}: {
  canal: CanalDonacion;
  datos: DatosPago;
  comprobante?: string | null;
}) {
  if (canal === "PASARELA") return null;

  const filas: { etiqueta: string; valor: string; copiable?: boolean }[] =
    canal === "TRANSFERENCIA"
      ? [
          { etiqueta: "Banco", valor: datos.banco },
          { etiqueta: "Tipo de cuenta", valor: datos.tipoCuenta },
          { etiqueta: "Número de cuenta", valor: datos.numeroCuenta, copiable: true },
          { etiqueta: "Titular", valor: datos.titular },
          { etiqueta: "NIT", valor: datos.nit, copiable: true },
        ]
      : canal === "LLAVE"
        ? [
            { etiqueta: "Llave Bre-B", valor: datos.llave, copiable: true },
            { etiqueta: "Titular", valor: datos.titular },
          ]
        : [
            { etiqueta: "Dirección", valor: datos.direccionEfectivo },
            { etiqueta: "Horario", valor: datos.horarioEfectivo },
          ];

  return (
    <div className="rounded-2xl border border-royal-100 bg-royal-50/60 p-4 text-left">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-royal-700">
        {canal === "EFECTIVO" ? "Dónde entregar tu aporte" : "Datos para tu pago"}
      </p>
      <dl className="mt-2 space-y-1.5">
        {filas.map((f) => (
          <div key={f.etiqueta} className="flex items-center justify-between gap-3 text-sm">
            <dt className="shrink-0 text-ink-500">{f.etiqueta}</dt>
            <dd className="flex min-w-0 items-center gap-1.5 text-right font-medium text-ink-800">
              <span className="break-words">{f.valor}</span>
              {f.copiable && <BotonCopiar texto={f.valor} />}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-ink-500">
        {canal === "EFECTIVO"
          ? comprobante
            ? `Menciona el comprobante N.º ${comprobante} al entregar tu aporte.`
            : "Al confirmar recibirás un número de comprobante para mencionarlo al entregar tu aporte."
          : comprobante
            ? `Escribe el comprobante N.º ${comprobante} en la descripción del pago para que podamos identificarlo.`
            : "Al confirmar recibirás un número de comprobante para escribirlo en la descripción del pago."}
      </p>
    </div>
  );
}

function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el dato sigue visible para copiarlo a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={`Copiar ${texto}`}
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-royal-600 transition-colors hover:bg-royal-100"
    >
      {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
