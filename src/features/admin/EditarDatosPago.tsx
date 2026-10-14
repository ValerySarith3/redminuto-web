import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { DatosPago } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

const vacio: DatosPago = {
  banco: "",
  tipoCuenta: "",
  numeroCuenta: "",
  titular: "",
  nit: "",
  llave: "",
  direccionEfectivo: "",
  horarioEfectivo: "",
};

// Lo que ve el donante al elegir transferencia, llave Bre-B o efectivo.
export function EditarDatosPago({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [formulario, setFormulario] = useState<DatosPago | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DatosPago | null>("/pagos/datos")
      .then((d) => setFormulario(d ?? vacio))
      .catch(() => setFormulario(vacio));
  }, []);

  function campo(clave: keyof DatosPago, valor: string) {
    setFormulario((f) => (f ? { ...f, [clave]: valor } : f));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.put("/pagos/datos", formulario);
      toast.exito("Datos de pago actualizados");
      onClose();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudieron guardar los datos de pago";
      setError(mensaje);
      toast.fallo("No se pudieron guardar los datos de pago", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo="Datos de pago"
      subtitulo="Lo que ve el donante al elegir transferencia, llave Bre-B o efectivo."
      onClose={onClose}
      ancho="max-w-2xl"
      pie={
        <>
          <Button type="button" variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-datos-pago" cargando={guardando} disabled={!formulario}>
            Guardar cambios
          </Button>
        </>
      }
    >
      {!formulario ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <form id="form-datos-pago" onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Transferencia bancaria</legend>
            <Input label="Banco" value={formulario.banco} onChange={(e) => campo("banco", e.target.value)} required />
            <Input
              label="Tipo de cuenta"
              value={formulario.tipoCuenta}
              onChange={(e) => campo("tipoCuenta", e.target.value)}
              required
            />
            <Input
              label="Número de cuenta"
              value={formulario.numeroCuenta}
              onChange={(e) => campo("numeroCuenta", e.target.value)}
              required
            />
            <Input label="NIT" value={formulario.nit} onChange={(e) => campo("nit", e.target.value)} required />
            <div className="sm:col-span-2">
              <Input label="Titular" value={formulario.titular} onChange={(e) => campo("titular", e.target.value)} required />
            </div>
          </fieldset>
          <fieldset className="grid gap-4">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Llave Bre-B</legend>
            <Input label="Llave" value={formulario.llave} onChange={(e) => campo("llave", e.target.value)} required />
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Efectivo</legend>
            <Input
              label="Dirección"
              value={formulario.direccionEfectivo}
              onChange={(e) => campo("direccionEfectivo", e.target.value)}
              required
            />
            <Input
              label="Horario"
              value={formulario.horarioEfectivo}
              onChange={(e) => campo("horarioEfectivo", e.target.value)}
              required
            />
          </fieldset>
          {error && <p className="text-sm text-clay-600">{error}</p>}
        </form>
      )}
    </Modal>
  );
}
