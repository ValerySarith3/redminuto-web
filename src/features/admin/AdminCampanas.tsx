import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Campana, Programa } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

interface FormularioCampana {
  titulo: string;
  descripcion: string;
  metaMonto: number;
  programaId: number | "";
}

function formularioVacio(programas: Programa[]): FormularioCampana {
  return { titulo: "", descripcion: "", metaMonto: 0, programaId: programas[0]?.id ?? "" };
}

export function AdminCampanas() {
  const toast = useToast();
  const [campanas, setCampanas] = useState<Campana[] | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [editandoId, setEditandoId] = useState<number | "nuevo" | null>(null);
  const [formulario, setFormulario] = useState<FormularioCampana>({
    titulo: "",
    descripcion: "",
    metaMonto: 0,
    programaId: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const [listaCampanas, listaProgramas] = await Promise.all([
      api.get<Campana[]>("/campanas"),
      api.get<Programa[]>("/programas"),
    ]);
    setCampanas(listaCampanas);
    setProgramas(listaProgramas);
  }

  function abrirEdicion(campana: Campana) {
    setEditandoId(campana.id);
    setFormulario({
      titulo: campana.titulo,
      descripcion: campana.descripcion,
      metaMonto: Number(campana.metaMonto),
      programaId: campana.programaId,
    });
  }

  function abrirCreacion() {
    setEditandoId("nuevo");
    setFormulario(formularioVacio(programas));
  }

  function cerrarFormulario() {
    setEditandoId(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formulario.programaId) {
      setError("Selecciona un programa");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (editandoId === "nuevo") {
        await api.post("/campanas", formulario);
        toast.exito("Campaña creada");
      } else if (editandoId !== null) {
        await api.put(`/campanas/${editandoId}`, formulario);
        toast.exito("Campaña actualizada");
      }
      cerrarFormulario();
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo guardar la campaña";
      setError(mensaje);
      toast.fallo("No se pudo guardar la campaña", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(campana: Campana) {
    if (!confirm(`¿Eliminar la campaña "${campana.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/campanas/${campana.id}`);
      toast.exito("Campaña eliminada");
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo eliminar la campaña";
      toast.fallo("No se pudo eliminar la campaña", mensaje);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-medium text-ink-900">Campañas</h2>
        {editandoId === null && programas.length > 0 && (
          <Button variante="accent" onClick={abrirCreacion}>
            <Plus className="h-4 w-4" /> Nueva campaña
          </Button>
        )}
      </div>

      {programas.length === 0 && campanas !== null && (
        <Card className="text-center text-ink-500">Crea primero un programa para poder asociarle campañas.</Card>
      )}

      {editandoId !== null && (
        <Card className="animate-fade-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Programa"
              value={formulario.programaId}
              onChange={(e) => setFormulario((f) => ({ ...f, programaId: Number(e.target.value) }))}
              required
            >
              {programas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Select>
            <Input
              label="Título"
              value={formulario.titulo}
              onChange={(e) => setFormulario((f) => ({ ...f, titulo: e.target.value }))}
              required
            />
            <Textarea
              label="Descripción"
              value={formulario.descripcion}
              onChange={(e) => setFormulario((f) => ({ ...f, descripcion: e.target.value }))}
              required
            />
            <Input
              label="Meta (COP)"
              type="number"
              min={1}
              step={1000}
              value={formulario.metaMonto}
              onChange={(e) => setFormulario((f) => ({ ...f, metaMonto: Number(e.target.value) }))}
              required
            />
            {error && <p className="text-sm text-clay-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variante="ghost" onClick={cerrarFormulario}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                {editandoId === "nuevo" ? "Crear campaña" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!campanas ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : campanas.length === 0 ? (
        <Card className="text-center text-ink-500">Aún no hay campañas registradas.</Card>
      ) : (
        <div className="space-y-3">
          {campanas.map((campana) => (
            <Card key={campana.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink-800">{campana.titulo}</p>
                <p className="mt-1 truncate text-sm text-ink-500">{campana.descripcion}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                  {campana.programa?.nombre ?? "Sin programa"} · Meta: $
                  {Number(campana.metaMonto).toLocaleString("es-CO")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variante="outline" className="!px-3" onClick={() => abrirEdicion(campana)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variante="danger" className="!px-3" onClick={() => eliminar(campana)}>
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
