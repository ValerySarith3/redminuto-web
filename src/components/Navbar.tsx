import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoMark } from "./LogoMark";

const links = [
  { to: "/", label: "Programas" },
  { to: "/voluntariado", label: "Voluntariado" },
  { to: "/beneficiarios", label: "Solicitar ayuda" },
  { to: "/dashboard", label: "Mi seguimiento" },
];

export function Navbar() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esInicio = location.pathname === "/";
  const transparente = esInicio && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  const esAdmin = usuario?.rol === "ADMIN";
  const linksVisibles = esAdmin ? [{ to: "/admin", label: "Panel admin" }] : links;
  const inicio = esAdmin ? "/admin" : "/";

  function ir(ruta: string) {
    navigate(ruta);
    setMenuAbierto(false);
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          transparente
            ? "bg-transparent"
            : "border-b border-ink-200 bg-cream-50/85 shadow-sm shadow-royal-900/5 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(true)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              transparente ? "bg-white/10 text-white backdrop-blur-md hover:bg-white/20" : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            <Menu className="h-4 w-4" /> Menú
          </button>

          <NavLink to={inicio} className="flex items-center gap-2">
            <LogoMark className={`h-8 w-8 ${transparente ? "text-white" : "text-royal-700"}`} />
            <span
              className={`font-serif text-lg italic font-semibold transition-colors ${
                transparente ? "text-white" : "text-royal-900"
              }`}
            >
              RedMinuto
            </span>
          </NavLink>

          {usuario ? (
            <button
              type="button"
              onClick={() => navigate(esAdmin ? "/admin" : "/dashboard")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                transparente ? "bg-white/10 text-white backdrop-blur-md hover:bg-white/20" : "bg-royal-50 text-royal-700 hover:bg-royal-100"
              }`}
            >
              {esAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <LayoutDashboard className="h-3.5 w-3.5" />}
              {usuario.nombre.split(" ")[0]}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                transparente ? "bg-gold-400 text-royal-900 hover:bg-gold-300" : "bg-royal-600 text-white hover:bg-royal-700"
              }`}
            >
              Ingresar
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="dot-grid fixed inset-0 z-[60] flex flex-col bg-royal-950/98 text-white backdrop-blur-xl"
          >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
              <div className="flex items-center gap-2">
                <LogoMark className="h-8 w-8 text-white" />
                <span className="font-serif text-lg italic font-semibold">RedMinuto</span>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMenuAbierto(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
              {linksVisibles.map((link, i) => (
                <motion.button
                  key={link.to}
                  type="button"
                  onClick={() => ir(link.to)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-center gap-3 py-3 font-serif text-4xl font-medium text-royal-100/70 transition-colors hover:text-white sm:text-5xl"
                >
                  {link.label}
                  <ArrowUpRight className="h-6 w-6 -translate-x-2 text-gold-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </motion.button>
              ))}
            </nav>

            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-6 text-sm text-royal-200/70">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-300" /> Casa Minuto de Dios · Corporación Minuto de Dios
              </p>
              {usuario ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    ir("/");
                  }}
                  className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Cerrar sesión
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => ir("/auth")}
                  className="rounded-full bg-gold-400 px-4 py-2 font-semibold text-royal-900 transition-colors hover:bg-gold-300"
                >
                  Ingresar / Crear cuenta
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
