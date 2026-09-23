import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";
import { api } from "../lib/api";
import type { Campana, CanalDonacion, Donacion } from "../types";
import { Button } from "./ui/Button";
import { Select } from "./ui/Field";
import { useToast } from "./ui/Toast";

const montosSugeridos = [20000, 50000, 100000, 200000];
const MONTO_MIN = 5000;
const MONTO_MAX = 500000;

interface DonarModalProps {
  campana: Campana;
  onClose: () => void;
  onDonacionCreada: (donacion: Donacion) => void;
}

type Paso = "formulario" | "procesando" | "exito";

export function DonarModal({ campana, onClose, onDonacionCreada }: DonarModalProps) {
  const [monto, setMonto] = useState(50000);
  const [canal, setCanal] = useState<CanalDonacion>("PASARELA");
  const [paso, setPaso] = useState<Paso>("formulario");
  const [error, setError] = useState<string | null>(null);
  const [comprobante, setComprobante] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPaso("procesando");
    try {
      // Simula el tiempo de respuesta de una pasarela real (Wompi/PayU) en modo sandbox.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const donacion = await api.post<Donacion>("/donaciones", { monto, canal, campanaId: campana.id });
      setPaso("exito");
      setComprobante(donacion.numeroComprobante ?? null);
      onDonacionCreada(donacion);
      toast.exito("¡Donación registrada!", `Aportaste $${monto.toLocaleString("es-CO")} a ${campana.titulo}`);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo procesar la donación";
      setError(mensaje);
      setPaso("formulario");
      toast.fallo("No se pudo procesar tu donación", mensaje);
    }
  }

  const porcentajeSlider = ((monto - MONTO_MIN) / (MONTO_MAX - MONTO_MIN)) * 100;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-royal-950/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-pop rounded-2xl border border-ink-200 bg-cream-50 p-6 shadow-2xl shadow-royal-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>

        {paso === "exito" ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 animate-pop place-items-center rounded-full bg-royal-50 text-royal-600 ring-4 ring-gold-200">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink-900">¡Gracias por tu donación!</h3>
            <p className="mt-1 text-sm text-ink-500">
              Tu aporte a <strong>{campana.titulo}</strong> quedó registrado. Puedes ver su avance en tu panel de
              seguimiento.
            </p>
            {comprobante && (
              <p className="mt-3 inline-block rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold tracking-wide text-ink-600">
                Comprobante N.º {comprobante}
              </p>
            )}
            <Button className="mt-6 w-full" onClick={onClose}>
              Listo
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="pr-6 font-serif text-lg font-medium text-ink-900">Donar a {campana.titulo}</h3>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Pago simulado en modo sandbox — no se cobra dinero real.
            </p>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {montosSugeridos.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMonto(m)}
                  className={`rounded-xl border px-2 py-2 text-sm font-semibold transition-all active:scale-95 ${
                    monto === m
                      ? "border-royal-600 bg-royal-600 text-white shadow-sm shadow-royal-900/20"
                      : "border-ink-200 text-ink-600 hover:border-royal-400"
                  }`}
                >
                  ${(m / 1000).toLocaleString("es-CO")}k
                </button>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-ink-700">Monto (COP)</label>
                <span className="font-serif text-lg font-medium text-royal-700">${monto.toLocaleString("es-CO")}</span>
              </div>
              <input
                type="range"
                min={MONTO_MIN}
                max={MONTO_MAX}
                step={1000}
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-100 accent-royal-600"
                style={{
                  background: `linear-gradient(to right, var(--color-royal-600) ${porcentajeSlider}%, var(--color-ink-100) ${porcentajeSlider}%)`,
                }}
              />
              <input
                type="number"
                min={1000}
                step={1000}
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="mt-3 w-full rounded-xl border border-ink-200 bg-cream-50 px-3.5 py-2 text-sm focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25"
                required
              />
            </div>

            <div className="mt-4">
              <Select label="Canal" value={canal} onChange={(e) => setCanal(e.target.value as CanalDonacion)}>
                <option value="PASARELA">Pasarela (tarjeta / PSE)</option>
                <option value="LLAVE">Llave (Bre-B)</option>
                <option value="TRANSFERENCIA">Transferencia bancaria</option>
                <option value="EFECTIVO">Efectivo</option>
              </Select>
            </div>

            {error && <p className="mt-3 text-sm text-clay-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <Button type="button" variante="ghost" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variante="accent" className="flex-1" cargando={paso === "procesando"}>
                {paso === "procesando" ? "Procesando..." : "Confirmar donación"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
