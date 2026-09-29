import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RotateCcw, Search, ShieldAlert } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { queryRango } from "./reportes";

interface Evento {
  id: string;
  fecha: string;
  modulo: string;
  accion: string;
  exitoso: boolean;
  descripcion: string;
  afectado: { tipo: string; nombre: string } | null;
  informacionAnterior: Record<string, string> | null;
  informacionNueva: Record<string, string> | null;
  nota: string | null;
  ip: string | null;
  usuario: { nombre: string; email: string; rol: string } | null;
}

interface Pagina {
  total: number;
  pagina: number;
  paginas: number;
  registros: Evento[];
}

const MODULOS: Record<string, string> = {
  CUENTAS: "Cuentas y acceso",
  USUARIOS: "Gestión de usuarios",
  DONACIONES: "Donaciones",
  VOLUNTARIADO: "Voluntariado",
  SOLICITUDES: "Solicitudes de ayuda",
  PROGRAMAS: "Programas",
  CAMPANAS: "Campañas",
  ACTIVIDADES: "Actividades",
};

const ACCIONES: Record<string, string> = {
  INICIO_SESION: "Inicio de sesión",
  REGISTRO: "Registro de cuenta",
  CREAR: "Creación",
  EDITAR: "Edición",
  ELIMINAR: "Eliminación",
  CAMBIO_ESTADO: "Cambio de estado",
  CAMBIO_ROL: "Cambio de rol",
  CAMBIO_CONTRASENA: "Cambio de contraseña",
  ACTUALIZAR_DATOS: "Actualización de datos",
};

function tonoAccion(e: Evento) {
  if (!e.exitoso || e.accion === "ELIMINAR") return "bg-clay-100 text-clay-600 ring-clay-500/20";
  if (e.accion === "CAMBIO_ROL" || e.accion === "CAMBIO_CONTRASENA") return "bg-gold-100 text-gold-800 ring-gold-500/30";
  if (e.accion === "CREAR" || e.accion === "REGISTRO") return "bg-royal-50 text-royal-700 ring-royal-500/20";
  return "bg-ink-100 text-ink-600 ring-ink-300/40";
}

const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Bogota" });
const formatoHora = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Bogota" });

const filtrosVacios = { q: "", modulo: "", accion: "", resultado: "", desde: "", hasta: "" };
type Filtros = typeof filtrosVacios;

function queryFiltros(f: Filtros) {
  const base = queryRango({ desde: f.desde || undefined, hasta: f.hasta || undefined });
  const params = new URLSearchParams(base.slice(1));
  for (const clave of ["q", "modulo", "accion", "resultado"] as const) {
    if (f[clave].trim()) params.set(clave, f[clave].trim());
  }
  return params;
}

