import { useEffect, useState, type ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import { api } from "../../lib/api";
import {
  ETIQUETAS_CANAL,
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO_APOYO,
  formatoFechaActividad,
  type Donacion,
  type InscripcionVoluntario,
  type SolicitudBeneficiario,
} from "../../types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { LogoCompleto } from "../../components/LogoMark";
import { pesos } from "./graficos";
import { aISO, barrasCanal, barrasTipoApoyo, queryRango, type Resumen } from "./reportes";

interface Datos {
  resumen: Resumen;
  donaciones: Donacion[];
  inscripciones: InscripcionVoluntario[];
  solicitudes: SolicitudBeneficiario[];
}

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
const formatoFechaLarga = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

function dentroDelRango(fecha: string, desde: string, hasta: string) {
  const dia = aISO(new Date(fecha));
  return (!desde || dia >= desde) && (!hasta || dia <= hasta);
}

// Reporte de gestión imprimible (Imprimir → "Guardar como PDF") y exportable a Excel (CSV).
export function AdminReporte() {
  const toast = useToast();
  const hoy = new Date();
  const [desde, setDesde] = useState(aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
  const [hasta, setHasta] = useState(aISO(hoy));
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<string | null>(null);

  useEffect(() => {
    if (desde && hasta && desde > hasta) {
      setError("La fecha inicial no puede ser posterior a la final.");
      return;
    }
    setError(null);
    setDatos(null);
    Promise.all([
      api.get<Resumen>(`/reportes/resumen${queryRango({ desde, hasta })}`),
      api.get<Donacion[]>("/donaciones"),
      api.get<InscripcionVoluntario[]>("/voluntariado"),
      api.get<SolicitudBeneficiario[]>("/beneficiarios"),
    ])
      .then(([resumen, donaciones, inscripciones, solicitudes]) =>
        setDatos({
          resumen,
          donaciones: donaciones.filter((d) => dentroDelRango(d.creadoEn, desde, hasta)),
          inscripciones: inscripciones.filter((i) => dentroDelRango(i.creadoEn, desde, hasta)),
          solicitudes: solicitudes.filter((s) => dentroDelRango(s.creadoEn, desde, hasta)),
        }),
      )
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo generar el reporte"));
  }, [desde, hasta]);

  async function descargarCsv(tipo: "donaciones" | "inscripciones" | "solicitudes") {
    setDescargando(tipo);
    try {
      await api.descargar(`/reportes/exportar/${tipo}${queryRango({ desde, hasta })}`, `redminuto-${tipo}-${desde}-a-${hasta}.csv`);
    } catch (e) {
      toast.fallo("No se pudo descargar el archivo", e instanceof Error ? e.message : undefined);
    } finally {
      setDescargando(null);
    }
  }

  const periodoTexto = `${formatoFechaLarga.format(new Date(`${desde}T00:00:00`))} – ${formatoFechaLarga.format(new Date(`${hasta}T00:00:00`))}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input label="Desde" type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="w-40">
            <Input label="Hasta" type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variante="outline" cargando={descargando === "donaciones"} onClick={() => descargarCsv("donaciones")}>
            <Download className="h-4 w-4" /> Donaciones
          </Button>
          <Button variante="outline" cargando={descargando === "inscripciones"} onClick={() => descargarCsv("inscripciones")}>
            <Download className="h-4 w-4" /> Voluntariado
          </Button>
          <Button variante="outline" cargando={descargando === "solicitudes"} onClick={() => descargarCsv("solicitudes")}>
            <Download className="h-4 w-4" /> Solicitudes
          </Button>
          <Button variante="accent" disabled={!datos} onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>
      <p className="text-xs text-ink-400 print:hidden">
        Los botones de descarga generan archivos CSV que abren directamente en Excel. Para un PDF, usa “Imprimir / PDF” y
        elige “Guardar como PDF”.
      </p>

      {error && <p className="text-sm text-clay-600">{error}</p>}

      {!datos ? (
        !error && <Skeleton className="h-[32rem]" />
      ) : (
        <article className="rounded-2xl border border-ink-200 bg-white p-8 text-ink-800 print:rounded-none print:border-0 print:p-0">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-royal-700 pb-5">
            <div className="flex items-center gap-3">
              <LogoCompleto className="h-12 w-auto" />
              <div className="border-l border-ink-200 pl-3">
                <p className="font-serif text-xl font-semibold text-royal-800">Reporte de gestión</p>
                <p className="text-sm text-ink-500">Casa Minuto de Dios · Corporación Minuto de Dios</p>
              </div>
            </div>
            <div className="text-sm sm:text-right">
              <p className="font-semibold text-ink-700">Periodo: {periodoTexto}</p>
              <p className="text-ink-400">Generado el {formatoFechaLarga.format(new Date())}</p>
            </div>
          </header>

          <Seccion numero={1} titulo="Resumen del periodo">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Cifra etiqueta="Recaudo confirmado" valor={pesos(datos.resumen.kpis.totalRecaudado)} />
              <Cifra
                etiqueta="Pagos por confirmar"
                valor={`${datos.resumen.kpis.pendientesPorConfirmar.cantidad} · ${pesos(datos.resumen.kpis.pendientesPorConfirmar.monto)}`}
              />
              <Cifra etiqueta="Inscripciones" valor={String(datos.resumen.kpis.inscripciones)} />
              <Cifra
                etiqueta="Solicitudes (abiertas)"
                valor={`${datos.resumen.kpis.solicitudes} (${datos.resumen.kpis.solicitudesAbiertas})`}
              />
            </div>
          </Seccion>

          <Seccion numero={2} titulo="Avance de campañas (histórico)">
            <Tabla
              encabezados={["Campaña", "Programa", "Meta", "Recaudado", "Avance"]}
              alinearDerecha={[2, 3, 4]}
              filas={datos.resumen.campanas.map((c) => [c.titulo, c.programa, pesos(c.meta), pesos(c.recaudado), `${c.porcentaje}%`])}
            />
          </Seccion>

          <Seccion numero={3} titulo="Donaciones">
            <div className="grid gap-6 sm:grid-cols-2">
              <Tabla
                encabezados={["Estado", "Cantidad"]}
                alinearDerecha={[1]}
                filas={datos.resumen.donacionesPorEstado.map((e) => [ETIQUETAS_ESTADO[e.clave] ?? e.clave, e.total])}
              />
              <Tabla
                encabezados={["Canal", "Recaudo confirmado"]}
                alinearDerecha={[1]}
                filas={barrasCanal(datos.resumen.recaudoPorCanal).map((c) => [c.etiqueta, pesos(c.valor)])}
              />
            </div>
            <Detalle titulo={`Detalle (${datos.donaciones.length})`}>
              <Tabla
                encabezados={["Comprobante", "Fecha", "Donante", "Campaña", "Canal", "Monto", "Estado"]}
                alinearDerecha={[5]}
                vacio="Sin donaciones en el periodo."
                filas={datos.donaciones.map((d) => [
                  d.numeroComprobante ?? d.id,
                  formatoFecha.format(new Date(d.creadoEn)),
                  d.donante?.nombre ?? "—",
                  d.campana?.titulo ?? "—",
                  ETIQUETAS_CANAL[d.canal].replace(/ \(.*\)/, ""),
                  pesos(Number(d.monto)),
                  ETIQUETAS_ESTADO[d.estado],
                ])}
              />
            </Detalle>
          </Seccion>

          <Seccion numero={4} titulo="Voluntariado">
            <Tabla
              encabezados={["Estado de inscripción", "Cantidad"]}
              alinearDerecha={[1]}
              filas={datos.resumen.inscripcionesPorEstado.map((e) => [ETIQUETAS_ESTADO[e.clave] ?? e.clave, e.total])}
            />
            {datos.resumen.proximasActividades.length > 0 && (
              <Detalle titulo="Próximas jornadas">
                <Tabla
                  encabezados={["Actividad", "Programa", "Fecha", "Horario", "Lugar", "Inscritos / cupo"]}
                  alinearDerecha={[5]}
                  filas={datos.resumen.proximasActividades.map((a) => [
                    a.titulo,
                    a.programa,
                    formatoFechaActividad(a.fecha),
                    `${a.horaInicio}–${a.horaFin}`,
                    a.lugar,
                    `${a.inscritos} / ${a.cupo}`,
                  ])}
                />
              </Detalle>
            )}
            <Detalle titulo={`Detalle de inscripciones (${datos.inscripciones.length})`}>
              <Tabla
                encabezados={["Fecha", "Voluntario", "Programa", "Actividad", "Estado"]}
                vacio="Sin inscripciones en el periodo."
                filas={datos.inscripciones.map((i) => [
                  formatoFecha.format(new Date(i.creadoEn)),
                  i.voluntario?.nombre ?? "—",
                  i.programa?.nombre ?? "—",
                  i.actividad ? `${i.actividad.titulo} (${formatoFechaActividad(i.actividad.fecha)})` : "Programa general",
                  ETIQUETAS_ESTADO[i.estado],
                ])}
              />
            </Detalle>
          </Seccion>

          <Seccion numero={5} titulo="Solicitudes de ayuda">
            <div className="grid gap-6 sm:grid-cols-2">
              <Tabla
                encabezados={["Estado", "Cantidad"]}
                alinearDerecha={[1]}
                filas={datos.resumen.solicitudesPorEstado.map((e) => [ETIQUETAS_ESTADO[e.clave] ?? e.clave, e.total])}
              />
              <Tabla
                encabezados={["Tipo de apoyo", "Cantidad"]}
                alinearDerecha={[1]}
                filas={barrasTipoApoyo(datos.resumen.solicitudesPorTipo).map((t) => [t.etiqueta, t.valor])}
              />
            </div>
            <Detalle titulo={`Detalle (${datos.solicitudes.length})`}>
              <Tabla
                encabezados={["Fecha", "Solicitante", "Ciudad", "Programa", "Tipo de apoyo", "Estado"]}
                vacio="Sin solicitudes en el periodo."
                filas={datos.solicitudes.map((s) => [
                  formatoFecha.format(new Date(s.creadoEn)),
                  s.nombreCompleto,
                  s.ciudad,
                  s.programa?.nombre ?? "—",
                  ETIQUETAS_TIPO_APOYO[s.tipoApoyo],
                  ETIQUETAS_ESTADO[s.estado],
                ])}
              />
            </Detalle>
          </Seccion>

          <footer className="mt-10 border-t border-ink-200 pt-4 text-xs text-ink-400">
            Documento de uso interno. Contiene datos personales protegidos por la Ley 1581 de 2012; no lo compartas fuera
            de Casa Minuto de Dios.
          </footer>
        </article>
      )}
    </div>
  );
}

function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid-page">
      <h3 className="mb-4 font-serif text-lg font-medium text-royal-800">
        {numero}. {titulo}
      </h3>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Detalle({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{titulo}</p>
      {children}
    </div>
  );
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl border border-ink-200 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{etiqueta}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{valor}</p>
    </div>
  );
}

function Tabla({
  encabezados,
  filas,
  alinearDerecha = [],
  vacio = "Sin datos.",
}: {
  encabezados: string[];
  filas: (string | number)[][];
  alinearDerecha?: number[];
  vacio?: string;
}) {
  if (filas.length === 0) return <p className="text-sm text-ink-400">{vacio}</p>;
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-300 text-left">
            {encabezados.map((h, i) => (
              <th
                key={h}
                className={`px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500 ${
                  alinearDerecha.includes(i) ? "text-right" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, f) => (
            <tr key={f} className="border-b border-ink-100 break-inside-avoid">
              {fila.map((celda, i) => (
                <td key={i} className={`px-2 py-1.5 ${alinearDerecha.includes(i) ? "text-right tabular-nums" : ""}`}>
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
