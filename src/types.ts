export type Rol = "DONANTE" | "VOLUNTARIO" | "BENEFICIARIO" | "ADMIN";

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
  creadoEn: string;
}

export type EstadoInscripcion = "PENDIENTE" | "ACEPTADA" | "RECHAZADA";

export interface InscripcionVoluntario {
  id: number;
  estado: EstadoInscripcion;
  voluntarioId: number;
  voluntario?: Usuario;
  programaId: number;
  programa?: Programa;
  creadoEn: string;
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
