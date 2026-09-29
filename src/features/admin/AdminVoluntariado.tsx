import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { ETIQUETAS_ESTADO, formatoFechaActividad, type EstadoInscripcion, type InscripcionVoluntario } from "../../types";
import { FiltroChips } from "./FiltroChips";

type Filtro = "TODAS" | EstadoInscripcion;
const filtros: Filtro[] = ["PENDIENTE", "ACEPTADA", "RECHAZADA", "TODAS"];
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { FichaUsuario } from "./FichaUsuario";
import { Eye, Phone } from "lucide-react";

export function AdminVoluntariado({ filtroInicial }: { filtroInicial?: string }) {
  const toast = useToast();
  const [inscripciones, setInscripciones] = useState<InscripcionVoluntario[] | null>(null);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [fichaId, setFichaId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<Filtro>(
    filtros.includes(filtroInicial as Filtro) ? (filtroInicial as Filtro) : "TODAS",
  );

  const visibles = useMemo(
    () => inscripciones?.filter((i) => filtro === "TODAS" || i.estado === filtro) ?? null,
    [inscripciones, filtro],
  );
  const conteo = (f: Filtro) => inscripciones?.filter((i) => f === "TODAS" || i.estado === f).length ?? 0;

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const lista = await api.get<InscripcionVoluntario[]>("/voluntariado");
    setInscripciones(lista);
  }

  async function cambiarEstado(inscripcion: InscripcionVoluntario, estado: EstadoInscripcion) {
    setActualizando(inscripcion.id);
    try {
      await api.put(`/voluntariado/${inscripcion.id}/estado`, { estado });
      setInscripciones(
        (actual) => actual?.map((i) => (i.id === inscripcion.id ? { ...i, estado } : i)) ?? actual,
      );
      toast.exito("Inscripción actualizada");
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo actualizar la inscripción";
      toast.fallo("No se pudo actualizar la inscripción", mensaje);
    } finally {
      setActualizando(null);
    }
  }

  const [descargando, setDescargando] = useState(false);

  async function descargarCsv() {
    setDescargando(true);
    try {
      await api.descargar(`/reportes/exportar/inscripciones`, `redminuto-voluntariado-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      toast.fallo("No se pudo descargar el archivo", e instanceof Error ? e.message : undefined);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="font-serif text-xl font-medium text-ink-900">Inscripciones de voluntariado</h2>
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
        <Card className="text-center text-ink-500">No hay inscripciones en este filtro.</Card>
      ) : (
        <div className="space-y-3">
          {visibles.map((inscripcion) => (
            <Card key={inscripcion.id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFichaId(inscripcion.voluntarioId)}
                    className="font-semibold text-ink-800 underline-offset-2 hover:text-royal-700 hover:underline"
                  >
                    {inscripcion.voluntario?.nombre}
                  </button>
                  <Badge>{inscripcion.estado}</Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-500">
                  <span>{inscripcion.voluntario?.email}</span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {inscripcion.voluntario?.telefono ?? <span className="text-ink-400">Sin celular</span>}
                  </span>
                  <span>{inscripcion.programa?.nombre}</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                  {inscripcion.actividad
                    ? `${inscripcion.actividad.titulo} · ${formatoFechaActividad(inscripcion.actividad.fecha)} · ${inscripcion.actividad.horaInicio}–${inscripcion.actividad.horaFin}`
                    : "Inscripción general al programa"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variante="ghost"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setFichaId(inscripcion.voluntarioId)}
                >
                  <Eye className="h-3.5 w-3.5" /> Ver datos
                </Button>
                {inscripcion.estado === "PENDIENTE" && (
                  <>
                    <Button
                      variante="primary"
                      className="px-3 py-1.5 text-xs"
                      cargando={actualizando === inscripcion.id}
                      onClick={() => cambiarEstado(inscripcion, "ACEPTADA")}
                    >
                      Aceptar
                    </Button>
                    <Button
                      variante="danger"
                      className="px-3 py-1.5 text-xs"
                      cargando={actualizando === inscripcion.id}
                      onClick={() => cambiarEstado(inscripcion, "RECHAZADA")}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {fichaId !== null && <FichaUsuario usuarioId={fichaId} seccion="voluntariado" onClose={() => setFichaId(null)} />}
    </div>
  );
}
