import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatoFechaActividad, type Actividad, type Programa } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Field";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

interface FormularioActividad {
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  cupo: number;
  programaId: number | "";
}

const formularioVacio: FormularioActividad = {
  titulo: "",
  descripcion: "",
  fecha: "",
  horaInicio: "08:00",
  horaFin: "12:00",
  lugar: "Casa Minuto de Dios",
  cupo: 10,
  programaId: "",
};

export function AdminActividades() {
  const toast = useToast();
  const [actividades, setActividades] = useState<Actividad[] | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [editandoId, setEditandoId] = useState<number | "nuevo" | null>(null);
  const [formulario, setFormulario] = useState<FormularioActividad>(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
    api.get<Programa[]>("/programas").then(setProgramas);
  }, []);

  async function cargar() {
    setActividades(await api.get<Actividad[]>("/actividades?todas=1"));
  }

  function actualizar<K extends keyof FormularioActividad>(campo: K, valor: FormularioActividad[K]) {
    setFormulario((f) => ({ ...f, [campo]: valor }));
  }

  function abrirEdicion(actividad: Actividad) {
    setEditandoId(actividad.id);
    setFormulario({
      titulo: actividad.titulo,
      descripcion: actividad.descripcion,
      fecha: actividad.fecha.slice(0, 10),
      horaInicio: actividad.horaInicio,
      horaFin: actividad.horaFin,
      lugar: actividad.lugar,
      cupo: actividad.cupo,
      programaId: actividad.programaId,
    });
  }

  function abrirCreacion() {
    setEditandoId("nuevo");
    setFormulario({ ...formularioVacio, programaId: programas[0]?.id ?? "" });
  }

  function cerrarFormulario() {
    setEditandoId(null);
    setFormulario(formularioVacio);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (formulario.horaFin <= formulario.horaInicio) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (editandoId === "nuevo") {
        await api.post("/actividades", formulario);
        toast.exito("Actividad creada");
      } else if (editandoId !== null) {
        await api.put(`/actividades/${editandoId}`, formulario);
        toast.exito("Actividad actualizada");
      }
      cerrarFormulario();
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo guardar la actividad";
      setError(mensaje);
      toast.fallo("No se pudo guardar la actividad", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(actividad: Actividad) {
    if (!confirm(`¿Eliminar la actividad "${actividad.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/actividades/${actividad.id}`);
      toast.exito("Actividad eliminada");
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo eliminar la actividad";
      toast.fallo("No se pudo eliminar la actividad", mensaje);
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink-900">Actividades de voluntariado</h2>
          <p className="mt-1 text-sm text-ink-500">Jornadas con fecha, horario, lugar y cupo propio dentro de cada programa.</p>
        </div>
        {editandoId === null && (
          <Button variante="accent" onClick={abrirCreacion} disabled={programas.length === 0}>
            <Plus className="h-4 w-4" /> Nueva actividad
          </Button>
        )}
      </div>

      {editandoId !== null && (
        <Card className="animate-fade-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Título" value={formulario.titulo} onChange={(e) => actualizar("titulo", e.target.value)} required />
              <Select
                label="Programa"
                value={formulario.programaId}
                onChange={(e) => actualizar("programaId", Number(e.target.value))}
                required
              >
                {programas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Descripción"
              value={formulario.descripcion}
              onChange={(e) => actualizar("descripcion", e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-4">
              <Input label="Fecha" type="date" value={formulario.fecha} onChange={(e) => actualizar("fecha", e.target.value)} required />
              <Input
                label="Hora inicio"
                type="time"
                value={formulario.horaInicio}
                onChange={(e) => actualizar("horaInicio", e.target.value)}
                required
              />
              <Input
                label="Hora fin"
                type="time"
                value={formulario.horaFin}
                onChange={(e) => actualizar("horaFin", e.target.value)}
                required
              />
              <Input
                label="Cupo"
                type="number"
                min={1}
                value={formulario.cupo}
                onChange={(e) => actualizar("cupo", Number(e.target.value))}
                required
              />
            </div>
            <Input label="Lugar" value={formulario.lugar} onChange={(e) => actualizar("lugar", e.target.value)} required />
            {error && <p className="text-sm text-clay-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variante="ghost" onClick={cerrarFormulario}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                {editandoId === "nuevo" ? "Crear actividad" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!actividades ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : actividades.length === 0 ? (
        <Card className="text-center text-ink-500">
          Aún no hay actividades. Crea la primera para que los voluntarios puedan inscribirse a una jornada concreta.
        </Card>
      ) : (
        <div className="space-y-3">
          {actividades.map((actividad) => {
            const pasada = actividad.fecha.slice(0, 10) < hoy;
            return (
              <Card key={actividad.id} className={`flex flex-wrap items-center justify-between gap-4 ${pasada ? "opacity-60" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-800">
                    {actividad.titulo}
                    {pasada && <span className="ml-2 text-xs font-normal uppercase text-ink-400">Realizada</span>}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-400">{actividad.programa?.nombre}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatoFechaActividad(actividad.fecha)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {actividad.horaInicio} – {actividad.horaFin}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {actividad.lugar}
                    </span>
                  </div>
                  <div className="mt-3 max-w-sm">
                    <ProgressBar
                      compact
                      porcentaje={actividad.cupo > 0 ? ((actividad.inscritos ?? 0) / actividad.cupo) * 100 : 0}
                      etiqueta={`${actividad.inscritos}/${actividad.cupo} inscritos`}
                    />
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variante="outline" className="!px-3" aria-label="Editar" onClick={() => abrirEdicion(actividad)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variante="danger" className="!px-3" aria-label="Eliminar" onClick={() => eliminar(actividad)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
