import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/PageHeader";
import { useCountUp } from "../../lib/useCountUp";
import { ETIQUETAS_TIPO_APOYO, type TipoApoyo } from "../../types";
import { Reveal, StaggerGroup, StaggerItem, staggerItem } from "../../components/Reveal";

interface ResumenDonacion {
  id: number;
  numeroComprobante?: string;
  monto: number;
  canal: string;
  estado: string;
  creadoEn: string;
  campana: { id: number; titulo: string; avance: { porcentaje: number; recaudado: number; meta: number } | null };
}

interface ResumenInscripcion {
  id: number;
  estado: string;
  creadoEn: string;
  programa: { id: number; nombre: string; avance: { porcentaje: number; inscritos: number; cupo: number } | null };
}

interface ResumenSolicitud {
  id: number;
  descripcion: string;
  tipoApoyo: TipoApoyo;
  estado: string;
  creadoEn: string;
  programa: { id: number; nombre: string };
}

interface Resumen {
  donaciones: ResumenDonacion[];
  inscripciones: ResumenInscripcion[];
  solicitudes: ResumenSolicitud[];
}

export function DashboardPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const totalDonado = resumen.donaciones.reduce((sum, d) => sum + d.monto, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Panel personal"
        titulo="Mi"
        acento="seguimiento"
        descripcion="El avance real de cada aporte, inscripción y solicitud que has hecho."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal className="mb-12 grid grid-cols-1 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-cream-50 shadow-sm shadow-royal-900/[0.03] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat valor={totalDonado} etiqueta="Total donado" prefijo="$" />
          <Stat valor={resumen.inscripciones.length} etiqueta="Programas de voluntariado" />
          <Stat valor={resumen.solicitudes.length} etiqueta="Solicitudes de ayuda" />
        </Reveal>

        {sinActividad && (
          <Card className="text-center text-ink-500">
            Todavía no has donado, ni te has inscrito como voluntario, ni solicitado ayuda. Explora los programas
            para empezar.
          </Card>
        )}

        {resumen.donaciones.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 font-serif text-xl font-medium text-ink-900">Mis donaciones</h2>
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {resumen.donaciones.map((d) => (
                <StaggerItem key={d.id} variants={staggerItem}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-800">{d.campana.titulo}</span>
                    <Badge>{d.estado}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    Aportaste ${d.monto.toLocaleString("es-CO")} · {d.canal}
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
                </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {resumen.inscripciones.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 font-serif text-xl font-medium text-ink-900">Mi voluntariado</h2>
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {resumen.inscripciones.map((i) => (
                <StaggerItem key={i.id} variants={staggerItem}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-800">{i.programa.nombre}</span>
                    <Badge>{i.estado}</Badge>
                  </div>
                  {i.programa.avance && (
                    <div className="mt-3">
                      <ProgressBar
                        porcentaje={i.programa.avance.porcentaje}
                        etiqueta={`${i.programa.avance.inscritos}/${i.programa.avance.cupo} voluntarios`}
                      />
                    </div>
                  )}
                </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {resumen.solicitudes.length > 0 && (
          <section>
            <h2 className="mb-4 font-serif text-xl font-medium text-ink-900">Mis solicitudes de ayuda</h2>
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
                </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ valor, etiqueta, prefijo = "" }: { valor: string | number; etiqueta: string; prefijo?: string }) {
  const esNumero = typeof valor === "number";
  const animado = useCountUp(esNumero ? valor : 0);
  return (
    <div className="px-2 py-6 text-center first:pl-0 sm:px-8 sm:text-left sm:first:pl-0">
      <p className="font-serif text-3xl font-medium tabular-nums text-royal-700">
        {esNumero ? `${prefijo}${Math.round(animado).toLocaleString("es-CO")}` : valor}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-500">{etiqueta}</p>
    </div>
  );
}
