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

export function AdminVoluntariado({ filtroInicial }: { filtroInicial?: string }) {
  const toast = useToast();
  const [inscripciones, setInscripciones] = useState<InscripcionVoluntario[] | null>(null);
  const [actualizando, setActualizando] = useState<number | null>(null);
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

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-medium text-ink-900">Inscripciones de voluntariado</h2>
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
                  <p className="font-semibold text-ink-800">{inscripcion.voluntario?.nombre}</p>
                  <Badge>{inscripcion.estado}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {inscripcion.voluntario?.email} · {inscripcion.programa?.nombre}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                  {inscripcion.actividad
                    ? `${inscripcion.actividad.titulo} · ${formatoFechaActividad(inscripcion.actividad.fecha)} · ${inscripcion.actividad.horaInicio}–${inscripcion.actividad.horaFin}`
                    : "Inscripción general al programa"}
                </p>
              </div>
              {inscripcion.estado === "PENDIENTE" && (
                <div className="flex shrink-0 gap-2">
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
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
