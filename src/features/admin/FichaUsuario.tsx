import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { IdCard, KeyRound, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import {
  ETIQUETAS_CANAL,
  ETIQUETAS_ROL,
  ETIQUETAS_TIPO_APOYO,
  ETIQUETAS_TIPO_DOCUMENTO,
  formatoFechaActividad,
  type CanalDonacion,
  type EstadoDonacion,
  type EstadoInscripcion,
  type EstadoSolicitud,
  type Rol,
  type TipoApoyo,
  type TipoDocumento,
} from "../../types";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { pesos } from "./graficos";

interface DetalleUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  telefono: string | null;
  tipoDocumento: TipoDocumento | null;
  numeroDocumento: string | null;
  ciudad: string | null;
  creadoEn: string;
  donaciones: {
    id: number;
    monto: string;
    canal: CanalDonacion;
    estado: EstadoDonacion;
    creadoEn: string;
    campana: { titulo: string };
  }[];
  inscripciones: {
    id: number;
    estado: EstadoInscripcion;
    creadoEn: string;
    programa: { nombre: string };
    actividad: { titulo: string; fecha: string; horaInicio: string; horaFin: string } | null;
  }[];
  solicitudes: {
    id: number;
    estado: EstadoSolicitud;
    tipoApoyo: TipoApoyo;
    nombreCompleto: string;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    personasACargo: number;
    creadoEn: string;
    programa: { nombre: string };
  }[];
  consentimientos: { finalidad: string; versionPolitica: string; aceptadoEn: string }[];
}

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

type Pestana = "voluntariado" | "solicitudes" | "donaciones";

