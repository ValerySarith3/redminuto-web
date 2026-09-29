import { useState, type FormEvent } from "react";
import { CalendarDays, ChevronDown, Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatoFechaActividad, type Actividad } from "../../types";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useToast } from "../../components/ui/Toast";
import { Modal } from "../../components/ui/Modal";

interface FormularioJornada {
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  cupo: number;
}

const formularioVacio: FormularioJornada = {
  titulo: "",
  descripcion: "",
  fecha: "",
  horaInicio: "08:00",
  horaFin: "12:00",
  lugar: "Casa Minuto de Dios",
  cupo: 10,
};

// Jornadas (fecha, hora, lugar y cupo) de un programa, administradas desde la tarjeta del programa.
export function JornadasPrograma({
  programaId,
  nombrePrograma,
  jornadas,
  onCambio,
}: {
  programaId: number;
  nombrePrograma: string;
  jornadas: Actividad[];
  onCambio: () => Promise<void>;
}) {
  const toast = useToast();
  const [editandoId, setEditandoId] = useState<number | "nueva" | null>(null);
  const [formulario, setFormulario] = useState<FormularioJornada>(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verRealizadas, setVerRealizadas] = useState(false);

  const hoy = new Date().toISOString().slice(0, 10);
  const proximas = jornadas.filter((j) => j.fecha.slice(0, 10) >= hoy);
  const realizadas = jornadas.filter((j) => j.fecha.slice(0, 10) < hoy).reverse();

  function actualizar<K extends keyof FormularioJornada>(campo: K, valor: FormularioJornada[K]) {
    setFormulario((f) => ({ ...f, [campo]: valor }));
  }

  function abrirCreacion() {
    setEditandoId("nueva");
    setFormulario(formularioVacio);
    setError(null);
  }

  function abrirEdicion(jornada: Actividad) {
    setEditandoId(jornada.id);
    setError(null);
    setFormulario({
      titulo: jornada.titulo,
      descripcion: jornada.descripcion,
      fecha: jornada.fecha.slice(0, 10),
      horaInicio: jornada.horaInicio,
      horaFin: jornada.horaFin,
      lugar: jornada.lugar,
      cupo: jornada.cupo,
    });
  }

  function cerrar() {
    setEditandoId(null);
    setFormulario(formularioVacio);
    setError(null);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (formulario.horaFin <= formulario.horaInicio) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const datos = { ...formulario, programaId };
      if (editandoId === "nueva") {
        await api.post("/actividades", datos);
        toast.exito("Jornada creada");
      } else if (editandoId !== null) {
        await api.put(`/actividades/${editandoId}`, datos);
        toast.exito("Jornada actualizada");
      }
      cerrar();
      await onCambio();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo guardar la jornada";
      setError(mensaje);
      toast.fallo("No se pudo guardar la jornada", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(jornada: Actividad) {
    if (!confirm(`¿Eliminar la jornada "${jornada.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/actividades/${jornada.id}`);
      toast.exito("Jornada eliminada");
      await onCambio();
    } catch (e) {
      toast.fallo("No se pudo eliminar la jornada", e instanceof Error ? e.message : undefined);
    }
  }

  const formularioJornada = (
    <form id="form-jornada" onSubmit={guardar} className="space-y-4">
      <Input
        label="Título"
        placeholder="Ej. Entrega de mercados sede Engativá"
        value={formulario.titulo}
        onChange={(e) => actualizar("titulo", e.target.value)}
        required
      />
      <Textarea
        label="Descripción"
        value={formulario.descripcion}
        onChange={(e) => actualizar("descripcion", e.target.value)}
        required
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <Input label="Fecha" type="date" min={editandoId === "nueva" ? hoy : undefined} value={formulario.fecha} onChange={(e) => actualizar("fecha", e.target.value)} required />
        <Input label="Hora inicio" type="time" value={formulario.horaInicio} onChange={(e) => actualizar("horaInicio", e.target.value)} required />
        <Input label="Hora fin" type="time" value={formulario.horaFin} onChange={(e) => actualizar("horaFin", e.target.value)} required />
        <Input label="Cupo" type="number" min={1} value={formulario.cupo} onChange={(e) => actualizar("cupo", Number(e.target.value))} required />
      </div>
      <Input label="Lugar" value={formulario.lugar} onChange={(e) => actualizar("lugar", e.target.value)} required />
      {error && <p className="text-sm text-clay-600">{error}</p>}
    </form>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Próximas jornadas ({proximas.length})
        </p>
        <Button variante="outline" className="!px-3 !py-1.5 text-xs" onClick={abrirCreacion}>
          <Plus className="h-3.5 w-3.5" /> Agregar jornada
        </Button>
      </div>

      {editandoId !== null && (
        <Modal
          titulo={editandoId === "nueva" ? "Nueva jornada" : "Editar jornada"}
          subtitulo={nombrePrograma}
          onClose={cerrar}
          ancho="max-w-xl"
          pie={
            <>
              <Button type="button" variante="ghost" onClick={cerrar}>
                Cancelar
              </Button>
              <Button type="submit" form="form-jornada" cargando={guardando}>
                {editandoId === "nueva" ? "Crear jornada" : "Guardar cambios"}
              </Button>
            </>
          }
        >
          {formularioJornada}
        </Modal>
      )}

      {proximas.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink-200 px-4 py-3 text-sm text-ink-400">
          Este programa no tiene jornadas próximas. Agrega una para que los voluntarios puedan inscribirse.
        </p>
      )}

      {proximas.map((jornada) => (
        <Jornada key={jornada.id} jornada={jornada} onEditar={() => abrirEdicion(jornada)} onEliminar={() => eliminar(jornada)} />
      ))}

      {realizadas.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setVerRealizadas((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-700"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${verRealizadas ? "rotate-180" : ""}`} />
            {verRealizadas ? "Ocultar" : "Ver"} jornadas realizadas ({realizadas.length})
          </button>
          {verRealizadas && (
            <div className="mt-2 space-y-2 opacity-70">
              {realizadas.map((jornada) => (
                <Jornada key={jornada.id} jornada={jornada} onEditar={() => abrirEdicion(jornada)} onEliminar={() => eliminar(jornada)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Jornada({ jornada, onEditar, onEliminar }: { jornada: Actividad; onEditar: () => void; onEliminar: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-cream-100/60 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-800">{jornada.titulo}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {formatoFechaActividad(jornada.fecha)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {jornada.horaInicio} – {jornada.horaFin}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {jornada.lugar}
          </span>
        </div>
        <div className="mt-2 max-w-xs">
          <ProgressBar
            compact
            porcentaje={jornada.cupo > 0 ? ((jornada.inscritos ?? 0) / jornada.cupo) * 100 : 0}
            etiqueta={`${jornada.inscritos ?? 0}/${jornada.cupo} inscritos`}
          />
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variante="outline" className="!px-2.5 !py-1.5" aria-label="Editar jornada" onClick={onEditar}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variante="danger" className="!px-2.5 !py-1.5" aria-label="Eliminar jornada" onClick={onEliminar}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
