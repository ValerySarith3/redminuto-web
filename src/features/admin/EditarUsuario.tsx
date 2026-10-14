import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { ETIQUETAS_ROL, type Rol } from "../../types";
import { LISTA_TIPO_DOCUMENTO, useOpciones } from "../../lib/listas";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Field";
import { useToast } from "../../components/ui/Toast";

export interface UsuarioEditable {
  tipoDocumento: { id: number; nombre: string } | null;
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  telefono: string | null;
  tipoDocumentoId: number | null;
  numeroDocumento: string | null;
  ciudad: string | null;
}

const roles: Rol[] = ["USUARIO", "ADMIN"];

// Edición completa de una cuenta desde el panel: datos, rol y (opcional) una contraseña nueva.
export function EditarUsuario<T extends UsuarioEditable>({
  usuario,
  esUnoMismo,
  onClose,
  onGuardado,
}: {
  usuario: T;
  esUnoMismo: boolean;
  onClose: () => void;
  onGuardado: (actualizado: T) => void;
}) {
  const toast = useToast();
  const tiposDocumento = useOpciones(LISTA_TIPO_DOCUMENTO);
  const [formulario, setFormulario] = useState({
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    telefono: usuario.telefono ?? "",
    tipoDocumentoId: usuario.tipoDocumentoId ? String(usuario.tipoDocumentoId) : "",
    numeroDocumento: usuario.numeroDocumento ?? "",
    ciudad: usuario.ciudad ?? "",
    password: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function campo<K extends keyof typeof formulario>(clave: K, valor: (typeof formulario)[K]) {
    setFormulario((f) => ({ ...f, [clave]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const { password } = formulario;
    if (password && (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))) {
      setError("La contraseña nueva debe tener al menos 8 caracteres, con letras y números.");
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await api.put<T>(`/usuarios/${usuario.id}`, formulario);
      toast.exito(
        "Usuario actualizado",
        password ? `Comparte la contraseña nueva con ${actualizado.nombre} por un medio seguro.` : undefined,
      );
      onGuardado(actualizado);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo actualizar el usuario";
      setError(mensaje);
      toast.fallo("No se pudo actualizar el usuario", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo="Editar usuario"
      subtitulo={`Actualiza los datos, el rol o la contraseña de ${usuario.nombre}.`}
      onClose={onClose}
      ancho="max-w-2xl"
      pie={
        <>
          <Button type="button" variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-editar-usuario" cargando={guardando}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <form id="form-editar-usuario" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre" value={formulario.nombre} onChange={(e) => campo("nombre", e.target.value)} required />
        <Input
          label="Correo"
          type="email"
          value={formulario.email}
          onChange={(e) => campo("email", e.target.value)}
          required
        />
        <Select
          label="Rol"
          value={formulario.rol}
          disabled={esUnoMismo}
          title={esUnoMismo ? "No puedes cambiar tu propio rol" : undefined}
          onChange={(e) => campo("rol", e.target.value as Rol)}
          required
        >
          {roles.map((rol) => (
            <option key={rol} value={rol}>
              {ETIQUETAS_ROL[rol]}
            </option>
          ))}
        </Select>
        <Input
          label="Celular"
          type="tel"
          value={formulario.telefono}
          onChange={(e) => campo("telefono", e.target.value)}
        />
        <Select
          label="Tipo de documento"
          value={formulario.tipoDocumentoId}
          onChange={(e) => campo("tipoDocumentoId", e.target.value)}
        >
          <option value="">Sin especificar</option>
          {tiposDocumento?.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
          {/* Si el usuario tiene una opción que luego se desactivó, se sigue mostrando para no perderla. */}
          {usuario.tipoDocumento && tiposDocumento && !tiposDocumento.some((t) => t.id === usuario.tipoDocumentoId) && (
            <option value={usuario.tipoDocumento.id}>{usuario.tipoDocumento.nombre}</option>
          )}
        </Select>
        <Input
          label="Número de documento"
          value={formulario.numeroDocumento}
          onChange={(e) => campo("numeroDocumento", e.target.value)}
        />
        <Input label="Ciudad" value={formulario.ciudad} onChange={(e) => campo("ciudad", e.target.value)} />
        <Input
          label="Contraseña nueva (opcional)"
          type="text"
          autoComplete="off"
          placeholder="Déjala vacía para no cambiarla"
          value={formulario.password}
          onChange={(e) => campo("password", e.target.value)}
        />
        {error && <p className="text-sm text-clay-600 sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}
