import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  FileBarChart,
  FolderHeart,
  HandCoins,
  HandHeart,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import { AdminResumen } from "./AdminResumen";
import { AdminReporte } from "./AdminReporte";
import { AdminUsuarios } from "./AdminUsuarios";
import { AdminProgramas } from "./AdminProgramas";
import { AdminCampanas } from "./AdminCampanas";
import { AdminActividades } from "./AdminActividades";
import { AdminDonaciones } from "./AdminDonaciones";
import { AdminVoluntariado } from "./AdminVoluntariado";
import { AdminSolicitudes } from "./AdminSolicitudes";
import type { IrA, Pendientes, Seccion } from "./reportes";

interface ItemMenu {
  id: Seccion;
  label: string;
  icono: LucideIcon;
  pendiente?: keyof Pendientes;
}

const grupos: { titulo: string; items: ItemMenu[] }[] = [
  {
    titulo: "Resumen",
    items: [
      { id: "resumen", label: "Tablero", icono: LayoutDashboard },
      { id: "reporte", label: "Reportes", icono: FileBarChart },
    ],
  },
  {
    titulo: "Seguimiento",
    items: [
      { id: "donaciones", label: "Donaciones", icono: HandCoins, pendiente: "donaciones" },
      { id: "voluntariado", label: "Voluntariado", icono: HandHeart, pendiente: "inscripciones" },
      { id: "solicitudes", label: "Solicitudes de ayuda", icono: LifeBuoy, pendiente: "solicitudes" },
    ],
  },
  {
    titulo: "Contenido",
    items: [
      { id: "programas", label: "Programas", icono: FolderHeart },
      { id: "campanas", label: "Campañas", icono: Megaphone },
      { id: "actividades", label: "Actividades", icono: CalendarDays },
    ],
  },
  {
    titulo: "Administración",
    items: [{ id: "usuarios", label: "Usuarios", icono: UserCog }],
  },
];

const secciones = grupos.flatMap((g) => g.items);

export function AdminPage() {
  // La sección y el filtro viven en la URL (/admin?seccion=donaciones&filtro=PENDIENTE): sobreviven a un recargo.
  const [params, setParams] = useSearchParams();
  const seccion = (secciones.find((s) => s.id === params.get("seccion"))?.id ?? "resumen") as Seccion;
  const filtro = params.get("filtro") ?? undefined;
  const [pendientes, setPendientes] = useState<Pendientes | null>(null);

  const irA: IrA = useCallback(
    (destino, nuevoFiltro) => {
      const siguiente = new URLSearchParams({ seccion: destino });
      if (nuevoFiltro) siguiente.set("filtro", nuevoFiltro);
      setParams(siguiente);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams],
  );

  // Se recargan al cambiar de sección, así las insignias bajan cuando el admin resuelve algo.
  useEffect(() => {
    api.get<Pendientes>("/reportes/pendientes").then(setPendientes).catch(() => setPendientes(null));
  }, [seccion]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 print:max-w-none print:p-0">
      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
        <aside className="mb-6 print:hidden lg:mb-0">
          <nav className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-4 [scrollbar-width:thin]">
            <div className="mb-4 hidden rounded-2xl bg-gradient-to-br from-royal-700 to-royal-900 px-4 py-3 text-white lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">Panel administrativo</p>
              <p className="mt-0.5 font-serif text-sm">Casa Minuto de Dios</p>
            </div>

            {/* Móvil: una fila deslizable. Escritorio: menú lateral agrupado. */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-4 lg:overflow-visible lg:px-0 lg:pb-0">
              {grupos.map((grupo) => (
                <div key={grupo.titulo} className="flex shrink-0 gap-2 lg:block lg:space-y-0.5">
                  <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400 lg:block">
                    {grupo.titulo}
                  </p>
                  {grupo.items.map((item) => {
                    const activo = seccion === item.id;
                    const cuenta = item.pendiente && pendientes ? pendientes[item.pendiente] : 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => irA(item.id)}
                        className={`group flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all lg:w-full lg:rounded-xl ${
                          activo
                            ? "bg-royal-600 text-white shadow-md shadow-royal-900/20"
                            : "bg-cream-50 text-ink-600 hover:bg-royal-50 hover:text-royal-800 lg:bg-transparent"
                        }`}
                      >
                        <item.icono
                          className={`h-4 w-4 ${activo ? "text-white" : "text-ink-400 group-hover:text-royal-600"}`}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {cuenta > 0 && (
                          <span
                            className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                              activo ? "bg-white text-royal-700" : "bg-gold-400 text-royal-900"
                            }`}
                          >
                            {cuenta}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>
        </aside>

        <main key={`${seccion}-${filtro ?? ""}`} className="min-w-0 animate-fade-up">
          {seccion === "resumen" && <AdminResumen irA={irA} />}
          {seccion === "reporte" && <AdminReporte />}
          {seccion === "donaciones" && <AdminDonaciones filtroInicial={filtro} />}
          {seccion === "voluntariado" && <AdminVoluntariado filtroInicial={filtro} />}
          {seccion === "solicitudes" && <AdminSolicitudes filtroInicial={filtro} />}
          {seccion === "programas" && <AdminProgramas />}
          {seccion === "campanas" && <AdminCampanas />}
          {seccion === "actividades" && <AdminActividades />}
          {seccion === "usuarios" && <AdminUsuarios />}
        </main>
      </div>
    </div>
  );
}
