import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { EstadoDonacion } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

interface Resultado {
  estado: EstadoDonacion;
  mensaje: string | null;
  monto: number;
  campana: string;
  numeroComprobante: string;
}

// PayU devuelve aquí a la persona con los datos del pago firmados en la URL (referenceCode, transactionState…).
// La API valida esa firma antes de actualizar la donación.
export function ResultadoPagoPage() {
  const [params] = useSearchParams();
  const consulta = params.toString();
  const referencia = params.get("referenceCode");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(referencia ? null : "No recibimos la referencia del pago.");

  useEffect(() => {
    if (!referencia) return;
    let vigente = true;
    api
      .get<Resultado>(`/pagos/payu/respuesta?${consulta}`)
      .then((r) => vigente && setResultado(r))
      .catch((e) => vigente && setError(e instanceof Error ? e.message : "No pudimos verificar el pago"));
    return () => {
      vigente = false;
    };
  }, [consulta, referencia]);

  const vista = resultado ? VISTAS[resultado.estado] : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 pb-16 pt-28">
      <Card className="w-full text-center">
        {error ? (
          <>
            <Icono tono="error" />
            <h1 className="font-serif text-xl font-medium text-ink-900">No pudimos confirmar tu pago</h1>
            <p className="mt-2 text-sm text-ink-500">{error}</p>
          </>
        ) : !resultado || !vista ? (
          <div className="space-y-3">
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="h-6" />
            <p className="text-sm text-ink-500">Verificando tu pago con PayU…</p>
          </div>
        ) : (
          <>
            <Icono tono={vista.tono} />
            <h1 className="font-serif text-xl font-medium text-ink-900">{vista.titulo}</h1>
            <p className="mt-2 text-sm text-ink-500">
              {vista.texto(`$${resultado.monto.toLocaleString("es-CO")}`, resultado.campana)}
            </p>
            {resultado.estado === "FALLIDA" && resultado.mensaje && (
              <p className="mt-2 text-xs text-ink-400">Motivo: {resultado.mensaje}</p>
            )}
            <p className="mt-4 inline-block rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold tracking-wide text-ink-600">
              Comprobante N.º {resultado.numeroComprobante}
            </p>
          </>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to="/" className="flex-1">
            <Button variante="ghost" className="w-full">
              Ver campañas
            </Button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <Button className="w-full">Ir a mi panel</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

type Tono = "exito" | "espera" | "error";

const VISTAS: Record<EstadoDonacion, { tono: Tono; titulo: string; texto: (monto: string, campana: string) => string }> = {
  COMPLETADA: {
    tono: "exito",
    titulo: "¡Gracias por tu donación!",
    texto: (monto, campana) => `Tu aporte de ${monto} a ${campana} fue aprobado. Puedes seguir su avance en tu panel.`,
  },
  PENDIENTE: {
    tono: "espera",
    titulo: "Tu pago está en proceso",
    texto: (monto, campana) =>
      `PayU aún está confirmando tu aporte de ${monto} a ${campana}. Verás el cambio en tu panel cuando se confirme.`,
  },
  FALLIDA: {
    tono: "error",
    titulo: "El pago no se completó",
    texto: (monto) => `No se realizó ningún cobro de ${monto}. Puedes intentarlo de nuevo cuando quieras.`,
  },
};

function Icono({ tono }: { tono: Tono }) {
  const { Componente, clases } = {
    exito: { Componente: CheckCircle2, clases: "bg-royal-50 text-royal-600 ring-gold-200" },
    espera: { Componente: Clock, clases: "bg-gold-50 text-gold-700 ring-gold-100" },
    error: { Componente: XCircle, clases: "bg-clay-100 text-clay-600 ring-clay-100" },
  }[tono];
  return (
    <div className={`mx-auto mb-4 grid h-16 w-16 animate-pop place-items-center rounded-full ring-4 ${clases}`}>
      <Componente className="h-8 w-8" strokeWidth={2} />
    </div>
  );
}
