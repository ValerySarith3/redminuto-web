import { useEffect, useState, type FormEvent } from "react";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { olvidarOpciones } from "../../lib/listas";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Checkbox, Input } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";

interface Opcion {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
  activo: boolean;
  enUso: number;
}

interface Lista {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  opciones: Opcion[];
}

interface FormularioOpcion {
  codigo: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

type Edicion = { lista: Lista; opcion: Opcion | null };

// Listas maestras: catálogos (como los tipos de documento) cuyas opciones se administran desde aquí.
export function AdminListas() {
  const toast = useToast();
  const [listas, setListas] = useState<Lista[] | null>(null);
  const [edicion, setEdicion] = useState<Edicion | null>(null);

  useEffect(() => {
    api.get<Lista[]>("/listas").then(setListas);
  }, []);

  function reemplazarOpcion(listaId: number, opcion: Opcion, nueva: boolean) {
    setListas(
      (actual) =>
        actual?.map((l) =>
          l.id !== listaId
            ? l
            : {
                ...l,
                opciones: (nueva ? [...l.opciones, opcion] : l.opciones.map((o) => (o.id === opcion.id ? { ...o, ...opcion } : o))).sort(
                  (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre),
                ),
              },
        ) ?? actual,
    );
  }

  async function eliminar(lista: Lista, opcion: Opcion) {
    if (!confirm(`¿Eliminar la opción "${opcion.nombre}" de la lista "${lista.nombre}"?`)) return;
    try {
      await api.delete(`/listas/opciones/${opcion.id}`);
      setListas(
        (actual) =>
          actual?.map((l) => (l.id === lista.id ? { ...l, opciones: l.opciones.filter((o) => o.id !== opcion.id) } : l)) ??
          actual,
      );
      olvidarOpciones(lista.codigo);
      toast.exito("Opción eliminada");
    } catch (e) {
      toast.fallo("No se pudo eliminar la opción", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-medium text-ink-900">Listas maestras</h2>
        <p className="mt-1 text-sm text-ink-500">
          Las opciones que aparecen en los formularios de la plataforma. Agrega nuevas o desactiva las que ya no se usen.
        </p>
      </div>

      {!listas ? (
        <div className="space-y-3">
          <Skeleton className="h-40" />
        </div>
      ) : listas.length === 0 ? (
        <Card className="text-center text-ink-500">No hay listas maestras registradas.</Card>
      ) : (
        listas.map((lista) => (
          <Card key={lista.id} className="!p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal-600">
                  <ListChecks className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-800">{lista.nombre}</p>
                  {lista.descripcion && <p className="text-xs text-ink-500">{lista.descripcion}</p>}
                </div>
              </div>
              <Button variante="accent" onClick={() => setEdicion({ lista, opcion: null })}>
                <Plus className="h-4 w-4" /> Nueva opción
              </Button>
            </div>

            {lista.opciones.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-ink-400">Esta lista aún no tiene opciones.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {lista.opciones.map((opcion) => (
                  <li key={opcion.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-8 shrink-0 text-center text-xs tabular-nums text-ink-400">{opcion.orden}</span>
                      <div className="min-w-0">
                        <p className={`font-medium ${opcion.activo ? "text-ink-800" : "text-ink-400 line-through"}`}>
                          {opcion.nombre}
                        </p>
                        <p className="text-xs text-ink-400">
                          Código <span className="font-mono">{opcion.codigo}</span> ·{" "}
                          {opcion.enUso > 0 ? `En uso en ${opcion.enUso} registro(s)` : "Sin uso"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tono={opcion.activo ? "success" : "neutral"}>{opcion.activo ? "Activa" : "Inactiva"}</Badge>
                      <Button
                        variante="outline"
                        className="!px-3"
                        aria-label="Editar opción"
                        onClick={() => setEdicion({ lista, opcion })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variante="danger"
                        className="!px-3"
                        aria-label="Eliminar opción"
                        disabled={opcion.enUso > 0}
                        title={opcion.enUso > 0 ? "Está en uso: desactívala en lugar de eliminarla" : undefined}
                        onClick={() => eliminar(lista, opcion)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))
      )}

      {edicion && (
        <EditarOpcion
          edicion={edicion}
          onClose={() => setEdicion(null)}
          onGuardada={(opcion, nueva) => {
            reemplazarOpcion(edicion.lista.id, opcion, nueva);
            olvidarOpciones(edicion.lista.codigo);
            setEdicion(null);
          }}
        />
      )}
    </div>
  );
}

function EditarOpcion({
  edicion,
  onClose,
  onGuardada,
}: {
  edicion: Edicion;
  onClose: () => void;
  onGuardada: (opcion: Opcion, nueva: boolean) => void;
}) {
  const toast = useToast();
  const { lista, opcion } = edicion;
  const siguienteOrden = Math.max(0, ...lista.opciones.map((o) => o.orden)) + 1;
  const [formulario, setFormulario] = useState<FormularioOpcion>(
    opcion
      ? { codigo: opcion.codigo, nombre: opcion.nombre, orden: opcion.orden, activo: opcion.activo }
      : { codigo: "", nombre: "", orden: siguienteOrden, activo: true },
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const guardada = opcion
        ? await api.put<Opcion>(`/listas/opciones/${opcion.id}`, formulario)
        : await api.post<Opcion>(`/listas/${lista.id}/opciones`, formulario);
      toast.exito(opcion ? "Opción actualizada" : "Opción agregada");
      onGuardada({ ...guardada, enUso: opcion?.enUso ?? 0 }, !opcion);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo guardar la opción";
      setError(mensaje);
      toast.fallo("No se pudo guardar la opción", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={opcion ? "Editar opción" : "Nueva opción"}
      subtitulo={lista.nombre}
      onClose={onClose}
      ancho="max-w-lg"
      pie={
        <>
          <Button type="button" variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-opcion-lista" cargando={guardando}>
            {opcion ? "Guardar cambios" : "Agregar"}
          </Button>
        </>
      }
    >
      <form id="form-opcion-lista" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Ej.: Pasaporte"
          maxLength={100}
          value={formulario.nombre}
          onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
          required
          autoFocus
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Código"
            placeholder="Ej.: PA"
            maxLength={30}
            value={formulario.codigo}
            onChange={(e) => setFormulario((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
            required
          />
          <Input
            label="Orden en la lista"
            type="number"
            min={0}
            value={formulario.orden}
            onChange={(e) => setFormulario((f) => ({ ...f, orden: Number(e.target.value) }))}
            required
          />
        </div>
        <Checkbox
          label="Activa (se muestra en los formularios)"
          checked={formulario.activo}
          onChange={(e) => setFormulario((f) => ({ ...f, activo: e.target.checked }))}
        />
        {error && <p className="text-sm text-clay-600">{error}</p>}
      </form>
    </Modal>
  );
}
