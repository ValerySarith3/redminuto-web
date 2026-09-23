import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Gift, HeartHandshake, LifeBuoy, ShieldCheck, Users } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { iconoPrograma } from "../../lib/programIcons";
import type { AvanceCampana, AvanceProgramaVoluntarios, Campana, Donacion, Programa } from "../../types";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { BrandImage } from "../../components/ui/BrandImage";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { DonarModal } from "../../components/DonarModal";
import { TestimoniosSlider } from "../../components/TestimoniosSlider";
import { Reveal, StaggerGroup, StaggerItem, staggerItem } from "../../components/Reveal";

interface ProgramaConDatos extends Programa {
  avanceVoluntarios: AvanceProgramaVoluntarios | null;
  campanas: (Campana & { avance: AvanceCampana | null })[];
}

export function ProgramasPage() {
  const { usuario } = useAuth();
  const [programas, setProgramas] = useState<ProgramaConDatos[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [campanaParaDonar, setCampanaParaDonar] = useState<Campana | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setError(null);
    try {
      const [listaProgramas, listaCampanas] = await Promise.all([
        api.get<Programa[]>("/programas"),
        api.get<Campana[]>("/campanas"),
      ]);

      const conDatos = await Promise.all(
        listaProgramas.map(async (programa) => {
          const avanceVoluntarios = await api
            .get<AvanceProgramaVoluntarios>(`/dashboard/programas/${programa.id}`)
            .catch(() => null);

          const campanasDelPrograma = listaCampanas.filter((c) => c.programaId === programa.id);
          const campanasConAvance = await Promise.all(
            campanasDelPrograma.map(async (campana) => ({
              ...campana,
              avance: await api.get<AvanceCampana>(`/dashboard/campanas/${campana.id}`).catch(() => null),
            })),
          );

          return { ...programa, avanceVoluntarios, campanas: campanasConAvance };
        }),
      );

      setProgramas(conDatos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los programas");
    }
  }

  function handleDonar(campana: Campana) {
    if (!usuario) {
      window.location.href = "/auth";
      return;
    }
    setCampanaParaDonar(campana);
  }

  function handleDonacionCreada(donacion: Donacion) {
    setProgramas(
      (actual) =>
        actual?.map((p) => ({
          ...p,
          campanas: p.campanas.map((c) =>
            c.id === donacion.campanaId && c.avance
              ? {
                  ...c,
                  avance: {
                    ...c.avance,
                    recaudado: c.avance.recaudado + Number(donacion.monto),
                    porcentaje: Math.min(100, ((c.avance.recaudado + Number(donacion.monto)) / c.avance.meta) * 100),
                  },
                }
              : c,
          ),
        })) ?? actual,
    );
  }

  const totalRecaudado = programas?.flatMap((p) => p.campanas).reduce((sum, c) => sum + (c.avance?.recaudado ?? 0), 0) ?? 0;
  const totalVoluntarios = programas?.reduce((sum, p) => sum + (p.avanceVoluntarios?.inscritos ?? 0), 0) ?? 0;
  const totalProgramas = programas?.length ?? 0;
  const navigate = useNavigate();

  const acciones = [
    {
      label: "Donar",
      icono: Gift,
      onClick: () => document.getElementById("programas")?.scrollIntoView({ behavior: "smooth" }),
    },
    { label: "Voluntariado", icono: Users, onClick: () => navigate("/voluntariado") },
    { label: "Solicitar ayuda", icono: LifeBuoy, onClick: () => navigate("/beneficiarios") },
  ];

  return (
    <div>
      <section className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-royal-950 text-white">
        <img
          src="/images/slide-voluntariado.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.15]"
          style={{ animation: "ken-burns 24s ease-out infinite alternate" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-royal-950/95 via-royal-950/55 to-royal-950/90" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-royal-950 via-transparent to-transparent" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 animate-blob rounded-full bg-gold-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-40 h-72 w-72 animate-blob rounded-full bg-royal-500/20 blur-3xl [animation-delay:3s]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pt-28 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
              <div className="flex -space-x-2">
                {["V", "D", "M", "A"].map((letra) => (
                  <span
                    key={letra}
                    className="grid h-6 w-6 place-items-center rounded-full border-2 border-royal-950 bg-gradient-to-br from-gold-300 to-gold-500 text-[10px] font-bold text-royal-900"
                  >
                    {letra}
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-white/90">
                +2.000 personas ya confían en Casa Minuto de Dios
              </span>
            </div>
          </Reveal>

          <Reveal retraso={0.1}>
            <h1 className="mt-8 max-w-3xl font-serif text-5xl font-medium leading-[1.05] sm:text-6xl">
              Tu ayuda, con <span className="text-gradient-gold font-serif-accent">impacto real</span> y transparente
            </h1>
          </Reveal>
          <Reveal retraso={0.18}>
            <p className="mt-6 max-w-xl text-royal-100/80">
              Dona, hazte voluntario o solicita ayuda — y sigue el avance de cada aporte desde tu panel personal.
            </p>
          </Reveal>

          <div className="mt-10 flex w-full max-w-5xl items-center justify-center gap-6">
            <Reveal direccion="right" retraso={0.3} className="hidden w-60 shrink-0 xl:block">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-left shadow-xl shadow-royal-950/30 backdrop-blur-md">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" /> Seguimiento en vivo
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/85">
                  <p>${Math.round(totalRecaudado).toLocaleString("es-CO")} recaudados</p>
                  <p>{totalVoluntarios} voluntarios activos</p>
                  <p>{totalProgramas} programas abiertos</p>
                </div>
              </div>
            </Reveal>

            <Reveal retraso={0.26} className="w-full max-w-xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-royal-950/40 backdrop-blur-xl sm:flex-row sm:items-center">
                <div className="grid flex-1 grid-cols-3 gap-1 rounded-xl bg-black/10 p-1">
                  {acciones.map((accion) => (
                    <button
                      key={accion.label}
                      type="button"
                      onClick={accion.onClick}
                      className="flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:text-xs"
                    >
                      <accion.icono className="h-4 w-4" />
                      {accion.label}
                    </button>
                  ))}
                </div>
                <Button
                  variante="accent"
                  className="shrink-0"
                  onClick={() => document.getElementById("programas")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Ver programas <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Reveal>

            <Reveal direccion="left" retraso={0.3} className="hidden w-60 shrink-0 xl:block">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-left shadow-xl shadow-royal-950/30 backdrop-blur-md">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold-300">
                  <ShieldCheck className="h-3 w-3" /> Confianza
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-white/85">
                  <li>Pagos sandbox seguros</li>
                  <li>Trazabilidad por programa</li>
                  <li>Datos protegidos (Ley 1581)</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-black/15 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-white/70">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["P1", "P2", "P3"].map((p) => (
                  <span key={p} className="h-6 w-6 rounded-full border-2 border-royal-950 bg-royal-700" />
                ))}
              </div>
              <span>Confían en nosotros +2.000 donantes y voluntarios</span>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("formas")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Nuestra historia <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
            </button>
            <span className="hidden items-center gap-1.5 sm:flex">
              <HeartHandshake className="h-3.5 w-3.5 text-gold-300" /> Corporación Minuto de Dios · Alianza oficial
            </span>
          </div>
        </div>
      </section>

      <section id="formas" className="scroll-mt-20 border-b border-ink-200 bg-cream-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-royal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> Tres formas de ayudar
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
              Elige cómo quieres <span className="font-serif-accent text-royal-700">sumar</span>
            </h2>
          </Reveal>

          <div className="mt-16 space-y-20">
            {[
              {
                src: "/images/slide-donar.jpg",
                alt: "Una mano que ayuda a otra a levantarse",
                titulo: "Dona a un programa",
                texto:
                  "Elige la campaña que quieres apoyar y realiza tu aporte mediante una pasarela de pago en modo sandbox. Recibes un comprobante y puedes seguir el avance de la meta en tiempo real.",
                onIr: () => document.getElementById("programas")?.scrollIntoView({ behavior: "smooth" }),
                cta: "Ver programas",
                lado: "izquierda" as const,
              },
              {
                src: "/images/slide-voluntariado.jpg",
                alt: "Grupo de personas uniendo sus manos",
                titulo: "Hazte voluntario",
                texto:
                  "Inscríbete a una actividad de la sede con confirmación inmediata de cupo. Consulta tu historial de participación desde tu panel de seguimiento.",
                onIr: () => navigate("/voluntariado"),
                cta: "Ver actividades",
                lado: "derecha" as const,
              },
              {
                src: "/images/slide-ayuda.jpg",
                alt: "Dos manos que se buscan en el aire",
                titulo: "Solicita ayuda",
                texto:
                  "Registra formalmente tu solicitud indicando el tipo de apoyo que necesitas y consulta su estado — recibida, en proceso o atendida — sin depender de llamadas o mensajes.",
                onIr: () => navigate("/beneficiarios"),
                cta: "Solicitar ahora",
                lado: "izquierda" as const,
              },
            ].map((forma) => (
              <div key={forma.titulo} className="grid items-center gap-10 lg:grid-cols-2">
                <Reveal
                  direccion={forma.lado === "izquierda" ? "right" : "left"}
                  className={forma.lado === "derecha" ? "lg:order-2" : ""}
                >
                  <BrandImage src={forma.src} alt={forma.alt} tinte="royal" className="aspect-[4/3] w-full" />
                </Reveal>
                <Reveal
                  direccion={forma.lado === "izquierda" ? "left" : "right"}
                  className={forma.lado === "derecha" ? "lg:order-1" : ""}
                >
                  <h3 className="font-serif text-2xl font-medium text-ink-900 sm:text-3xl">{forma.titulo}</h3>
                  <p className="mt-4 max-w-md text-ink-500">{forma.texto}</p>
                  <Button variante="outline" className="mt-6" onClick={forma.onIr}>
                    {forma.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-14 pt-20">
        <div id="programas" className="scroll-mt-24" />

        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-royal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> Programas activos
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
            El estado real de cada <span className="font-serif-accent text-royal-700">campaña</span>
          </h2>
        </Reveal>

        {error && <p className="mb-6 text-sm text-clay-600">{error}</p>}

        {!programas ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : programas.length === 0 ? (
          <Card className="text-center text-ink-500">Aún no hay programas registrados.</Card>
        ) : (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2">
            {programas.map((programa, index) => {
              const Icono = iconoPrograma(programa.nombre);
              return (
                <StaggerItem key={programa.id} variants={staggerItem}>
                <Card
                  hover
                  className="flex h-full flex-col gap-5 transition-transform duration-300 hover:-rotate-1"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-royal-50">
                        <Icono className="h-3.5 w-3.5 text-royal-700" strokeWidth={2} />
                      </span>
                    </div>
                    <h2 className="mt-2 font-serif text-lg font-medium text-ink-900">{programa.nombre}</h2>
                    <p className="mt-1 text-sm text-ink-500">{programa.descripcion}</p>
                  </div>

                  {programa.avanceVoluntarios && (
                    <ProgressBar
                      porcentaje={programa.avanceVoluntarios.porcentaje}
                      etiqueta={`Voluntarios: ${programa.avanceVoluntarios.inscritos}/${programa.avanceVoluntarios.cupo}`}
                    />
                  )}

                  {programa.campanas.length > 0 && (
                    <div className="space-y-3 border-t border-ink-200 pt-5">
                      {programa.campanas.map((campana) => (
                        <div key={campana.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-ink-800">{campana.titulo}</span>
                            <Button variante="outline" className="px-3 py-1 text-xs" onClick={() => handleDonar(campana)}>
                              Donar
                            </Button>
                          </div>
                          {campana.avance && (
                            <div className="mt-2">
                              <ProgressBar
                                compact
                                porcentaje={campana.avance.porcentaje}
                                etiqueta={`$${campana.avance.recaudado.toLocaleString("es-CO")} de $${campana.avance.meta.toLocaleString("es-CO")}`}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}

        <Reveal className="mt-16 border-t border-ink-200 pt-14">
          <TestimoniosSlider />
        </Reveal>
      </div>

      {campanaParaDonar && (
        <DonarModal
          campana={campanaParaDonar}
          onClose={() => setCampanaParaDonar(null)}
          onDonacionCreada={handleDonacionCreada}
        />
      )}
    </div>
  );
}
