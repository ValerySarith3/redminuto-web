import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { iconoPrograma } from "../../lib/programIcons";
import type { AvanceProgramaVoluntarios, InscripcionVoluntario, Programa } from "../../types";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/PageHeader";
import { useToast } from "../../components/ui/Toast";
import { StaggerGroup, StaggerItem, staggerItem } from "../../components/Reveal";

interface ProgramaConAvance extends Programa {
  avance: AvanceProgramaVoluntarios | null;
}

export function VoluntariosPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [programas, setProgramas] = useState<ProgramaConAvance[] | null>(null);
  const [misProgramaIds, setMisProgramaIds] = useState<Set<number>>(new Set());
  const [inscribiendo, setInscribiendo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, [usuario]);

  async function cargar() {
    try {
      const listaProgramas = await api.get<Programa[]>("/programas");
      const conAvance = await Promise.all(
        listaProgramas.map(async (p) => ({
          ...p,
          avance: await api.get<AvanceProgramaVoluntarios>(`/dashboard/programas/${p.id}`).catch(() => null),
        })),
      );
      setProgramas(conAvance);

      if (usuario) {
        const mias = await api.get<InscripcionVoluntario[]>("/voluntariado/mias");
        setMisProgramaIds(new Set(mias.map((i) => i.programaId)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los programas");
    }
  }

  async function inscribirse(programaId: number, nombrePrograma: string) {
    if (!usuario) {
      window.location.href = "/auth";
      return;
    }
    setInscribiendo(programaId);
    setError(null);
    try {
      await api.post("/voluntariado", { programaId });
      setMisProgramaIds((actual) => new Set(actual).add(programaId));
      toast.exito("¡Inscripción confirmada!", `Ya haces parte de ${nombrePrograma}`);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo completar la inscripción";
      setError(mensaje);
      toast.fallo("No se pudo completar la inscripción", mensaje);
    } finally {
      setInscribiendo(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Voluntariado"
        titulo="Súmate al"
        acento="voluntariado"
        descripcion="Inscríbete a un programa y sigue cuántos cupos faltan por llenar desde tu panel de seguimiento."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {error && <p className="mb-6 text-sm text-clay-600">{error}</p>}

        {!programas ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2">
            {programas.map((programa) => {
              const yaInscrito = misProgramaIds.has(programa.id);
              const cupoLleno = (programa.avance?.faltan ?? 1) <= 0;
              const Icono = iconoPrograma(programa.nombre);
              return (
                <StaggerItem key={programa.id} variants={staggerItem}>
                <Card
                  hover
                  className="flex h-full flex-col gap-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-royal-50">
                      <Icono className="h-4 w-4 text-royal-700" strokeWidth={2} />
                    </span>
                    <div>
                      <h2 className="font-serif text-lg font-medium text-ink-900">{programa.nombre}</h2>
                      <p className="mt-1 text-sm text-ink-500">{programa.descripcion}</p>
                    </div>
                  </div>
                  {programa.avance && (
                    <ProgressBar
                      porcentaje={programa.avance.porcentaje}
                      etiqueta={`${programa.avance.inscritos}/${programa.avance.cupo} voluntarios · faltan ${programa.avance.faltan}`}
                    />
                  )}
                  <Button
                    variante={yaInscrito ? "outline" : "primary"}
                    disabled={yaInscrito || cupoLleno}
                    cargando={inscribiendo === programa.id}
                    onClick={() => inscribirse(programa.id, programa.nombre)}
                  >
                    {yaInscrito ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Ya estás inscrito
                      </>
                    ) : cupoLleno ? (
                      "Cupo lleno"
                    ) : (
                      "Inscribirme"
                    )}
                  </Button>
                </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}
