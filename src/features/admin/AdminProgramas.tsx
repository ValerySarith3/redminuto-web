import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Actividad, Programa } from "../../types";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { JornadasPrograma } from "./JornadasPrograma";

interface FormularioPrograma {
  nombre: string;
  descripcion: string;
}

const formularioVacio: FormularioPrograma = { nombre: "", descripcion: "" };

export function AdminProgramas() {
  const toast = useToast();
  const [programas, setProgramas] = useState<Programa[] | null>(null);
  const [editandoId, setEditandoId] = useState<number | "nuevo" | null>(null);
  const [formulario, setFormulario] = useState<FormularioPrograma>(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jornadas, setJornadas] = useState<Actividad[]>([]);
  const [abiertos, setAbiertos] = useState<number[]>([]);

  useEffect(() => {
    cargar();
    cargarJornadas();
  }, []);

  async function cargar() {
    const lista = await api.get<Programa[]>("/programas");
    setProgramas(lista);
  }

  async function cargarJornadas() {
    setJornadas(await api.get<Actividad[]>("/actividades?todas=1"));
  }

  const alternar = (id: number) => setAbiertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const hoy = new Date().toISOString().slice(0, 10);

  function abrirEdicion(programa: Programa) {
    setEditandoId(programa.id);
    setFormulario({ nombre: programa.nombre, descripcion: programa.descripcion });
  }

  function abrirCreacion() {
    setEditandoId("nuevo");
    setFormulario(formularioVacio);
  }

  function cerrarFormulario() {
    setEditandoId(null);
    setFormulario(formularioVacio);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editandoId === "nuevo") {
        const creado = await api.post<Programa>("/programas", formulario);
        toast.exito("Programa creado", "Ahora agrégale sus jornadas con fecha y hora.");
        setAbiertos((a) => [...a, creado.id]);
      } else if (editandoId !== null) {
        await api.put(`/programas/${editandoId}`, formulario);
        toast.exito("Programa actualizado");
      }
      cerrarFormulario();
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo guardar el programa";
      setError(mensaje);
      toast.fallo("No se pudo guardar el programa", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(programa: Programa) {
    if (!confirm(`¿Eliminar el programa "${programa.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/programas/${programa.id}`);
      toast.exito("Programa eliminado");
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo eliminar el programa";
      toast.fallo("No se pudo eliminar el programa", mensaje);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-medium text-ink-900">Programas</h2>
        {editandoId === null && (
          <Button variante="accent" onClick={abrirCreacion}>
            <Plus className="h-4 w-4" /> Nuevo programa
          </Button>
        )}
      </div>

      {editandoId !== null && (
        <Modal
          titulo={editandoId === "nuevo" ? "Nuevo programa" : "Editar programa"}
          subtitulo="La causa o línea de trabajo. Sus jornadas de voluntariado se agregan después."
          onClose={cerrarFormulario}
          ancho="max-w-lg"
          pie={
            <>
              <Button type="button" variante="ghost" onClick={cerrarFormulario}>
                Cancelar
              </Button>
              <Button type="submit" form="form-programa" cargando={guardando}>
                {editandoId === "nuevo" ? "Crear programa" : "Guardar cambios"}
              </Button>
            </>
          }
        >
          <form id="form-programa" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              value={formulario.nombre}
              onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
            <Textarea
              label="Descripción"
              value={formulario.descripcion}
              onChange={(e) => setFormulario((f) => ({ ...f, descripcion: e.target.value }))}
              required
            />
            {editandoId === "nuevo" && (
              <p className="rounded-xl bg-royal-50 px-3.5 py-2.5 text-xs text-royal-800">
                Después de crearlo podrás agregarle sus jornadas de voluntariado (fecha, hora, lugar y cupo).
              </p>
            )}
            {error && <p className="text-sm text-clay-600">{error}</p>}
          </form>
        </Modal>
      )}

      {!programas ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : programas.length === 0 ? (
        <Card className="text-center text-ink-500">Aún no hay programas registrados.</Card>
      ) : (
        <div className="space-y-3">
          {programas.map((programa) => {
            const propias = jornadas.filter((j) => j.programaId === programa.id);
            const proximas = propias.filter((j) => j.fecha.slice(0, 10) >= hoy).length;
            const abierto = abiertos.includes(programa.id);
            return (
              <Card key={programa.id} className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-800">{programa.nombre}</p>
                    <p className="mt-1 truncate text-sm text-ink-500">{programa.descripcion}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variante="outline" className="!px-3" aria-label="Editar programa" onClick={() => abrirEdicion(programa)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variante="danger" className="!px-3" aria-label="Eliminar programa" onClick={() => eliminar(programa)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alternar(programa.id)}
                  aria-expanded={abierto}
                  className="flex w-full items-center gap-2 rounded-xl bg-royal-50/60 px-3 py-2 text-left text-sm font-semibold text-royal-800 transition-colors hover:bg-royal-50"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="flex-1">
                    Jornadas de voluntariado
                    <span className="ml-2 font-normal text-royal-700/80">
                      {proximas === 0 ? "sin jornadas próximas" : `${proximas} próxima${proximas === 1 ? "" : "s"}`}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
                </button>
                {abierto && <JornadasPrograma programaId={programa.id} nombrePrograma={programa.nombre} jornadas={propias} onCambio={cargarJornadas} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
