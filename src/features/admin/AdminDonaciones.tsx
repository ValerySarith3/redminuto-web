import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { ETIQUETAS_CANAL, ETIQUETAS_ESTADO, type Donacion, type EstadoDonacion } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { FiltroChips } from "./FiltroChips";
import { FichaUsuario } from "./FichaUsuario";
import { Eye } from "lucide-react";

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
  const [fichaId, setFichaId] = useState<number | null>(null);

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

  const [descargando, setDescargando] = useState(false);

  async function descargarCsv() {
    setDescargando(true);
    try {
      await api.descargar(`/reportes/exportar/donaciones`, `redminuto-donaciones-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      toast.fallo("No se pudo descargar el archivo", e instanceof Error ? e.message : undefined);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
        <h2 className="font-serif text-xl font-medium text-ink-900">Donaciones</h2>
        <p className="mt-1 text-sm text-ink-500">
          Las donaciones por transferencia, llave o efectivo quedan pendientes y solo suman a la meta de la campaña cuando
          las confirmas.
        </p>
        </div>
        <Button variante="outline" cargando={descargando} onClick={descargarCsv}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar (CSV)
        </Button>
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
                  {donacion.pago ? ` · Ref. de pago ${donacion.pago.referencia}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                {donacion.donanteId && (
                  <Button variante="ghost" className="px-3 py-1.5 text-xs" onClick={() => setFichaId(donacion.donanteId!)}>
                    <Eye className="h-3.5 w-3.5" /> Ver datos
                  </Button>
                )}
                {donacion.estado === "PENDIENTE" && donacion.canal === "PASARELA" && (
                  <p className="max-w-56 rounded-xl bg-royal-50 px-3 py-2 text-xs text-royal-800">
                    Esperando la respuesta de PayU. Se confirma automáticamente, no necesitas hacer nada.
                  </p>
                )}
                {donacion.estado === "PENDIENTE" && donacion.canal !== "PASARELA" && (
                  <>
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
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {fichaId !== null && <FichaUsuario usuarioId={fichaId} seccion="donaciones" onClose={() => setFichaId(null)} />}
    </div>
  );
}
