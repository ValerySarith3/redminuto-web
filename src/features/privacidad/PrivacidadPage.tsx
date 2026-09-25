import { PageHeader } from "../../components/PageHeader";
import { Card } from "../../components/ui/Card";

const secciones = [
  {
    titulo: "Responsable del tratamiento",
    texto:
      "Casa Minuto de Dios, sede de la Corporación Minuto de Dios, es responsable de los datos personales que registras en RedMinuto.",
  },
  {
    titulo: "Datos que recogemos",
    texto:
      "Nombre, correo y rol al crear tu cuenta. Si solicitas ayuda: documento de identidad, teléfono, dirección, ciudad, personas a cargo y la descripción de tu necesidad. Si donas: monto, canal y campaña. No almacenamos datos de tarjetas.",
  },
  {
    titulo: "Para qué los usamos",
    texto:
      "Registrar y dar seguimiento a tus donaciones, inscripciones de voluntariado y solicitudes de ayuda; mostrarte su estado; y generar reportes internos de gestión de la sede. No vendemos ni compartimos tus datos con terceros con fines comerciales.",
  },
  {
    titulo: "Tus derechos",
    texto:
      "Según la Ley 1581 de 2012 puedes conocer, actualizar y rectificar tus datos, solicitar prueba de la autorización, ser informado sobre su uso, revocar la autorización y pedir su supresión cuando no exista un deber legal de conservarlos.",
  },
  {
    titulo: "Registro de tu autorización",
    texto:
      "Cada vez que aceptas esta política (al registrarte o al enviar una solicitud de ayuda) guardamos la fecha y la versión aceptada, como prueba de tu consentimiento.",
  },
];

export function PrivacidadPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Ley 1581 de 2012"
        titulo="Política de"
        acento="tratamiento de datos"
        descripcion="Cómo protege RedMinuto la información personal de donantes, voluntarios y beneficiarios. Versión 2026-09."
      />
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-12">
        {secciones.map((s) => (
          <Card key={s.titulo}>
            <h2 className="font-serif text-lg font-medium text-ink-900">{s.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.texto}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
