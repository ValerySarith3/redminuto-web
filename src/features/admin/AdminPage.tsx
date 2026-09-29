import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FolderHeart,
  HandCoins,
  HandHeart,
  LayoutDashboard,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  ScrollText,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import { AdminResumen } from "./AdminResumen";
import { AdminLogCambios } from "./AdminLogCambios";
import { AdminUsuarios } from "./AdminUsuarios";
import { AdminProgramas } from "./AdminProgramas";
import { AdminCampanas } from "./AdminCampanas";
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
    ],
  },
  {
    titulo: "Administración",
    items: [
      { id: "usuarios", label: "Usuarios", icono: UserCog },
      { id: "log-cambios", label: "Log de cambios", icono: ScrollText },
    ],
  },
];

const secciones = grupos.flatMap((g) => g.items);

const CLAVE_MENU = "redminuto_menu_compacto";

function leerCompacto() {
  try {
    return localStorage.getItem(CLAVE_MENU) === "1";
  } catch {
    return false;
  }
}

export function AdminPage() {
  const [params, setParams] = useSearchParams();
  const seccion = (secciones.find((s) => s.id === params.get("seccion"))?.id ?? "resumen") as Seccion;
  const filtro = params.get("filtro") ?? undefined;
  const [pendientes, setPendientes] = useState<Pendientes | null>(null);
  const [compacto, setCompacto] = useState(leerCompacto);

  function alternarMenu() {
    setCompacto((actual) => {
      try {
        localStorage.setItem(CLAVE_MENU, actual ? "0" : "1");
      } catch {
        // Si no se puede recordar, igual se cambia en esta visita.
      }
      return !actual;
    });
  }

  const irA: IrA = useCallback(
    (destino, nuevoFiltro) => {
      const siguiente = new URLSearchParams({ seccion: destino });
      if (nuevoFiltro) siguiente.set("filtro", nuevoFiltro);
      setParams(siguiente);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams],
  );

  useEffect(() => {
    api.get<Pendientes>("/reportes/pendientes").then(setPendientes).catch(() => setPendientes(null));
  }, [seccion]);

  return (
    <div
      className={`mx-auto px-4 pb-16 pt-24 sm:px-6 print:max-w-none print:p-0 ${compacto ? "max-w-[100rem]" : "max-w-7xl"}`}
    >
      <div
        className={`lg:grid lg:gap-8 lg:transition-[grid-template-columns] lg:duration-300 ${
          compacto ? "lg:grid-cols-[4rem_1fr]" : "lg:grid-cols-[15rem_1fr]"
        }`}
      >
        <aside className="mb-6 print:hidden lg:mb-0">
          <nav className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-4 [scrollbar-width:thin]">
            <div
              className={`mb-4 hidden items-center gap-2 rounded-2xl bg-gradient-to-br from-royal-700 to-royal-900 text-white lg:flex ${
                compacto ? "justify-center px-0 py-2" : "px-4 py-3"
              }`}
            >
              {!compacto && (
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">Panel administrativo</p>
                  <p className="mt-0.5 font-serif text-sm">Casa Minuto de Dios</p>
                </div>
              )}
              <button
                type="button"
                onClick={alternarMenu}
                title={compacto ? "Expandir menú" : "Comprimir menú"}
                aria-label={compacto ? "Expandir menú" : "Comprimir menú"}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-royal-100 transition-colors hover:bg-white/15 hover:text-white"
              >
                {compacto ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-4 lg:overflow-visible lg:px-0 lg:pb-0">
              {grupos.map((grupo, indice) => (
                <div key={grupo.titulo} className="flex shrink-0 gap-2 lg:block lg:space-y-0.5">
                  {compacto ? (
                    indice > 0 && <div className="mx-3 mb-2 hidden border-t border-ink-200 lg:block" aria-hidden="true" />
                  ) : (
                    <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400 lg:block">
                      {grupo.titulo}
                    </p>
                  )}
                  {grupo.items.map((item) => {
                    const activo = seccion === item.id;
                    const cuenta = item.pendiente && pendientes ? pendientes[item.pendiente] : 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => irA(item.id)}
                        title={compacto ? item.label : undefined}
                        aria-label={item.label}
                        className={`group relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all lg:w-full lg:rounded-xl ${
                          compacto ? "lg:justify-center lg:px-0 lg:py-2.5" : ""
                        } ${
                          activo
                            ? "bg-royal-600 text-white shadow-md shadow-royal-900/20"
                            : "bg-cream-50 text-ink-600 hover:bg-royal-50 hover:text-royal-800 lg:bg-transparent"
                        }`}
                      >
                        <item.icono
                          className={`h-4 w-4 ${activo ? "text-white" : "text-ink-400 group-hover:text-royal-600"}`}
                        />
                        <span className={`flex-1 text-left ${compacto ? "lg:hidden" : ""}`}>{item.label}</span>
                        {cuenta > 0 && (
                          <span
                            className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                              activo ? "bg-white text-royal-700" : "bg-gold-400 text-royal-900"
                            } ${compacto ? "lg:absolute lg:-right-1 lg:-top-1 lg:min-w-4 lg:px-1 lg:py-0 lg:text-[10px]" : ""}`}
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
          {seccion === "log-cambios" && <AdminLogCambios />}
          {seccion === "donaciones" && <AdminDonaciones filtroInicial={filtro} />}
          {seccion === "voluntariado" && <AdminVoluntariado filtroInicial={filtro} />}
          {seccion === "solicitudes" && <AdminSolicitudes filtroInicial={filtro} />}
          {seccion === "programas" && <AdminProgramas />}
          {seccion === "campanas" && <AdminCampanas />}
          {seccion === "usuarios" && <AdminUsuarios />}
        </main>
      </div>
    </div>
  );
}