export function AdminLogCambios() {
  const toast = useToast();
  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<Pagina | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  // La búsqueda de texto espera a que se deje de escribir para no consultar en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      setFiltros((f) => (f.q === busqueda ? f : { ...f, q: busqueda }));
      setPagina(1);
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    let vigente = true;
    const params = queryFiltros(filtros);
    params.set("pagina", String(pagina));
    params.set("tamano", "25");
    setCargando(true);
    api
      .get<Pagina>(`/reportes/log-cambios?${params.toString()}`)
      .then((r) => vigente && (setDatos(r), setError(null)))
      .catch((e) => vigente && setError(e instanceof Error ? e.message : "No se pudo cargar el log de cambios"))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [filtros, pagina]);

  function cambiar(clave: keyof Filtros, valor: string) {
    setFiltros((f) => ({ ...f, [clave]: valor }));
    setPagina(1);
  }

  function limpiar() {
    setBusqueda("");
    setFiltros(filtrosVacios);
    setPagina(1);
  }

  async function exportar() {
    setExportando(true);
    try {
      const params = queryFiltros(filtros);
      params.set("formato", "csv");
      await api.descargar(`/reportes/log-cambios?${params.toString()}`, `redminuto-log-de-cambios-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      toast.fallo("No se pudo exportar el log de cambios", e instanceof Error ? e.message : undefined);
    } finally {
      setExportando(false);
    }
  }

  const hayFiltros = busqueda !== "" || Object.entries(filtros).some(([k, v]) => k !== "q" && v !== "");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink-900">Log de cambios</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Quién cambió qué y cuándo: la información que había antes y la que quedó después.
          </p>
        </div>
        <Button variante="outline" cargando={exportando} onClick={exportar}>
          <Download className="h-4 w-4" /> Exportar (Excel/CSV)
        </Button>
      </div>

      <section className="rounded-2xl border border-ink-200 bg-cream-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por quién lo hizo, registro afectado o información"
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25"
            />
          </label>
          <div className="sm:w-64 shrink-0">
            <Select label="" value={filtros.modulo} onChange={(e) => cambiar("modulo", e.target.value)}>
              <option value="">Todos los módulos</option>
              {Object.entries(MODULOS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          {hayFiltros && (
            <Button variante="ghost" onClick={limpiar} className="shrink-0">
              <RotateCcw className="h-4 w-4" /> Limpiar
            </Button>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-clay-600">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-cream-50">
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3 text-sm">
          <p className="text-ink-600">
            {datos ? (
              <>
                <strong className="tabular-nums text-ink-900">{datos.total.toLocaleString("es-CO")}</strong>{" "}
                {datos.total === 1 ? "evento" : "eventos"}
                {hayFiltros ? " con estos filtros" : ""}
              </>
            ) : (
              "Cargando…"
            )}
          </p>
          <p className="text-xs text-ink-400">Hora de Colombia</p>
        </div>

        {!datos ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : datos.registros.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-ink-400">No hay eventos que coincidan.</p>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${cargando ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[64rem] border-collapse text-sm">
              <thead>
                <tr className="bg-ink-50 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <th className="w-28 px-3 py-2.5">Fecha y hora</th>
                  <th className="w-44 px-3 py-2.5">Realizado por</th>
                  <th className="w-32 px-3 py-2.5">Módulo</th>
                  <th className="w-36 px-3 py-2.5">Acción</th>
                  <th className="px-3 py-2.5">Registro afectado</th>
                  <th className="w-52 px-3 py-2.5">Información anterior</th>
                  <th className="w-52 px-3 py-2.5">Información nueva</th>
                </tr>
              </thead>
              <tbody>
                {datos.registros.map((e) => {
                  const fecha = new Date(e.fecha);
                  return (
                    <tr key={e.id} title={e.descripcion} className="border-t border-ink-100 align-top hover:bg-royal-50/40">
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-ink-600">
                        <span className="block text-ink-800">{formatoFecha.format(fecha)}</span>
                        {formatoHora.format(fecha)}
                      </td>
                      <td className="px-3 py-3">
                        {e.usuario ? (
                          <>
                            <p className="font-medium text-ink-800">
                              {e.usuario.nombre}
                              {e.usuario.rol === "ADMIN" && (
                                <span className="ml-1.5 rounded bg-royal-600 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase text-white">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-ink-400">{e.usuario.email}</p>
                          </>
                        ) : (
                          <p className="font-medium text-ink-500">Sistema</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-ink-600">{MODULOS[e.modulo] ?? e.modulo}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${tonoAccion(e)}`}
                        >
                          {!e.exitoso && <ShieldAlert className="h-3.5 w-3.5" />}
                          {ACCIONES[e.accion] ?? e.accion}
                          {!e.exitoso && " fallido"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {e.afectado ? (
                          <>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{e.afectado.tipo}</p>
                            <p className="font-medium text-ink-800">{e.afectado.nombre}</p>
                          </>
                        ) : (
                          <p className="text-ink-700">{e.descripcion}</p>
                        )}
                        {e.nota && <p className="mt-1 text-xs text-ink-500">{e.nota}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <Informacion datos={e.informacionAnterior} tono="anterior" />
                      </td>
                      <td className="px-3 py-3">
                        <Informacion datos={e.informacionNueva} tono="nueva" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {datos && datos.paginas > 1 && (
          <div className="flex items-center justify-between border-t border-ink-200 px-4 py-3 text-sm">
            <p className="text-ink-500">
              Página <strong className="text-ink-800">{datos.pagina}</strong> de {datos.paginas}
            </p>
            <div className="flex gap-2">
              <Button variante="ghost" className="!px-3 !py-1.5" disabled={pagina <= 1 || cargando} onClick={() => setPagina((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variante="ghost"
                className="!px-3 !py-1.5"
                disabled={pagina >= datos.paginas || cargando}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Informacion({ datos, tono }: { datos: Record<string, string> | null; tono: "anterior" | "nueva" }) {
  const campos = datos ? Object.entries(datos) : [];
  if (campos.length === 0) return <span className="text-xs text-ink-300">—</span>;
  return (
    <dl
      className={`space-y-1 rounded-lg border px-2.5 py-2 text-xs ${
        tono === "anterior" ? "border-clay-500/20 bg-clay-100/50" : "border-royal-200 bg-royal-50/70"
      }`}
    >
      {campos.map(([campo, valor]) => (
        <div key={campo}>
          <dt className="font-semibold text-ink-500">{campo}</dt>
          <dd
            className={`line-clamp-3 break-words ${tono === "anterior" ? "text-clay-600" : "text-royal-800"}`}
            title={valor}
          >
            {valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
