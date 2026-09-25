import { ETIQUETAS_CANAL, ETIQUETAS_ESTADO, ETIQUETAS_TIPO_APOYO, type CanalDonacion, type TipoApoyo } from "../../types";
import type { Tono } from "./graficos";

interface Conteo<K extends string = string> {
  clave: K;
  total: number;
}

// Respuesta de GET /reportes/resumen.
export interface Resumen {
  kpis: {
    totalRecaudado: number;
    donacionesConfirmadas: number;
    donantesUnicos: number;
    pendientesPorConfirmar: { cantidad: number; monto: number };
    inscripciones: number;
    voluntariosUnicos: number;
    solicitudes: number;
    solicitudesAbiertas: number;
  };
  participacion: { usuariosRegistrados: number; donantes: number; voluntarios: number; beneficiarios: number };
  donacionesPorEstado: Conteo[];
  recaudoPorCanal: Conteo<CanalDonacion>[];
  recaudoPorMes: { mes: string; total: number; cantidad: number }[];
  campanas: { id: number; titulo: string; programa: string; meta: number; recaudado: number; porcentaje: number }[];
  inscripcionesPorEstado: Conteo[];
  solicitudesPorEstado: Conteo[];
  solicitudesPorTipo: Conteo<TipoApoyo>[];
  proximasActividades: {
    id: number;
    titulo: string;
    programa: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    lugar: string;
    cupo: number;
    inscritos: number;
  }[];
  actividadReciente: {
    id: number;
    entidad: "DONACION" | "INSCRIPCION" | "SOLICITUD";
    entidadId: number;
    estadoAnterior: string | null;
    estadoNuevo: string;
    nota: string | null;
    usuario: string;
    porAdmin: boolean;
    creadoEn: string;
  }[];
}

const TONO_ESTADO: Record<string, Tono> = {
  COMPLETADA: "exito",
  ACEPTADA: "exito",
  APROBADA: "exito",
  EN_REVISION: "proceso",
  PENDIENTE: "espera",
  FALLIDA: "rechazo",
  RECHAZADA: "rechazo",
};

export const segmentosEstado = (conteos: Conteo[]) =>
  conteos.map((c) => ({ etiqueta: ETIQUETAS_ESTADO[c.clave] ?? c.clave, valor: c.total, tono: TONO_ESTADO[c.clave] ?? "espera" }));

export const barrasTipoApoyo = (conteos: Conteo<TipoApoyo>[]) =>
  conteos.map((c) => ({ etiqueta: ETIQUETAS_TIPO_APOYO[c.clave], valor: c.total }));

export const barrasCanal = (conteos: Conteo<CanalDonacion>[]) =>
  conteos.map((c) => ({ etiqueta: ETIQUETAS_CANAL[c.clave].replace(/ \(.*\)/, ""), valor: c.total }));


const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2026-09" → "sep 26"
export const etiquetaMes = (mes: string) => {
  const [anio, m] = mes.split("-");
  return `${MESES[Number(m) - 1]} ${anio.slice(2)}`;
};

// Rellena con 0 los meses sin recaudo para que la serie sea continua (mínimo los últimos 6 meses).
export function completarMeses(datos: { mes: string; total: number; cantidad: number }[]) {
  const hoy = new Date();
  const inicioMinimo = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
  const primero = datos[0] ? new Date(Number(datos[0].mes.slice(0, 4)), Number(datos[0].mes.slice(5, 7)) - 1, 1) : inicioMinimo;
  const cursor = primero < inicioMinimo ? primero : inicioMinimo;
  const resultado: { mes: string; total: number; cantidad: number }[] = [];
  while (cursor <= hoy) {
    const mes = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const dato = datos.find((d) => d.mes === mes);
    resultado.push({ mes, total: dato?.total ?? 0, cantidad: dato?.cantidad ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return resultado;
}

export const ETIQUETAS_ENTIDAD = { DONACION: "Donación", INSCRIPCION: "Inscripción", SOLICITUD: "Solicitud" } as const;

// --- Periodos ---

export type Periodo = "30d" | "90d" | "anio" | "todo";

export const PERIODOS: { id: Periodo; label: string }[] = [
  { id: "30d", label: "Últimos 30 días" },
  { id: "90d", label: "Últimos 90 días" },
  { id: "anio", label: "Este año" },
  { id: "todo", label: "Todo" },
];

export const aISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function rangoDePeriodo(periodo: Periodo): { desde?: string; hasta?: string } {
  const hoy = new Date();
  if (periodo === "todo") return {};
  if (periodo === "anio") return { desde: `${hoy.getFullYear()}-01-01`, hasta: aISO(hoy) };
  const desde = new Date(hoy);
  desde.setDate(desde.getDate() - (periodo === "30d" ? 29 : 89));
  return { desde: aISO(desde), hasta: aISO(hoy) };
}

export function queryRango(rango: { desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (rango.desde) params.set("desde", rango.desde);
  if (rango.hasta) params.set("hasta", rango.hasta);
  const q = params.toString();
  return q ? `?${q}` : "";
}

// Lo que espera acción del admin (GET /reportes/pendientes), sin importar el periodo.
export interface Pendientes {
  donaciones: number;
  inscripciones: number;
  solicitudes: number;
}

export type Seccion =
  | "resumen"
  | "reporte"
  | "donaciones"
  | "voluntariado"
  | "solicitudes"
  | "programas"
  | "campanas"
  | "actividades"
  | "usuarios";

// Navegar a otra sección del panel, opcionalmente con un filtro de estado ya aplicado.
export type IrA = (seccion: Seccion, filtro?: string) => void;
