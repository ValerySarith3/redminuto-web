import { useEffect, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HandCoins,
  HandHeart,
  Heart,
  Printer,
  LifeBuoy,
  MapPin,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCountUp } from "../../lib/useCountUp";
import { Skeleton } from "../../components/ui/Skeleton";
import { pesos, pesosCompactos, type Tono } from "./graficos";
import { InformeGestion } from "./AdminReporte";
import {
  PERIODOS,
  barrasCanal,
  barrasTipoApoyo,
  completarMeses,
  etiquetaMes,
  queryRango,
  rangoDePeriodo,
  segmentosEstado,
  type IrA,
  type Pendientes,
  type Periodo,
  type Resumen,
} from "./reportes";

const AZUL = "#0175dd";
const AZUL_SUAVE = "#86beff";
const HEX_TONO: Record<Tono, string> = { exito: AZUL, proceso: AZUL_SUAVE, espera: "#f0b90d", rechazo: "#d33f2e" };

type Area = "donaciones" | "voluntariado" | "solicitudes" | "comunidad";

const AREAS: Area[] = ["donaciones", "voluntariado", "solicitudes", "comunidad"];
const CLAVE_AREAS = "redminuto_tablero_areas";

function areasGuardadas(): Area[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_AREAS) ?? "null");
    if (Array.isArray(guardado)) return guardado.filter((a): a is Area => AREAS.includes(a));
  } catch {
    // Sin acceso al almacenamiento: se usa el valor por defecto.
  }
  return ["donaciones"];
}

function saludo() {
  const hora = new Date().getHours();
  return hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
}

