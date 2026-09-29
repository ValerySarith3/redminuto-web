import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { ETIQUETAS_TIPO_DOCUMENTO, type TipoDocumento, type Usuario } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Field";

const tiposDocumento = Object.keys(ETIQUETAS_TIPO_DOCUMENTO) as TipoDocumento[];

// Se pide una sola vez, antes de la primera inscripción, para que el equipo pueda contactar al voluntario.
export function DatosContactoModal({
  perfil,
  onGuardado,
  onClose,
}: {
  perfil: Usuario | null;
  onGuardado: (perfil: Usuario) => void;
  onClose: () => void;
}) {
  const [telefono, setTelefono] = useState(perfil?.telefono ?? "");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(perfil?.tipoDocumento ?? "CC");
  const [numeroDocumento, setNumeroDocumento] = useState(perfil?.numeroDocumento ?? "");
  const [ciudad, setCiudad] = useState(perfil?.ciudad ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const actualizado = await api.put<Usuario>("/usuarios/yo/contacto", {
        telefono,
        tipoDocumento,
        numeroDocumento,
        ciudad,
      });
      onGuardado(actualizado);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar tus datos");
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Antes de inscribirte" onClose={onClose}>
      <p className="-mt-2 text-sm text-ink-500">
        Déjanos un número de contacto para coordinar contigo la jornada. Solo te lo pedimos esta vez.
      </p>
      <form onSubmit={guardar} className="mt-5 space-y-4">
        <Input
          label="Celular"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="300 123 4567"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          autoFocus
        />
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <Select
            label="Documento"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
          >
            {tiposDocumento.map((t) => (
              <option key={t} value={t}>
                {t === "OTRO" ? "Otro" : t}
              </option>
            ))}
          </Select>
          <Input
            label="Número"
            inputMode="numeric"
            placeholder="Opcional"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
          />
        </div>
        <Input
          label="Ciudad"
          autoComplete="address-level2"
          placeholder="Opcional"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        />
        <p className="rounded-xl bg-royal-50 px-3.5 py-2.5 text-xs text-royal-800">
          Solo el equipo de Casa Minuto de Dios verá estos datos, según la política de tratamiento de datos que ya
          aceptaste.
        </p>
        {error && <p className="text-sm text-clay-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variante="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variante="accent" className="flex-1" cargando={guardando}>
            Guardar e inscribirme
          </Button>
        </div>
      </form>
    </Modal>
  );
}
