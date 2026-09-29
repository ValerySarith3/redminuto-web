import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { iconoPrograma } from "../../lib/programIcons";
import {
  formatoFechaActividad,
  type Actividad,
  type AvanceProgramaVoluntarios,
  type InscripcionVoluntario,
  type Programa,
  type Usuario,
} from "../../types";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/PageHeader";
import { useToast } from "../../components/ui/Toast";
import { StaggerGroup, StaggerItem, staggerItem } from "../../components/Reveal";
import { DatosContactoModal } from "./DatosContactoModal";

type Destino = { actividadId: number };

interface ProgramaConAvance extends Programa {
  avance: AvanceProgramaVoluntarios | null;
  actividades: Actividad[];
}

export function VoluntariosPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [programas, setProgramas] = useState<ProgramaConAvance[] | null>(null);
  const [mias, setMias] = useState<InscripcionVoluntario[]>([]);
  const [inscribiendo, setInscribiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<{ destino: Destino; nombre: string; perfil: Usuario | null } | null>(null);

  useEffect(() => {
    cargar();
  }, [usuario]);

  async function cargar() {
    try {
      const [listaProgramas, actividades] = await Promise.all([
        api.get<Programa[]>("/programas"),
        api.get<Actividad[]>("/actividades"),
      ]);
      const conAvance = await Promise.all(
        listaProgramas.map(async (p) => ({
          ...p,
          avance: await api.get<AvanceProgramaVoluntarios>(`/dashboard/programas/${p.id}`).catch(() => null),
          actividades: actividades.filter((a) => a.programaId === p.id),
        })),
      );
      setProgramas(conAvance);

      if (usuario) setMias(await api.get<InscripcionVoluntario[]>("/voluntariado/mias"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los programas");
    }
  }

  async function inscribirse(destino: Destino, nombre: string) {
    if (!usuario) {
      window.location.href = "/auth";
      return;
    }
    const perfil = await api.get<Usuario>("/usuarios/yo").catch(() => null);
    if (!perfil?.telefono) {
      setPendiente({ destino, nombre, perfil });
      return;
    }
    await confirmarInscripcion(destino, nombre);
  }

  async function confirmarInscripcion(destino: Destino, nombre: string) {
    const clave = `a${destino.actividadId}`;
    setInscribiendo(clave);
    setError(null);
    try {
      await api.post("/voluntariado", destino);
      toast.exito("¡Inscripción registrada!", `${nombre}: queda pendiente de aprobación. Síguela en tu panel.`);
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo completar la inscripción";
      setError(mensaje);
      toast.fallo("No se pudo completar la inscripción", mensaje);
    } finally {
      setInscribiendo(null);
    }
  }

  const inscritoEnActividad = (id: number) => mias.some((i) => i.actividadId === id);

  return (
    <div>
      <PageHeader
        eyebrow="Voluntariado"
        titulo="Súmate al"
        acento="voluntariado"
        descripcion="Elige una jornada con fecha, horario y lugar. Verás los cupos disponibles y el estado de tu inscripción en tu panel."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {error && <p className="mb-6 text-sm text-clay-600">{error}</p>}

        {!programas ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <StaggerGroup className="grid gap-6 lg:grid-cols-2">
            {programas.map((programa) => {
              const Icono = iconoPrograma(programa.nombre);
              return (
                <StaggerItem key={programa.id} variants={staggerItem}>
                  <Card className="flex h-full flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-royal-50">
                        <Icono className="h-4 w-4 text-royal-700" strokeWidth={2} />
                      </span>
                      <div>
                        <h2 className="font-serif text-lg font-medium text-ink-900">{programa.nombre}</h2>
                        <p className="mt-1 text-sm text-ink-500">{programa.descripcion}</p>
                      </div>
                    </div>
                    {programa.avance && programa.avance.cupo > 0 && (
                      <ProgressBar
                        porcentaje={programa.avance.porcentaje}
                        etiqueta={`Cupos en las próximas jornadas: ${programa.avance.inscritos}/${programa.avance.cupo} voluntarios`}
                      />
                    )}

                    {programa.actividades.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Próximas jornadas</p>
                        {programa.actividades.map((actividad) => {
                          const yaInscrito = inscritoEnActividad(actividad.id);
                          const lleno = (actividad.disponibles ?? 0) <= 0;
                          return (
                            <div key={actividad.id} className="rounded-xl border border-ink-200 bg-cream-100/60 p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-ink-800">{actividad.titulo}</p>
                                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarDays className="h-3.5 w-3.5" /> {formatoFechaActividad(actividad.fecha)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" /> {actividad.horaInicio} – {actividad.horaFin}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" /> {actividad.lugar}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variante={yaInscrito ? "outline" : "primary"}
                                  className="px-3 py-1.5 text-xs"
                                  disabled={yaInscrito || lleno}
                                  cargando={inscribiendo === `a${actividad.id}`}
                                  onClick={() => inscribirse({ actividadId: actividad.id }, actividad.titulo)}
                                >
                                  {yaInscrito ? (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Inscrito
                                    </>
                                  ) : lleno ? (
                                    "Cupo lleno"
                                  ) : (
                                    "Inscribirme"
                                  )}
                                </Button>
                              </div>
                              <div className="mt-3">
                                <ProgressBar
                                  compact
                                  porcentaje={actividad.cupo > 0 ? ((actividad.inscritos ?? 0) / actividad.cupo) * 100 : 0}
                                  etiqueta={`${actividad.inscritos}/${actividad.cupo} cupos · quedan ${actividad.disponibles}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-auto rounded-xl border border-dashed border-ink-200 px-4 py-3 text-sm text-ink-400">
                        Aún no hay jornadas programadas para este programa. Vuelve pronto.
                      </p>
                    )}
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>

      {pendiente && (
        <DatosContactoModal
          perfil={pendiente.perfil}
          onClose={() => setPendiente(null)}
          onGuardado={() => {
            setPendiente(null);
            confirmarInscripcion(pendiente.destino, pendiente.nombre);
          }}
        />
      )}
    </div>
  );
}