// Desde "Usuarios" se ve la ficha completa (todo el historial y cambio de contraseña).
// Desde una sección de seguimiento (`seccion`) solo se ven los datos de contacto y lo de esa sección.
export function FichaUsuario({
  usuarioId,
  onClose,
  seccion,
}: {
  usuarioId: number;
  onClose: () => void;
  seccion?: Pestana;
}) {
  const [detalle, setDetalle] = useState<DetalleUsuario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pestana, setPestana] = useState<Pestana>(seccion ?? "voluntariado");

  useEffect(() => {
    api
      .get<DetalleUsuario>(`/usuarios/${usuarioId}`)
      .then((d) => {
        setDetalle(d);
        // Se abre en la pestaña donde la persona tiene actividad.
        if (!seccion && d.inscripciones.length === 0) {
          setPestana(d.solicitudes.length > 0 ? "solicitudes" : d.donaciones.length > 0 ? "donaciones" : "voluntariado");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar la ficha"));
  }, [usuarioId]);

  // La última solicitud de ayuda suele tener los datos más completos (dirección, documento).
  const ultimaSolicitud = detalle?.solicitudes[0];
  const telefono = detalle?.telefono ?? ultimaSolicitud?.telefono;
  const documento = detalle?.numeroDocumento
    ? `${detalle.tipoDocumento ? ETIQUETAS_TIPO_DOCUMENTO[detalle.tipoDocumento] : ""} ${detalle.numeroDocumento}`
    : ultimaSolicitud
      ? `${ETIQUETAS_TIPO_DOCUMENTO[ultimaSolicitud.tipoDocumento]} ${ultimaSolicitud.numeroDocumento}`
      : null;
  const ubicacion = ultimaSolicitud ? `${ultimaSolicitud.direccion}, ${ultimaSolicitud.ciudad}` : detalle?.ciudad;

  const pestanas: { id: Pestana; label: string; cantidad: number }[] = detalle
    ? [
        { id: "voluntariado", label: "Voluntariado", cantidad: detalle.inscripciones.length },
        { id: "solicitudes", label: "Solicitudes de ayuda", cantidad: detalle.solicitudes.length },
        { id: "donaciones", label: "Donaciones", cantidad: detalle.donaciones.length },
      ]
    : [];

  return (
    <Modal
      titulo={detalle?.nombre ?? "Ficha del usuario"}
      subtitulo={
        detalle && (
          <span className="flex flex-wrap items-center gap-2">
            <Badge tono={detalle.rol === "ADMIN" ? "success" : "neutral"}>{ETIQUETAS_ROL[detalle.rol]}</Badge>
            <span className="text-xs">Registrado el {formatoFecha.format(new Date(detalle.creadoEn))}</span>
          </span>
        )
      }
      onClose={onClose}
      ancho="max-w-3xl"
      pie={
        detalle &&
        (seccion ? (
          <Button variante="ghost" onClick={onClose}>
            Cerrar
          </Button>
        ) : (
          <CambiarPassword usuarioId={detalle.id} nombre={detalle.nombre} onCerrar={onClose} />
        ))
      }
    >
      {error ? (
        <p className="text-sm text-clay-600">{error}</p>
      ) : !detalle ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-x-6 gap-y-3 rounded-2xl bg-royal-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Dato icono={Mail} etiqueta="Correo">
              <a href={`mailto:${detalle.email}`} className="text-royal-700 hover:underline">
                {detalle.email}
              </a>
            </Dato>
            <Dato icono={Phone} etiqueta="Celular">
              {telefono ? (
                <a href={`tel:${telefono}`} className="text-royal-700 hover:underline">
                  {telefono}
                </a>
              ) : (
                <SinDato />
              )}
            </Dato>
            <Dato icono={IdCard} etiqueta="Documento">
              {documento ?? <SinDato />}
            </Dato>
            <Dato icono={MapPin} etiqueta="Ubicación">
              {ubicacion ?? <SinDato />}
            </Dato>
            <Dato icono={ShieldCheck} etiqueta="Tratamiento de datos">
              {detalle.consentimientos.length > 0 ? (
                `Aceptado el ${formatoFecha.format(new Date(detalle.consentimientos[0].aceptadoEn))}`
              ) : (
                <SinDato texto="Sin registro" />
              )}
            </Dato>
          </section>

          <section>
            {seccion ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                {pestanas.find((p) => p.id === seccion)?.label} de esta persona
              </p>
            ) : (
              <div role="tablist" className="flex flex-wrap gap-1 rounded-full bg-ink-100 p-1">
                {pestanas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={pestana === p.id}
                    onClick={() => setPestana(p.id)}
                    className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      pestana === p.id ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
                    }`}
                  >
                    {p.label} <span className="tabular-nums opacity-70">({p.cantidad})</span>
                  </button>
                ))}
              </div>

              )}

              <div className="mt-3">
                {pestana === "voluntariado" && (
                  <Lista vacio="No se ha inscrito a ninguna jornada.">
                    {detalle.inscripciones.map((i) => (
                      <Fila key={i.id} estado={i.estado}>
                        <p className="font-medium text-ink-800">{i.actividad?.titulo ?? `${i.programa.nombre} (programa general)`}</p>
                        <p className="text-xs text-ink-400">
                          {i.actividad
                            ? `${formatoFechaActividad(i.actividad.fecha)} · ${i.actividad.horaInicio}–${i.actividad.horaFin} · `
                            : ""}
                          {i.programa.nombre}
                        </p>
                      </Fila>
                    ))}
                  </Lista>
                )}
                {pestana === "solicitudes" && (
                  <Lista vacio="No ha pedido ayuda.">
                    {detalle.solicitudes.map((s) => (
                      <Fila key={s.id} estado={s.estado}>
                        <p className="font-medium text-ink-800">
                          {s.programa.nombre} · {ETIQUETAS_TIPO_APOYO[s.tipoApoyo]}
                        </p>
                        <p className="text-xs text-ink-500">
                          {s.nombreCompleto} · {ETIQUETAS_TIPO_DOCUMENTO[s.tipoDocumento]} {s.numeroDocumento} · Tel. {s.telefono}
                        </p>
                        <p className="text-xs text-ink-400">
                          {s.direccion}, {s.ciudad} · {s.personasACargo}{" "}
                          {s.personasACargo === 1 ? "persona a cargo" : "personas a cargo"} ·{" "}
                          {formatoFecha.format(new Date(s.creadoEn))}
                        </p>
                      </Fila>
                    ))}
                  </Lista>
                )}
                {pestana === "donaciones" && (
                  <Lista vacio="No ha hecho donaciones.">
                    {detalle.donaciones.map((d) => (
                      <Fila key={d.id} estado={d.estado}>
                        <p className="font-medium text-ink-800">
                          {pesos(Number(d.monto))} · {d.campana.titulo}
                        </p>
                        <p className="text-xs text-ink-400">
                          {formatoFecha.format(new Date(d.creadoEn))} · {ETIQUETAS_CANAL[d.canal].replace(/ \(.*\)/, "")}
                        </p>
                      </Fila>
                    ))}
                  </Lista>
                )}
              </div>
            </section>
          </div>
      )}
    </Modal>
  );
}

function Dato({ icono: Icono, etiqueta, children }: { icono: typeof Mail; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-royal-600" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{etiqueta}</p>
        <p className="break-words text-sm text-ink-800">{children}</p>
      </div>
    </div>
  );
}

function SinDato({ texto = "No registrado" }: { texto?: string }) {
  return <span className="text-ink-400">{texto}</span>;
}

function Lista({ vacio, children }: { vacio: string; children: ReactNode[] }) {
  if (children.length === 0) return <p className="py-6 text-center text-sm text-ink-400">{vacio}</p>;
  return <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-200">{children}</ul>;
}

function Fila({ estado, children }: { estado: string; children: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
      <div className="min-w-0">{children}</div>
      <Badge>{estado}</Badge>
    </li>
  );
}

function CambiarPassword({ usuarioId, nombre, onCerrar }: { usuarioId: number; nombre: string; onCerrar: () => void }) {
  const toast = useToast();
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError("Usa al menos 8 caracteres, con letras y números.");
      return;
    }
    setGuardando(true);
    try {
      await api.put(`/usuarios/${usuarioId}/password`, { password });
      toast.exito("Contraseña actualizada", `Compártela con ${nombre} por un medio seguro.`);
      setPassword("");
      setAbierto(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña");
    } finally {
      setGuardando(false);
    }
  }

  if (!abierto) {
    return (
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <Button variante="outline" onClick={() => setAbierto(true)}>
          <KeyRound className="h-4 w-4" /> Cambiar contraseña
        </Button>
        <Button variante="ghost" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="w-full space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          autoComplete="off"
          aria-label="Nueva contraseña"
          placeholder="Nueva contraseña: mínimo 8 caracteres, con letras y números"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25"
        />
        <div className="flex shrink-0 gap-2">
          <Button type="button" variante="ghost" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            Guardar
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-clay-600">{error}</p>}
    </form>
  );
}
