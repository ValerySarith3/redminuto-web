import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, ChevronDown, Clock, HandCoins, HandHeart, LifeBuoy, Megaphone, type LucideIcon } from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { PageHeader } from "../../components/PageHeader";
import { useCountUp } from "../../lib/useCountUp";
import { ETIQUETAS_CANAL, ETIQUETAS_TIPO_APOYO, formatoFechaActividad, type CambioEstado, type CanalDonacion, type TipoApoyo } from "../../types";
import { LineaDeTiempo } from "../../components/LineaDeTiempo";
import { Reveal, StaggerGroup, StaggerItem, staggerItem } from "../../components/Reveal";

interface ResumenDonacion {
  id: number;
  numeroComprobante?: string;
  monto: number;
  canal: CanalDonacion;
  estado: string;
  creadoEn: string;
  campana: { id: number; titulo: string; avance: { porcentaje: number; recaudado: number; meta: number } | null };
  historial: CambioEstado[];
}

interface ResumenInscripcion {
  id: number;
  estado: string;
  creadoEn: string;
  programa: { id: number; nombre: string; avance: { porcentaje: number; inscritos: number; cupo: number } | null };
  actividad: {
    titulo: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    lugar: string;
    finalizaEn: string;
  } | null;
  certificadoDisponible: boolean;
  historial: CambioEstado[];
}

interface Novedad {
  id: number;
  titulo: string;
  contenido: string;
  creadoEn: string;
  campana: { id: number; titulo: string };
}

interface ResumenSolicitud {
  id: number;
  descripcion: string;
  tipoApoyo: TipoApoyo;
  estado: string;
  creadoEn: string;
  programa: { id: number; nombre: string };
  historial: CambioEstado[];
}

interface Resumen {
  donaciones: ResumenDonacion[];
  inscripciones: ResumenInscripcion[];
  solicitudes: ResumenSolicitud[];
  novedades: Novedad[];
}

const formatoFechaNovedad = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