export function AdminResumen({ irA }: { irA: IrA }) {
  const { usuario } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>("todo");
  const [abiertos, setAbiertos] = useState<Area[]>(areasGuardadas);

  function guardarAreas(areas: Area[]) {
    setAbiertos(areas);
    try {
      localStorage.setItem(CLAVE_AREAS, JSON.stringify(areas));
    } catch {
      // No es crítico si no se puede recordar.
    }
  }
  const alternar = (area: Area) =>
    guardarAreas(abiertos.includes(area) ? abiertos.filter((a) => a !== area) : [...abiertos, area]);
  const abrirTodo = (abrir: boolean) => guardarAreas(abrir ? AREAS : []);

  // El PDF no es una foto del tablero: se arma el informe de gestión del periodo elegido y se imprime.
  const [informe, setInforme] = useState(false);
  const rangoInforme = rangoDePeriodo(periodo);

  useEffect(() => {
    if (!informe) return;
    const terminar = () => setInforme(false);
    window.addEventListener("afterprint", terminar);
    return () => window.removeEventListener("afterprint", terminar);
  }, [informe]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pendientes, setPendientes] = useState<Pendientes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Pendientes>("/reportes/pendientes").then(setPendientes).catch(() => setPendientes(null));
  }, []);

  useEffect(() => {
    let vigente = true;
    api
      .get<Resumen>(`/reportes/resumen${queryRango(rangoDePeriodo(periodo))}`)
      .then((r) => vigente && (setResumen(r), setError(null)))
      .catch((e) => vigente && setError(e instanceof Error ? e.message : "No se pudo cargar el tablero"));
    return () => {
      vigente = false;
    };
  }, [periodo]);

  const nombre = usuario?.nombre.split(" ")[0] ?? "";
  const hoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
    {informe && (
      <div className="hidden [print-color-adjust:exact] print:block">
        <InformeGestion
          desde={rangoInforme.desde ?? ""}
          hasta={rangoInforme.hasta ?? ""}
          onListo={() => setTimeout(() => window.print(), 300)}
          onError={(mensaje) => {
            setInforme(false);
            setError(`No se pudo preparar el informe: ${mensaje}`);
          }}
        />
      </div>
    )}
    <div className="space-y-6 print:hidden">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-royal-700 via-royal-800 to-royal-950 px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-royal-400/30 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 first-letter:uppercase">{hoy}</p>
            <h2 className="mt-2 font-serif text-3xl font-medium">
              {saludo()}, {nombre}
            </h2>
            <p className="mt-1 max-w-md text-sm text-royal-100/80">
              Así va Casa Minuto de Dios: donaciones, voluntariado y solicitudes de ayuda en un solo lugar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex flex-wrap gap-1 rounded-full bg-white/10 p-1 backdrop-blur">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodo(p.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  periodo === p.id ? "bg-white text-royal-800 shadow" : "text-royal-100 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setInforme(true)}
            disabled={!resumen || informe}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-xs font-semibold text-royal-900 shadow transition-colors hover:bg-gold-300 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> {informe ? "Preparando informe…" : "Imprimir / PDF"}
          </button>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-clay-600">{error}</p>}

      {!resumen ? (
        !error && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
            <Skeleton className="h-12 w-72 lg:col-span-3" />
            <Skeleton className="h-80 lg:col-span-3" />
          </div>
        )
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <Indicador
                icono={Wallet}
                destacado
                etiqueta="Recaudo confirmado"
                valor={resumen.kpis.totalRecaudado}
                formato={pesosCompactos}
                detalle={`${resumen.kpis.donacionesConfirmadas} donaciones de ${resumen.kpis.donantesUnicos} donantes`}
                onClick={() => irA("donaciones", "COMPLETADA")}
              />
              <Indicador
                icono={HandCoins}
                etiqueta="Pagos por confirmar"
                valor={resumen.kpis.pendientesPorConfirmar.cantidad}
                detalle={`${pesos(resumen.kpis.pendientesPorConfirmar.monto)} por verificar`}
                onClick={() => irA("donaciones", "PENDIENTE")}
              />
              <Indicador
                icono={HandHeart}
                etiqueta="Inscripciones de voluntariado"
                valor={resumen.kpis.inscripciones}
                detalle={`${resumen.kpis.voluntariosUnicos} voluntarios distintos`}
                onClick={() => irA("voluntariado")}
              />
              <Indicador
                icono={LifeBuoy}
                etiqueta="Solicitudes de ayuda"
                valor={resumen.kpis.solicitudes}
                detalle={`${resumen.kpis.solicitudesAbiertas} siguen abiertas`}
                onClick={() => irA("solicitudes")}
              />
            </div>
            <PorAtender pendientes={pendientes} irA={irA} />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
            <div>
              <h3 className="font-serif text-lg font-medium text-ink-900">Detalle por área</h3>
              <p className="text-xs text-ink-400 print:hidden">Abre cada área para ver sus gráficas y listados.</p>
            </div>
            <div className="flex gap-2 text-xs font-semibold print:hidden">
              <button type="button" onClick={() => abrirTodo(true)} className="text-royal-700 hover:text-royal-900">
                Abrir todo
              </button>
              <span className="text-ink-300">·</span>
              <button type="button" onClick={() => abrirTodo(false)} className="text-royal-700 hover:text-royal-900">
                Cerrar todo
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Apartado
              icono={Wallet}
              titulo="Donaciones y recaudo"
              descripcion="Cuánto dinero ha entrado, por qué medio y cómo van las metas de cada campaña."
              resumen={`${pesosCompactos(resumen.kpis.totalRecaudado)} recaudados`}
              abierto={abiertos.includes("donaciones")}
              onToggle={() => alternar("donaciones")}
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <EvolucionRecaudo datos={resumen.recaudoPorMes} className="lg:col-span-2" />
                <Tarjeta titulo="Recaudo por medio de pago" subtitulo="Donaciones confirmadas">
                  <BarrasCanal datos={barrasCanal(resumen.recaudoPorCanal)} />
                </Tarjeta>
                <Tarjeta
                  className="lg:col-span-2"
                  titulo="Avance de campañas"
                  subtitulo="Recaudo confirmado frente a la meta"
                  accion={{ texto: "Ver campañas", onClick: () => irA("campanas") }}
                >
                  {resumen.campanas.length === 0 ? (
                    <Vacio texto="Aún no hay campañas." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {resumen.campanas.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 transition-colors hover:border-royal-200 hover:bg-royal-50/50"
                        >
                          <Anillo porcentaje={c.porcentaje} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-800">{c.titulo}</p>
                            <p className="truncate text-xs text-ink-400">{c.programa}</p>
                            <p className="mt-1.5 text-sm tabular-nums text-ink-600">
                              <strong className="text-ink-900">{pesosCompactos(c.recaudado)}</strong> de {pesosCompactos(c.meta)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tarjeta>

                <EstadoProcesos resumen={resumen} irA={irA} proceso="donaciones" />
              </div>
            </Apartado>

            <Apartado
              icono={HandHeart}
              titulo="Voluntariado y jornadas"
              descripcion="Las próximas jornadas programadas y en qué van las inscripciones de voluntarios."
              resumen={`${resumen.proximasActividades.length} jornadas próximas`}
              abierto={abiertos.includes("voluntariado")}
              onToggle={() => alternar("voluntariado")}
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <Tarjeta
                  className="lg:col-span-2"
                  titulo="Próximas jornadas"
                  accion={{ texto: "Gestionar", onClick: () => irA("programas") }}
                >
                  {resumen.proximasActividades.length === 0 ? (
                    <Vacio texto="No hay jornadas programadas." />
                  ) : (
                    <ul className="space-y-3">
                      {resumen.proximasActividades.map((a) => {
                        const fecha = new Date(a.fecha);
                        const lleno = a.inscritos >= a.cupo;
                        return (
                          <li key={a.id} className="flex items-center gap-3">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-royal-50 text-center leading-none">
                              <span>
                                <span className="block font-serif text-xl font-semibold text-royal-700">
                                  {fecha.getUTCDate()}
                                </span>
                                <span className="text-[10px] font-semibold uppercase text-royal-500">
                                  {fecha.toLocaleDateString("es-CO", { month: "short", timeZone: "UTC" })}
                                </span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink-800">{a.titulo}</p>
                              <p className="flex items-center gap-1 truncate text-xs text-ink-400">
                                <MapPin className="h-3 w-3 shrink-0" /> {a.horaInicio} · {a.lugar}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                                lleno ? "bg-royal-600 text-white" : "bg-ink-100 text-ink-600"
                              }`}
                            >
                              {a.inscritos}/{a.cupo}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Tarjeta>
                <EstadoProcesos resumen={resumen} irA={irA} proceso="voluntariado" />
              </div>
            </Apartado>

            <Apartado
              icono={LifeBuoy}
              titulo="Solicitudes de ayuda"
              descripcion="Qué tipo de ayuda piden las personas y en qué estado están sus solicitudes."
              resumen={`${resumen.kpis.solicitudesAbiertas} abiertas`}
              abierto={abiertos.includes("solicitudes")}
              onToggle={() => alternar("solicitudes")}
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <Tarjeta className="lg:col-span-2" titulo="¿Qué ayuda se pide?" subtitulo="Solicitudes por tipo de apoyo">
                  <BarrasTipo datos={barrasTipoApoyo(resumen.solicitudesPorTipo)} />
                </Tarjeta>
                <EstadoProcesos resumen={resumen} irA={irA} proceso="solicitudes" />
              </div>
            </Apartado>

            <Apartado
              icono={Users}
              titulo="Personas registradas"
              descripcion="Cuántas personas tienen cuenta en la plataforma y de qué forma participan."
              resumen={`${resumen.participacion.usuariosRegistrados} personas`}
              abierto={abiertos.includes("comunidad")}
              onToggle={() => alternar("comunidad")}
            >
              <div className="max-w-2xl">
                <Participacion datos={resumen.participacion} />
              </div>
            </Apartado>
          </div>
        </>
      )}
    </div>
    </>
  );
}


function Tarjeta({
  titulo,
  subtitulo,
  accion,
  children,
  className = "",
  extra,
}: {
  titulo: string;
  subtitulo?: string;
  accion?: { texto: string; onClick: () => void };
  children: ReactNode;
  className?: string;
  extra?: ReactNode;
}) {
  return (
    <section className={`min-w-0 rounded-3xl border border-ink-200/70 bg-cream-50 p-6 shadow-sm shadow-royal-900/[0.03] print:break-inside-avoid print:shadow-none ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-medium text-ink-900">{titulo}</h3>
          {subtitulo && <p className="mt-0.5 text-xs text-ink-400">{subtitulo}</p>}
        </div>
        {extra}
        {accion && (
          <button
            type="button"
            onClick={accion.onClick}
            className="group inline-flex items-center gap-1 text-xs font-semibold text-royal-700 hover:text-royal-900"
          >
            {accion.texto}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Vacio({ texto }: { texto: string }) {
  return <p className="py-8 text-center text-sm text-ink-400">{texto}</p>;
}

function Indicador({
  icono: Icono,
  etiqueta,
  valor,
  detalle,
  formato = (n) => Math.round(n).toLocaleString("es-CO"),
  destacado,
  onClick,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: number;
  detalle: string;
  formato?: (n: number) => string;
  destacado?: boolean;
  onClick: () => void;
}) {
  const animado = useCountUp(valor);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col rounded-3xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        destacado
          ? "border-gold-300 bg-gradient-to-br from-gold-50 to-cream-50 hover:shadow-gold-700/10"
          : "border-ink-200/70 bg-cream-50 hover:border-royal-200 hover:shadow-royal-900/10"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-2xl ${
            destacado ? "bg-gold-400 text-royal-900" : "bg-royal-50 text-royal-700"
          }`}
        >
          <Icono className="h-5 w-5" strokeWidth={2} />
        </span>
        <ArrowRight className="h-4 w-4 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-royal-600" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">{etiqueta}</p>
      <p className="mt-1 text-3xl font-semibold text-ink-900">{formato(animado)}</p>
      <p className="mt-1 text-xs text-ink-400">{detalle}</p>
    </button>
  );
}

function PorAtender({ pendientes, irA }: { pendientes: Pendientes | null; irA: IrA }) {
  const filas: { icono: LucideIcon; cantidad: number; texto: string; ir: () => void }[] = pendientes
    ? [
        {
          icono: HandCoins,
          cantidad: pendientes.donaciones,
          texto: "pagos esperan confirmación",
          ir: () => irA("donaciones", "PENDIENTE"),
        },
        {
          icono: Users,
          cantidad: pendientes.inscripciones,
          texto: "voluntarios esperan aprobación",
          ir: () => irA("voluntariado", "PENDIENTE"),
        },
        {
          icono: LifeBuoy,
          cantidad: pendientes.solicitudes,
          texto: "solicitudes de ayuda sin resolver",
          ir: () => irA("solicitudes", "ABIERTAS"),
        },
      ]
    : [];
  const total = filas.reduce((t, f) => t + f.cantidad, 0);

  return (
    <section className="flex flex-col rounded-3xl border border-ink-200/70 bg-cream-50 p-6 shadow-sm shadow-royal-900/[0.03]">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-royal-600" />
        <h3 className="font-serif text-lg font-medium text-ink-900">Por atender</h3>
        {total > 0 && (
          <span className="ml-auto rounded-full bg-clay-500 px-2 py-0.5 text-xs font-bold text-white">{total}</span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-ink-400">Lo que espera una acción tuya, sin importar el periodo</p>

      {!pendientes ? (
        <Skeleton className="mt-5 h-40" />
      ) : total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-royal-50">
            <CheckCircle2 className="h-7 w-7 text-royal-600" />
          </span>
          <p className="mt-3 font-semibold text-ink-800">¡Todo al día!</p>
          <p className="text-xs text-ink-400">No hay nada pendiente por revisar.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {filas.map((f) => (
            <li key={f.texto}>
              <button
                type="button"
                onClick={f.ir}
                disabled={f.cantidad === 0}
                className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition-all hover:border-royal-200 hover:bg-royal-50/60 disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-transparent"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    f.cantidad > 0 ? "bg-gold-100 text-gold-800" : "bg-ink-100 text-ink-400"
                  }`}
                >
                  <f.icono className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm text-ink-600">
                  <strong className="text-lg tabular-nums text-ink-900">{f.cantidad}</strong> {f.texto}
                </span>
                {f.cantidad > 0 && (
                  <ArrowRight className="h-4 w-4 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-royal-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CajaTooltip({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-cream-50 px-3 py-2 text-xs shadow-xl shadow-royal-900/10">
      <p className="font-semibold text-ink-800">{titulo}</p>
      <div className="mt-0.5 text-ink-500">{children}</div>
    </div>
  );
}

function EvolucionRecaudo({ datos, className }: { datos: Resumen["recaudoPorMes"]; className?: string }) {
  const [medida, setMedida] = useState<"total" | "cantidad">("total");
  const serie = completarMeses(datos).map((m) => ({ ...m, etiqueta: etiquetaMes(m.mes) }));
  const formato = medida === "total" ? pesos : (n: number) => `${n} donaciones`;
  const hayDatos = serie.some((m) => m.total > 0);

  return (
    <Tarjeta
      className={className}
      titulo="Evolución del recaudo"
      subtitulo="Donaciones con pago confirmado, mes a mes"
      extra={
        <div className="flex gap-1 rounded-full bg-ink-100 p-1">
          {(
            [
              ["total", "Monto"],
              ["cantidad", "Nº donaciones"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMedida(id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                medida === id ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      {!hayDatos ? (
        <Vacio texto="Aún no hay donaciones confirmadas." />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="relleno-recaudo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AZUL} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={AZUL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eaeff5" />
              <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8996aa" }} />
              <YAxis
                width={medida === "total" ? 64 : 32}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#8996aa" }}
                tickFormatter={(v: number) => (medida === "total" ? pesosCompactos(v) : String(v))}
              />
              <Tooltip
                cursor={{ stroke: "#b3bfd1", strokeWidth: 1 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <CajaTooltip titulo={String(label)}>{formato(Number(payload[0].value))}</CajaTooltip>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey={medida}
                stroke={AZUL}
                strokeWidth={2}
                fill="url(#relleno-recaudo)"
                dot={false}
                activeDot={{ r: 5, fill: AZUL, stroke: "#fbfdff", strokeWidth: 2 }}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Tarjeta>
  );
}

function BarrasCanal({ datos }: { datos: { etiqueta: string; valor: number }[] }) {
  const total = datos.reduce((t, d) => t + d.valor, 0);
  if (total === 0) return <Vacio texto="Sin recaudo en este periodo." />;
  return (
    <ul className="space-y-4">
      {[...datos]
        .sort((a, b) => b.valor - a.valor)
        .map((d) => {
          const pct = (d.valor / total) * 100;
          return (
            <li key={d.etiqueta} className="group">
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-ink-600">{d.etiqueta}</span>
                <span className="tabular-nums text-ink-900">
                  <strong>{pesosCompactos(d.valor)}</strong>{" "}
                  <span className="text-xs text-ink-400">{pct.toFixed(0)}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-royal-600 transition-all duration-700 group-hover:bg-royal-700"
                  style={{ width: `${pct}%`, minWidth: d.valor > 0 ? 6 : 0 }}
                />
              </div>
            </li>
          );
        })}
    </ul>
  );
}

function Anillo({ porcentaje }: { porcentaje: number }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setVisible(porcentaje), 80);
    return () => clearTimeout(t);
  }, [porcentaje]);
  const radio = 26;
  const circunferencia = 2 * Math.PI * radio;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={radio} fill="none" stroke="#dcebff" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radio}
          fill="none"
          stroke={porcentaje >= 100 ? "#f0b90d" : AZUL}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - Math.min(100, visible) / 100)}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold tabular-nums text-ink-800">
        {porcentaje < 10 && porcentaje > 0 ? porcentaje.toFixed(1) : Math.round(porcentaje)}%
      </span>
    </div>
  );
}

type Proceso = "donaciones" | "voluntariado" | "solicitudes";

const TITULO_PROCESO: Record<Proceso, string> = {
  donaciones: "Estado de las donaciones",
  voluntariado: "Estado de las inscripciones",
  solicitudes: "Estado de las solicitudes",
};

function EstadoProcesos({ resumen, irA, proceso }: { resumen: Resumen; irA: IrA; proceso: Proceso }) {
  const conteos = {
    donaciones: resumen.donacionesPorEstado,
    voluntariado: resumen.inscripcionesPorEstado,
    solicitudes: resumen.solicitudesPorEstado,
  }[proceso];
  const segmentos = segmentosEstado(conteos).map((s, i) => ({ ...s, clave: conteos[i].clave }));
  const total = segmentos.reduce((t, s) => t + s.valor, 0);

  return (
    <Tarjeta titulo={TITULO_PROCESO[proceso]} subtitulo="Clic en un estado para ver esos registros">
      <div className="relative mx-auto h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total > 0 ? segmentos.filter((s) => s.valor > 0) : [{ etiqueta: "Sin datos", valor: 1, tono: "proceso" }]}
              dataKey="valor"
              nameKey="etiqueta"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={total > 0 ? 2 : 0}
              stroke="none"
              animationDuration={600}
            >
              {(total > 0 ? segmentos.filter((s) => s.valor > 0) : [null]).map((s, i) => (
                <Cell key={i} fill={s ? HEX_TONO[s.tono] : "#eaeff5"} />
              ))}
            </Pie>
            {total > 0 && (
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <CajaTooltip titulo={String(payload[0].name)}>
                      {payload[0].value} ({Math.round((Number(payload[0].value) / total) * 100)}%)
                    </CajaTooltip>
                  ) : null
                }
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <span>
            <span className="block text-3xl font-semibold tabular-nums text-ink-900">{total}</span>
            <span className="text-[11px] uppercase tracking-wide text-ink-400">en total</span>
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {segmentos.map((s) => (
          <li key={s.clave}>
            <button
              type="button"
              disabled={s.valor === 0}
              onClick={() => irA(proceso, s.clave)}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-ink-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEX_TONO[s.tono] }} />
              <span className="flex-1 text-left text-ink-600">{s.etiqueta}</span>
              <strong className="tabular-nums text-ink-900">{s.valor}</strong>
            </button>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

function BarrasTipo({ datos }: { datos: { etiqueta: string; valor: number }[] }) {
  if (datos.every((d) => d.valor === 0)) return <Vacio texto="Sin solicitudes en este periodo." />;
  const ordenados = [...datos].sort((a, b) => b.valor - a.valor);
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ordenados} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#eaeff5" />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="etiqueta"
            width={78}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#4b5670" }}
          />
          <Tooltip
            cursor={{ fill: "#eff6ff" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <CajaTooltip titulo={String(label)}>{payload[0].value} solicitudes</CajaTooltip>
              ) : null
            }
          />
          <Bar
            dataKey="valor"
            fill={AZUL}
            radius={[0, 4, 4, 0]}
            barSize={16}
            animationDuration={600}
            label={{ position: "right", fontSize: 12, fill: "#384258", formatter: (v: unknown) => (Number(v) > 0 ? String(v) : "") }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Participacion({ datos }: { datos: Resumen["participacion"] }) {
  const filas: { icono: LucideIcon; etiqueta: string; valor: number }[] = [
    { icono: Heart, etiqueta: "Han donado", valor: datos.donantes },
    { icono: HandHeart, etiqueta: "Son voluntarios", valor: datos.voluntarios },
    { icono: LifeBuoy, etiqueta: "Han pedido ayuda", valor: datos.beneficiarios },
  ];
  return (
    <Tarjeta titulo="Cómo participan" subtitulo="Personas registradas y lo que han hecho (histórico)">
      <div className="flex items-center gap-3 rounded-2xl bg-royal-50 p-4">
        <Sparkles className="h-5 w-5 text-royal-600" />
        <p className="text-sm text-royal-900">
          <strong className="text-2xl tabular-nums">{datos.usuariosRegistrados}</strong> personas registradas
        </p>
      </div>
      <ul className="mt-5 space-y-4">
        {filas.map((f) => {
          const pct = datos.usuariosRegistrados > 0 ? (f.valor / datos.usuariosRegistrados) * 100 : 0;
          return (
            <li key={f.etiqueta}>
              <div className="mb-1.5 flex items-center gap-2 text-sm">
                <f.icono className="h-4 w-4 text-royal-600" />
                <span className="flex-1 text-ink-600">{f.etiqueta}</span>
                <strong className="tabular-nums text-ink-900">{f.valor}</strong>
              </div>
              <div className="h-2 rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-royal-600 transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] text-ink-400">Una misma persona puede aparecer en varias filas.</p>
    </Tarjeta>
  );
}

function Apartado({
  icono: Icono,
  titulo,
  descripcion,
  resumen,
  abierto,
  onToggle,
  children,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  resumen: string;
  abierto: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border transition-colors ${
        abierto ? "border-royal-200 bg-royal-50/30" : "border-ink-200/70 bg-cream-50 hover:border-royal-200"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
            abierto ? "bg-royal-600 text-white" : "bg-royal-50 text-royal-700"
          }`}
        >
          <Icono className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-lg font-medium text-ink-900">{titulo}</span>
          <span className="block text-xs text-ink-500">{descripcion}</span>
        </span>
        <span className="hidden shrink-0 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold tabular-nums text-ink-700 sm:block">
          {resumen}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink-400 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && <div className="animate-fade-up px-5 pb-5">{children}</div>}
    </section>
  );
}
