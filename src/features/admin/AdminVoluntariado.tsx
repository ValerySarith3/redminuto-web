import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { EstadoInscripcion, InscripcionVoluntario } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

export function AdminVoluntariado() {
  const toast = useToast();
  const [inscripciones, setInscripciones] = useState<InscripcionVoluntario[] | null>(null);
  const [actualizando, setActualizando] = useState<number | null>(null);

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

      {!inscripciones ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : inscripciones.length === 0 ? (
        <Card className="text-center text-ink-500">Aún no hay inscripciones registradas.</Card>
      ) : (
        <div className="space-y-3">
          {inscripciones.map((inscripcion) => (
            <Card key={inscripcion.id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-800">{inscripcion.voluntario?.nombre}</p>
                  <Badge>{inscripcion.estado}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {inscripcion.voluntario?.email} · {inscripcion.programa?.nombre}
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