export function DashboardPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abiertas, setAbiertas] = useState<Set<SeccionId>>(new Set());

  function alternar(id: SeccionId) {
    setAbiertas((actual) => {
      const nuevas = new Set(actual);
      if (nuevas.has(id)) nuevas.delete(id);
      else nuevas.add(id);
      return nuevas;
    });
  }

  // Desde las cifras de arriba: abre la sección y baja hasta ella.
  function irA(id: SeccionId) {
    setAbiertas((actual) => new Set(actual).add(id));
    requestAnimationFrame(() =>
      document.getElementById(`seccion-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  useEffect(() => {
    api
      .get<Resumen>("/dashboard/mio")
      .then(setResumen)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar tu seguimiento"));
  }, []);

  if (error) return <p className="mx-auto max-w-6xl px-6 py-10 text-sm text-clay-600">{error}</p>;

  if (!resumen)
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );

  const sinActividad =
    resumen.donaciones.length === 0 && resumen.inscripciones.length === 0 && resumen.solicitudes.length === 0;
  const totalDonado = resumen.donaciones
    .filter((d) => d.estado === "COMPLETADA")
    .reduce((sum, d) => sum + d.monto, 0);
  const certificadosListos = resumen.inscripciones.filter((i) => i.certificadoDisponible).length;
  const solicitudesAbiertas = resumen.solicitudes.filter((s) => s.estado === "PENDIENTE" || s.estado === "EN_REVISION").length;
  const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

  return (
    <div>
      <PageHeader
        eyebrow="Panel personal"
        titulo="Mi"
        acento="seguimiento"
        descripcion="El avance real de cada aporte, inscripción y solicitud que has hecho."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal className="mb-8 grid overflow-hidden grid-cols-1 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-cream-50 shadow-sm shadow-royal-900/[0.03] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat
            valor={totalDonado}
            etiqueta="Total donado"
            prefijo="$"
            onClick={resumen.donaciones.length > 0 ? () => irA("donaciones") : undefined}
          />
          <Stat
            valor={resumen.inscripciones.length}
            etiqueta="Programas de voluntariado"
            onClick={resumen.inscripciones.length > 0 ? () => irA("voluntariado") : undefined}
          />
          <Stat
            valor={resumen.solicitudes.length}
            etiqueta="Solicitudes de ayuda"
            onClick={resumen.solicitudes.length > 0 ? () => irA("solicitudes") : undefined}
          />
        </Reveal>

        {sinActividad && (
          <Card className="text-center text-ink-500">
            Todavía no has donado, ni te has inscrito como voluntario, ni solicitado ayuda. Explora los programas
            para empezar.
          </Card>
        )}

        {resumen.donaciones.length > 0 && (
          <Seccion
            id="donaciones"
            titulo="Mis donaciones"
            icono={HandCoins}
            resumen={`${plural(resumen.donaciones.length, "donación", "donaciones")} · $${totalDonado.toLocaleString("es-CO")}`}
            abierta={abiertas.has("donaciones")}
            onToggle={() => alternar("donaciones")}
          >
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {resumen.donaciones.map((d) => (
                <StaggerItem key={d.id} variants={staggerItem}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-800">{d.campana.titulo}</span>
                    <Badge>{d.estado}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    Aportaste ${d.monto.toLocaleString("es-CO")} · {ETIQUETAS_CANAL[d.canal] ?? d.canal}
                  </p>
                  {d.numeroComprobante && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                      Comprobante {d.numeroComprobante}
                    </p>
                  )}
                  {d.campana.avance && (
                    <div className="mt-3">
                      <ProgressBar
                        porcentaje={d.campana.avance.porcentaje}
                        etiqueta={`$${d.campana.avance.recaudado.toLocaleString("es-CO")} de $${d.campana.avance.meta.toLocaleString("es-CO")}`}
                      />
                    </div>
                  )}
                  <LineaDeTiempo historial={d.historial} />
                </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Seccion>
        )}

        {resumen.donaciones.length > 0 && (
          <Seccion
            id="novedades"
            titulo="Novedades de las campañas que apoyas"
            icono={Megaphone}
            resumen={
              resumen.novedades.length > 0
                ? plural(resumen.novedades.length, "novedad publicada", "novedades publicadas")
                : "Aún no hay novedades"
            }
            abierta={abiertas.has("novedades")}
            onToggle={() => alternar("novedades")}
          >
            <p className="mb-4 text-sm text-ink-500">Lo que se ha logrado con los aportes, contado por el equipo de Casa Minuto de Dios.</p>
            {resumen.novedades.length === 0 ? (
              <Card className="text-center text-sm text-ink-500">
                Aún no hay novedades publicadas. Aquí verás en qué se convierte tu aporte.
              </Card>
            ) : (
              <StaggerGroup className="space-y-3">
                {resumen.novedades.map((n) => (
                  <StaggerItem key={n.id} variants={staggerItem}>
                    <Card className="flex gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-600">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-royal-600">
                          {n.campana.titulo} · {formatoFechaNovedad.format(new Date(n.creadoEn))}
                        </p>
                        <p className="mt-1 font-semibold text-ink-800">{n.titulo}</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{n.contenido}</p>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </Seccion>
        )}

        {resumen.inscripciones.length > 0 && (
          <Seccion
            id="voluntariado"
            titulo="Mi voluntariado"
            icono={HandHeart}
            resumen={plural(resumen.inscripciones.length, "inscripción", "inscripciones")}
            destacado={certificadosListos > 0 ? plural(certificadosListos, "certificado listo", "certificados listos") : undefined}
            abierta={abiertas.has("voluntariado")}
            onToggle={() => alternar("voluntariado")}
          >
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {resumen.inscripciones.map((i) => (
                <StaggerItem key={i.id} variants={staggerItem}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-800">{i.programa.nombre}</span>
                    <Badge>{i.estado}</Badge>
                  </div>
                  {i.actividad && (
                    <p className="mt-1 text-sm text-ink-500">
                      {i.actividad.titulo} · {formatoFechaActividad(i.actividad.fecha)} · {i.actividad.horaInicio}–
                      {i.actividad.horaFin} · {i.actividad.lugar}
                    </p>
                  )}
                  {i.programa.avance && (
                    <div className="mt-3">
                      <ProgressBar
                        porcentaje={i.programa.avance.porcentaje}
                        etiqueta={`${i.programa.avance.inscritos}/${i.programa.avance.cupo} voluntarios`}
                      />
                    </div>
                  )}
                  <CertificadoVoluntariado inscripcion={i} />
                  <LineaDeTiempo historial={i.historial} />
                </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Seccion>
        )}

        {resumen.solicitudes.length > 0 && (
          <Seccion
            id="solicitudes"
            titulo="Mis solicitudes de ayuda"
            icono={LifeBuoy}
            resumen={`${plural(resumen.solicitudes.length, "solicitud", "solicitudes")}${solicitudesAbiertas > 0 ? ` · ${solicitudesAbiertas} en trámite` : ""}`}
            abierta={abiertas.has("solicitudes")}
            onToggle={() => alternar("solicitudes")}
          >
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {resumen.solicitudes.map((s) => (
                <StaggerItem key={s.id} variants={staggerItem}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-800">{s.programa.nombre}</span>
                    <Badge>{s.estado}</Badge>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                    {ETIQUETAS_TIPO_APOYO[s.tipoApoyo]}
                  </p>
                  <p className="mt-2 text-sm text-ink-500">{s.descripcion}</p>
                  <LineaDeTiempo historial={s.historial} />
                </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Seccion>
        )}
      </div>
    </div>
  );
}

function Stat({
  valor,
  etiqueta,
  prefijo = "",
  onClick,
}: {
  valor: string | number;
  etiqueta: string;
  prefijo?: string;
  onClick?: () => void;
}) {
  const esNumero = typeof valor === "number";
  const animado = useCountUp(esNumero ? valor : 0);
  const Contenedor = onClick ? "button" : "div";
  return (
    <Contenedor
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={onClick ? "Ver detalle" : undefined}
      className={`px-2 py-6 text-center first:pl-0 sm:px-8 sm:text-left sm:first:pl-0 ${
        onClick ? "cursor-pointer transition-colors hover:bg-royal-50/60" : ""
      }`}
    >
      <p className="font-serif text-3xl font-medium tabular-nums text-royal-700">
        {esNumero ? `${prefijo}${Math.round(animado).toLocaleString("es-CO")}` : valor}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-500">{etiqueta}</p>
    </Contenedor>
  );
}

const formatoFinJornada = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" });

function CertificadoVoluntariado({ inscripcion }: { inscripcion: ResumenInscripcion }) {
  const toast = useToast();
  const [descargando, setDescargando] = useState(false);
  const { actividad, estado } = inscripcion;
  if (!actividad || estado === "RECHAZADA") return null;

  async function descargar() {
    setDescargando(true);
    try {
      await api.descargar(`/voluntariado/${inscripcion.id}/certificado`, `certificado-voluntariado-${inscripcion.id}.pdf`);
    } catch (e) {
      toast.fallo("No se pudo descargar el certificado", e instanceof Error ? e.message : undefined);
    } finally {
      setDescargando(false);
    }
  }

  if (inscripcion.certificadoDisponible) {
    return (
      <Button variante="accent" className="mt-4 w-full" cargando={descargando} onClick={descargar}>
        <Award className="h-4 w-4" /> Descargar certificado (PDF)
      </Button>
    );
  }

  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-ink-100/70 px-3 py-2 text-xs text-ink-500">
      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {estado === "ACEPTADA"
        ? `Tu certificado se habilita cuando termine la jornada (${formatoFinJornada.format(new Date(actividad.finalizaEn))}).`
        : "Tu certificado se habilita cuando tu inscripción sea aceptada y termine la jornada."}
    </p>
  );
}

type SeccionId = "donaciones" | "novedades" | "voluntariado" | "solicitudes";

// Sección desplegable: el encabezado resume lo que hay dentro para saberlo sin abrirla.
function Seccion({
  id,
  titulo,
  icono: Icono,
  resumen,
  destacado,
  abierta,
  onToggle,
  children,
}: {
  id: SeccionId;
  titulo: string;
  icono: LucideIcon;
  resumen: string;
  destacado?: string;
  abierta: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      id={`seccion-${id}`}
      className={`mb-4 scroll-mt-24 overflow-hidden rounded-2xl border bg-cream-50 transition-all duration-300 ${
        abierta
          ? "border-royal-200 shadow-lg shadow-royal-900/[0.06]"
          : "border-ink-200 hover:border-royal-200 hover:shadow-md hover:shadow-royal-900/[0.04]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={`contenido-${id}`}
        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
            abierta ? "bg-royal-600 text-white" : "bg-royal-50 text-royal-600"
          }`}
        >
          <Icono className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-lg font-medium text-ink-900">{titulo}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink-500">
            {resumen}
            {destacado && (
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-600">{destacado}</span>
            )}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${abierta ? "rotate-180 text-royal-600" : "text-ink-400"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            id={`contenido-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-ink-100 px-5 pb-6 pt-5 sm:px-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
