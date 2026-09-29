import { useEffect, useState, type FormEvent } from "react";
import { Eye, Phone, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { ETIQUETAS_ROL } from "../../types";
import { useAuth } from "../../context/AuthContext";
import type { Rol } from "../../types";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input, Select } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { FichaUsuario } from "./FichaUsuario";

interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  ciudad: string | null;
  rol: Rol;
  creadoEn: string;
  _count: { donaciones: number; inscripciones: number; solicitudes: number };
}

const roles: Rol[] = ["USUARIO", "ADMIN"];

interface FormularioUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

const formularioVacio: FormularioUsuario = { nombre: "", email: "", password: "", rol: "USUARIO" };

function actividad(u: UsuarioAdmin) {
  const partes: string[] = [];
  if (u._count.donaciones > 0) partes.push(`${u._count.donaciones} donación(es)`);
  if (u._count.inscripciones > 0) partes.push(`${u._count.inscripciones} inscripción(es)`);
  if (u._count.solicitudes > 0) partes.push(`${u._count.solicitudes} solicitud(es)`);
  return partes.length > 0 ? partes.join(" · ") : "Sin actividad registrada";
}

export function AdminUsuarios() {
  const { usuario: yo } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [creando, setCreando] = useState(false);
  const [formulario, setFormulario] = useState<FormularioUsuario>(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fichaId, setFichaId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const termino = busqueda.trim().toLowerCase();
  const visibles = usuarios?.filter(
    (u) => !termino || [u.nombre, u.email, u.telefono ?? ""].some((campo) => campo.toLowerCase().includes(termino)),
  );

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const lista = await api.get<UsuarioAdmin[]>("/usuarios");
    setUsuarios(lista);
  }

  function cancelarCreacion() {
    setCreando(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.post("/usuarios", formulario);
      toast.exito("Usuario creado");
      setCreando(false);
      setFormulario(formularioVacio);
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo crear el usuario";
      setError(mensaje);
      toast.fallo("No se pudo crear el usuario", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarRol(usuario: UsuarioAdmin, rol: Rol) {
    setActualizandoId(usuario.id);
    try {
      await api.put(`/usuarios/${usuario.id}/rol`, { rol });
      setUsuarios((actual) => actual?.map((u) => (u.id === usuario.id ? { ...u, rol } : u)) ?? actual);
      toast.exito("Rol actualizado");
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo actualizar el rol";
      toast.fallo("No se pudo actualizar el rol", mensaje);
    } finally {
      setActualizandoId(null);
    }
  }

  async function eliminar(usuario: UsuarioAdmin) {
    if (!confirm(`¿Eliminar la cuenta de "${usuario.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/usuarios/${usuario.id}`);
      toast.exito("Usuario eliminado");
      await cargar();
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo eliminar el usuario";
      toast.fallo("No se pudo eliminar el usuario", mensaje);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-medium text-ink-900">Usuarios</h2>
        {!creando && (
          <Button variante="accent" onClick={() => setCreando(true)}>
            <Plus className="h-4 w-4" /> Nuevo usuario
          </Button>
        )}
      </div>

      {creando && (
        <Modal
          titulo="Nuevo usuario"
          subtitulo="Crea una cuenta y asígnale su rol."
          onClose={cancelarCreacion}
          ancho="max-w-lg"
          pie={
            <>
              <Button type="button" variante="ghost" onClick={cancelarCreacion}>
                Cancelar
              </Button>
              <Button type="submit" form="form-usuario" cargando={guardando}>
                Crear usuario
              </Button>
            </>
          }
        >
          <form id="form-usuario" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              value={formulario.nombre}
              onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
            <Input
              label="Correo"
              type="email"
              value={formulario.email}
              onChange={(e) => setFormulario((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              minLength={8}
              value={formulario.password}
              onChange={(e) => setFormulario((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <Select
              label="Rol"
              value={formulario.rol}
              onChange={(e) => setFormulario((f) => ({ ...f, rol: e.target.value as Rol }))}
              required
            >
              {roles.map((rol) => (
                <option key={rol} value={rol}>
                  {ETIQUETAS_ROL[rol]}
                </option>
              ))}
            </Select>
            {error && <p className="text-sm text-clay-600">{error}</p>}
          </form>
        </Modal>
      )}

      {usuarios && usuarios.length > 0 && (
        <input
          type="search"
          aria-label="Buscar usuarios"
          placeholder="Buscar por nombre, correo o celular"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25 sm:max-w-sm"
        />
      )}

      {!usuarios || !visibles ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : usuarios.length === 0 ? (
        <Card className="text-center text-ink-500">Aún no hay usuarios registrados.</Card>
      ) : visibles.length === 0 ? (
        <Card className="text-center text-ink-500">Nadie coincide con “{busqueda}”.</Card>
      ) : (
        <div className="space-y-3">
          {visibles.map((usuario) => {
            const esUnoMismo = usuario.id === yo?.id;
            return (
              <Card key={usuario.id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-800">{usuario.nombre}</p>
                    <Badge tono={usuario.rol === "ADMIN" ? "success" : "neutral"}>{ETIQUETAS_ROL[usuario.rol]}</Badge>
                    {esUnoMismo && <span className="text-xs text-ink-400">(tú)</span>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-500">
                    {usuario.email}
                    {usuario.telefono && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {usuario.telefono}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{actividad(usuario)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variante="outline" className="!px-3" onClick={() => setFichaId(usuario.id)}>
                    <Eye className="h-4 w-4" /> Ver ficha
                  </Button>
                  <select
                    aria-label="Rol"
                    value={usuario.rol}
                    disabled={esUnoMismo || actualizandoId === usuario.id}
                    onChange={(e) => cambiarRol(usuario, e.target.value as Rol)}
                    className="w-40 rounded-xl border border-ink-200 bg-cream-50 px-3 py-2 text-sm text-ink-800 transition-colors focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {roles.map((rol) => (
                      <option key={rol} value={rol}>
                        {ETIQUETAS_ROL[rol]}
                      </option>
                    ))}
                  </select>
                  <Button
                    variante="danger"
                    className="!px-3"
                    disabled={esUnoMismo}
                    onClick={() => eliminar(usuario)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {fichaId !== null && <FichaUsuario usuarioId={fichaId} onClose={() => setFichaId(null)} />}
    </div>
  );
}
