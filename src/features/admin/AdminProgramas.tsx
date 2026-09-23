import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Programa } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

interface FormularioPrograma {
  nombre: string;
  descripcion: string;
  metaCupoVoluntarios: number;
}

const formularioVacio: FormularioPrograma = { nombre: "", descripcion: "", metaCupoVoluntarios: 0 };

export function AdminProgramas() {
  const toast = useToast();
  const [programas, setProgramas] = useState<Programa[] | null>(null);
  const [editandoId, setEditandoId] = useState<number | "nuevo" | null>(null);
  const [formulario, setFormulario] = useState<FormularioPrograma>(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const lista = await api.get<Programa[]>("/programas");
    setProgramas(lista);
  }

  function abrirEdicion(programa: Programa) {
    setEditandoId(programa.id);
    setFormulario({
      nombre: programa.nombre,
      descripcion: programa.descripcion,
      metaCupoVoluntarios: programa.metaCupoVoluntarios,
    });
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
        await api.post("/programas", formulario);
        toast.exito("Programa creado");
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
        <Card className="animate-fade-up">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input
              label="Cupo de voluntarios"
              type="number"
              min={0}
              value={formulario.metaCupoVoluntarios}
              onChange={(e) => setFormulario((f) => ({ ...f, metaCupoVoluntarios: Number(e.target.value) }))}
              required
            />
            {error && <p className="text-sm text-clay-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variante="ghost" onClick={cerrarFormulario}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                {editandoId === "nuevo" ? "Crear programa" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Card>
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
          {programas.map((programa) => (
            <Card key={programa.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink-800">{programa.nombre}</p>
                <p className="mt-1 truncate text-sm text-ink-500">{programa.descripcion}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                  Cupo de voluntarios: {programa.metaCupoVoluntarios}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variante="outline" className="!px-3" onClick={() => abrirEdicion(programa)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variante="danger" className="!px-3" onClick={() => eliminar(programa)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
