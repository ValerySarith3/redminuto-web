import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { AdminUsuarios } from "./AdminUsuarios";
import { AdminProgramas } from "./AdminProgramas";
import { AdminCampanas } from "./AdminCampanas";
import { AdminVoluntariado } from "./AdminVoluntariado";
import { AdminSolicitudes } from "./AdminSolicitudes";

type Pestana = "usuarios" | "programas" | "campanas" | "voluntariado" | "solicitudes";

const pestanas: { id: Pestana; label: string }[] = [
  { id: "usuarios", label: "Usuarios" },
  { id: "programas", label: "Programas" },
  { id: "campanas", label: "Campañas" },
  { id: "voluntariado", label: "Voluntariado" },
  { id: "solicitudes", label: "Solicitudes de ayuda" },
];

export function AdminPage() {
  const [pestana, setPestana] = useState<Pestana>("usuarios");

  return (
    <div>
      <PageHeader
        eyebrow="Panel administrativo"
        titulo="Gestión de"
        acento="Casa Minuto de Dios"
        descripcion="Administra usuarios, programas y campañas, y revisa las inscripciones de voluntariado y las solicitudes de ayuda."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap gap-1 rounded-full bg-ink-100 p-1 sm:inline-flex">
          {pestanas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestana(p.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                pestana === p.id ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {pestana === "usuarios" && <AdminUsuarios />}
        {pestana === "programas" && <AdminProgramas />}
        {pestana === "campanas" && <AdminCampanas />}
        {pestana === "voluntariado" && <AdminVoluntariado />}
        {pestana === "solicitudes" && <AdminSolicitudes />}
      </div>
    </div>
  );
}
