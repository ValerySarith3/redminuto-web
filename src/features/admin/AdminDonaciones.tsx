import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { ETIQUETAS_CANAL, ETIQUETAS_ESTADO, type Donacion, type EstadoDonacion } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { FiltroChips } from "./FiltroChips";

type Filtro = "TODAS" | EstadoDonacion;

const filtros: Filtro[] = ["PENDIENTE", "COMPLETADA", "FALLIDA", "TODAS"];

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export function AdminDonaciones({ filtroInicial }: { filtroInicial?: string }) {
  const toast = useToast();
  const [donaciones, setDonaciones] = useState<Donacion[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>(
    filtros.includes(filtroInicial as Filtro) ? (filtroInicial as Filtro) : "PENDIENTE",
  );
  const [actualizando, setActualizando] = useState<number | null>(null);

  useEffect(() => {
    api.get<Donacion[]>("/donaciones").then(setDonaciones);
  }, []);

  const visibles = useMemo(
    () => donaciones?.filter((d) => filtro === "TODAS" || d.estado === filtro) ?? null,
    [donaciones, filtro],
  );
  const conteo = (f: Filtro) => donaciones?.filter((d) => f === "TODAS" || d.estado === f).length ?? 0;

  async function cambiarEstado(donacion: Donacion, estado: EstadoDonacion) {
    const nota =
      estado === "COMPLETADA" ? "Pago verificado por Casa Minuto de Dios" : "El pago no se recibió o fue rechazado";
    setActualizando(donacion.id);
    try {
      await api.put(`/donaciones/${donacion.id}/estado`, { estado, nota });
      setDonaciones((actual) => actual?.map((d) => (d.id === donacion.id ? { ...d, estado } : d)) ?? actual);
      toast.exito(estado === "COMPLETADA" ? "Donación confirmada" : "Donación marcada como fallida");
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo actualizar la donación";
      toast.fallo("No se pudo actualizar la donación", mensaje);
    } finally {
      setActualizando(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-medium text-ink-900">Donaciones</h2>
        <p className="mt-1 text-sm text-ink-500">
          Las donaciones por transferencia, llave o efectivo quedan pendientes y solo suman a la meta de la campaña cuando
          las confirmas.
        </p>
      </div>

      <FiltroChips
        valor={filtro}
        onChange={setFiltro}
        opciones={filtros.map((f) => ({ id: f, label: f === "TODAS" ? "Todas" : ETIQUETAS_ESTADO[f], cantidad: conteo(f) }))}
      />

      {!visibles ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : visibles.length === 0 ? (
        <Card className="text-center text-ink-500">
          {filtro === "PENDIENTE" ? "No hay donaciones pendientes por confirmar." : "No hay donaciones en este filtro."}
        </Card>
      ) : (
        <div className="space-y-3">
          {visibles.map((donacion) => (
            <Card key={donacion.id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-lg font-medium text-ink-900">
                    ${Number(donacion.monto).toLocaleString("es-CO")}
                  </p>
                  <Badge>{donacion.estado}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-600">
                  {donacion.campana?.titulo}
                  {donacion.campana?.programa ? ` · ${donacion.campana.programa.nombre}` : ""}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {donacion.donante ? `${donacion.donante.nombre} (${donacion.donante.email})` : "Donante eliminado"} ·{" "}
                  {ETIQUETAS_CANAL[donacion.canal]}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                  {donacion.numeroComprobante} · {formatoFecha.format(new Date(donacion.creadoEn))}
                  {donacion.pago ? ` · Ref. ${donacion.pago.referencia.slice(0, 8)}` : ""}
                </p>
              </div>
              {donacion.estado === "PENDIENTE" && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    className="px-3 py-1.5 text-xs"
                    cargando={actualizando === donacion.id}
                    onClick={() => cambiarEstado(donacion, "COMPLETADA")}
                  >
                    Confirmar pago
                  </Button>
                  <Button
                    variante="danger"
                    className="px-3 py-1.5 text-xs"
                    cargando={actualizando === donacion.id}
                    onClick={() => cambiarEstado(donacion, "FALLIDA")}
                  >
                    Marcar fallida
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
