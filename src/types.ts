// Una cuenta USUARIO puede donar, ser voluntaria y pedir ayuda; ADMIN es el personal de la sede.
export type Rol = "USUARIO" | "ADMIN";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  creadoEn: string;
}

export interface Programa {
  id: number;
  nombre: string;
  descripcion: string;
  metaCupoVoluntarios: number;
  creadoEn: string;
}

export interface Campana {
  id: number;
  titulo: string;
  descripcion: string;
  metaMonto: string;
  programaId: number;
  programa?: Programa;
  creadoEn: string;
}

export type CanalDonacion = "PASARELA" | "TRANSFERENCIA" | "EFECTIVO" | "LLAVE";
export type EstadoDonacion = "PENDIENTE" | "COMPLETADA" | "FALLIDA";

export interface Donacion {
  id: number;
  numeroComprobante?: string;
  monto: string;
  canal: CanalDonacion;
  estado: EstadoDonacion;
  campanaId: number;
  campana?: Campana;
  donanteId?: number;
  donante?: Usuario;
  pago?: Pago | null;
  creadoEn: string;
}

export type EstadoInscripcion = "PENDIENTE" | "ACEPTADA" | "RECHAZADA";

export interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  cupo: number;
  programaId: number;
  programa?: Pick<Programa, "id" | "nombre">;
  inscritos?: number;
  disponibles?: number;
  creadoEn: string;
}

export interface InscripcionVoluntario {
  id: number;
  estado: EstadoInscripcion;
  voluntarioId: number;
  voluntario?: Usuario;
  programaId: number;
  programa?: Programa;
  actividadId?: number | null;
  actividad?: Actividad | null;
  creadoEn: string;
}

export interface Pago {
  id: number;
  referencia: string;
  metodo: CanalDonacion;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  creadoEn: string;
}

export interface CambioEstado {
  estadoAnterior: string | null;
  estadoNuevo: string;
  nota: string | null;
  creadoEn: string;
  porAdmin: boolean;
}

export type EstadoSolicitud = "PENDIENTE" | "EN_REVISION" | "APROBADA" | "RECHAZADA";
export type TipoApoyo = "ALIMENTOS" | "SALUD" | "EDUCACION" | "VIVIENDA" | "EMPLEO" | "OTRO";

export const ETIQUETAS_TIPO_APOYO: Record<TipoApoyo, string> = {
  ALIMENTOS: "Alimentos",
  SALUD: "Salud",
  EDUCACION: "Educación",
  VIVIENDA: "Vivienda",
  EMPLEO: "Empleo",
  OTRO: "Otro",
};

export type TipoDocumento = "CC" | "TI" | "CE" | "PPT" | "RC" | "OTRO";

export const ETIQUETAS_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  CC: "Cédula de ciudadanía",
  TI: "Tarjeta de identidad",
  CE: "Cédula de extranjería",
  PPT: "Permiso por Protección Temporal",
  RC: "Registro civil",
  OTRO: "Otro",
};

export interface SolicitudBeneficiario {
  id: number;
  nombreCompleto: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  personasACargo: number;
  aceptaTratamientoDatos: boolean;
  descripcion: string;
  tipoApoyo: TipoApoyo;
  estado: EstadoSolicitud;
  beneficiarioId: number;
  beneficiario?: Usuario;
  programaId: number;
  programa?: Programa;
  creadoEn: string;
}

export interface AvanceCampana {
  campanaId: number;
  titulo: string;
  meta: number;
  recaudado: number;
  porcentaje: number;
}

export interface AvanceProgramaVoluntarios {
  programaId: number;
  nombre: string;
  cupo: number;
  inscritos: number;
  faltan: number;
  porcentaje: number;
}

// Nombres legibles de los estados (el Badge los usa automáticamente).
export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COMPLETADA: "Completada",
  FALLIDA: "Fallida",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
};

export const ETIQUETAS_CANAL: Record<CanalDonacion, string> = {
  PASARELA: "Pasarela (tarjeta / PSE)",
  TRANSFERENCIA: "Transferencia",
  LLAVE: "Llave (Bre-B)",
  EFECTIVO: "Efectivo",
};

export const ETIQUETAS_ROL: Record<Rol, string> = {
  USUARIO: "Usuario",
  ADMIN: "Administrador",
};

// "2026-10-10T00:00:00.000Z" → "sáb, 10 oct 2026" (la fecha de una actividad no tiene hora: se lee en UTC).
export function formatoFechaActividad(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
