import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
  ETIQUETAS_TIPO_APOYO,
  ETIQUETAS_TIPO_DOCUMENTO,
  type Programa,
  type TipoApoyo,
  type TipoDocumento,
} from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "../../components/ui/Field";
import { PageHeader } from "../../components/PageHeader";
import { useToast } from "../../components/ui/Toast";

interface FormularioSolicitud {
  nombreCompleto: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  personasACargo: number;
  tipoApoyo: TipoApoyo;
  descripcion: string;
  aceptaTratamientoDatos: boolean;
}

const formularioVacio: FormularioSolicitud = {
  nombreCompleto: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  telefono: "",
  direccion: "",
  ciudad: "",
  personasACargo: 1,
  tipoApoyo: "ALIMENTOS",
  descripcion: "",
  aceptaTratamientoDatos: false,
};

export function BeneficiariosPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [programaId, setProgramaId] = useState<number | "">("");
  const [form, setForm] = useState<FormularioSolicitud>(formularioVacio);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Programa[]>("/programas").then((lista) => {
      setProgramas(lista);
      if (lista.length > 0) setProgramaId(lista[0].id);
    });
  }, []);

  useEffect(() => {
    if (usuario) setForm((f) => ({ ...f, nombreCompleto: f.nombreCompleto || usuario.nombre }));
  }, [usuario]);

  function actualizar<K extends keyof FormularioSolicitud>(campo: K, valor: FormularioSolicitud[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usuario) {
      window.location.href = "/auth";
      return;
    }
    if (!form.aceptaTratamientoDatos) {
      setError("Debes autorizar el tratamiento de tus datos personales para continuar.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await api.post("/beneficiarios", { ...form, programaId });
      setEnviado(true);
      setForm({ ...formularioVacio, nombreCompleto: usuario.nombre });
      toast.exito("Solicitud enviada", "Un administrador la revisará pronto.");
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo enviar la solicitud";
      setError(mensaje);
      toast.fallo("No se pudo enviar la solicitud", mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Beneficiarios"
        titulo="Solicitar"
        acento="ayuda"
        descripcion="Cuéntanos quién eres y qué necesitas. Un administrador de Casa Minuto de Dios revisará tu solicitud."
      />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <Card className="animate-fade-up">
          {enviado ? (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 animate-pop place-items-center rounded-full bg-royal-50 text-royal-600 ring-4 ring-gold-200">
                <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
              </div>
              <h3 className="font-serif text-lg font-medium text-ink-900">Solicitud enviada</h3>
              <p className="mt-1 text-sm text-ink-500">
                Puedes ver el estado de tu solicitud en tu panel de seguimiento.
              </p>
              <Button className="mt-6" onClick={() => setEnviado(false)}>
                Enviar otra solicitud
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-ink-900">Datos personales</h3>

                <Input
                  label="Nombre completo"
                  value={form.nombreCompleto}
                  onChange={(e) => actualizar("nombreCompleto", e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Tipo de documento"
                    value={form.tipoDocumento}
                    onChange={(e) => actualizar("tipoDocumento", e.target.value as TipoDocumento)}
                    required
                  >
                    {Object.entries(ETIQUETAS_TIPO_DOCUMENTO).map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>
                        {etiqueta}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Número de documento"
                    value={form.numeroDocumento}
                    onChange={(e) => actualizar("numeroDocumento", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Teléfono de contacto"
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => actualizar("telefono", e.target.value)}
                    required
                  />
                  <Input
                    label="Personas a cargo"
                    type="number"
                    min={0}
                    value={form.personasACargo}
                    onChange={(e) => actualizar("personasACargo", Number(e.target.value))}
                    required
                  />
                </div>

                <Input
                  label="Dirección de residencia"
                  value={form.direccion}
                  onChange={(e) => actualizar("direccion", e.target.value)}
                  required
                />

                <Input
                  label="Ciudad"
                  value={form.ciudad}
                  onChange={(e) => actualizar("ciudad", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4 border-t border-ink-200 pt-6">
                <h3 className="font-serif text-lg font-medium text-ink-900">Tu solicitud</h3>

                <Select
                  label="Programa"
                  value={programaId}
                  onChange={(e) => setProgramaId(Number(e.target.value))}
                  required
                >
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Tipo de apoyo requerido"
                  value={form.tipoApoyo}
                  onChange={(e) => actualizar("tipoApoyo", e.target.value as TipoApoyo)}
                  required
                >
                  {Object.entries(ETIQUETAS_TIPO_APOYO).map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {etiqueta}
                    </option>
                  ))}
                </Select>

                <Textarea
                  label="Describe tu situación y qué ayuda necesitas"
                  value={form.descripcion}
                  onChange={(e) => actualizar("descripcion", e.target.value)}
                  required
                  minLength={10}
                />
              </div>

              <div className="border-t border-ink-200 pt-6">
                <Checkbox
                  label="Autorizo a Casa Minuto de Dios y a la Corporación Minuto de Dios a tratar mis datos personales según la Ley 1581 de 2012, con el único fin de gestionar esta solicitud de ayuda."
                  checked={form.aceptaTratamientoDatos}
                  onChange={(e) => actualizar("aceptaTratamientoDatos", e.target.checked)}
                  required
                />
              </div>

              {error && <p className="text-sm text-clay-600">{error}</p>}

              <Button type="submit" variante="accent" className="w-full" cargando={enviando}>
                Enviar solicitud
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
