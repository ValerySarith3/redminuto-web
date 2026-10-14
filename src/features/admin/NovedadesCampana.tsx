import { useEffect, useState, type FormEvent } from "react";
import { Megaphone, Pencil, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

interface Novedad {
  id: number;
  titulo: string;
  contenido: string;
  creadoEn: string;
}

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const formularioVacio = { titulo: "", contenido: "" };

// Novedades de impacto de una campaña: las ven en su panel quienes donaron a ella.
export function NovedadesCampana({ campana, onClose }: { campana: { id: number; titulo: string }; onClose: () => void }) {
  const toast = useToast();
  const [novedades, setNovedades] = useState<Novedad[] | null>(null);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Novedad[]>(`/campanas/${campana.id}/novedades`)
      .then(setNovedades)
      .catch(() => setNovedades([]));
  }, [campana.id]);

  function editar(novedad: Novedad) {
    setEditandoId(novedad.id);
    setFormulario({ titulo: novedad.titulo, contenido: novedad.contenido });
    setError(null);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormulario(formularioVacio);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editandoId) {
        const actualizada = await api.put<Novedad>(`/campanas/novedades/${editandoId}`, formulario);
        setNovedades((lista) => lista?.map((n) => (n.id === actualizada.id ? actualizada : n)) ?? lista);
        toast.exito("Novedad actualizada");
      } else {
        const nueva = await api.post<Novedad>(`/campanas/${campana.id}/novedades`, formulario);
        setNovedades((lista) => [nueva, ...(lista ?? [])]);
        toast.exito("Novedad publicada", "Quienes donaron a esta campaña la verán en su panel.");
      }
      cancelarEdicion();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo guardar la novedad";
      setError(mensaje);
      toast.fallo("No se pudo guardar la novedad", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(novedad: Novedad) {
    if (!confirm(`¿Eliminar la novedad "${novedad.titulo}"?`)) return;
    try {
      await api.delete(`/campanas/novedades/${novedad.id}`);
      setNovedades((lista) => lista?.filter((n) => n.id !== novedad.id) ?? lista);
      if (editandoId === novedad.id) cancelarEdicion();
      toast.exito("Novedad eliminada");
    } catch (e) {
      toast.fallo("No se pudo eliminar la novedad", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <Modal
      titulo="Novedades de la campaña"
      subtitulo={campana.titulo}
      onClose={onClose}
      ancho="max-w-2xl"
      pie={
        <Button variante="ghost" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-ink-200 bg-cream-100/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          {editandoId ? "Editar novedad" : "Publicar una novedad"}
        </p>
        <Input
          label="Título"
          maxLength={150}
          placeholder="Ej.: Entregamos 120 mercados en Engativá"
          value={formulario.titulo}
          onChange={(e) => setFormulario((f) => ({ ...f, titulo: e.target.value }))}
          required
        />
        <Textarea
          label="Contenido"
          rows={4}
          maxLength={2000}
          placeholder="Cuenta qué se logró con los aportes: a cuántas personas llegó, qué se entregó, qué sigue."
          value={formulario.contenido}
          onChange={(e) => setFormulario((f) => ({ ...f, contenido: e.target.value }))}
          required
        />
        {error && <p className="text-sm text-clay-600">{error}</p>}
        <div className="flex justify-end gap-2">
          {editandoId && (
            <Button type="button" variante="ghost" onClick={cancelarEdicion}>
              Cancelar
            </Button>
          )}
          <Button type="submit" cargando={guardando}>
            {editandoId ? "Guardar cambios" : "Publicar"}
          </Button>
        </div>
      </form>

      <div className="mt-5">
        {!novedades ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : novedades.length === 0 ? (
          <p className="flex flex-col items-center gap-2 py-6 text-center text-sm text-ink-400">
            <Megaphone className="h-6 w-6" />
            Esta campaña aún no tiene novedades publicadas.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-200">
            {novedades.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-800">{n.titulo}</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-ink-600">{n.contenido}</p>
                  <p className="mt-1 text-xs text-ink-400">{formatoFecha.format(new Date(n.creadoEn))}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variante="outline" className="!px-3" aria-label="Editar novedad" onClick={() => editar(n)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variante="danger" className="!px-3" aria-label="Eliminar novedad" onClick={() => eliminar(n)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
