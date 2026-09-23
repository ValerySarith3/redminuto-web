import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LogoMark } from "../../components/LogoMark";
import type { Rol } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Field";
import { useToast } from "../../components/ui/Toast";

const beneficios = [
  { icono: Sparkles, texto: "Dona, hazte voluntario o solicita ayuda en un solo lugar" },
  { icono: LayoutDashboard, texto: "Sigue el avance real de cada campaña y programa" },
  { icono: ShieldCheck, texto: "Tus datos viajan cifrados y tu sesión con JWT" },
];

export function AuthPage() {
  const { login, registrarse } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [modo, setModo] = useState<"login" | "registro">("login");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("DONANTE");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      let usuarioSesion;
      if (modo === "login") {
        usuarioSesion = await login(email, password);
        toast.exito("¡Bienvenido de vuelta!");
      } else {
        usuarioSesion = await registrarse({ nombre, email, password, rol });
        toast.exito("¡Cuenta creada!", `Ya puedes participar como ${rol.toLowerCase()}`);
      }
      navigate(usuarioSesion.rol === "ADMIN" ? "/admin" : "/");
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Ocurrió un error";
      setError(mensaje);
      toast.fallo("No pudimos completar la acción", mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen pt-20 lg:grid-cols-2">
      <div className="dot-grid relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-royal-900 via-royal-800 to-royal-950 p-12 text-white lg:flex">
        <img
          src="/images/slide-ayuda.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-royal-900/90 via-royal-800/80 to-royal-950/95" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 animate-blob rounded-full bg-royal-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-56 w-56 animate-blob rounded-full bg-gold-400/20 blur-3xl [animation-delay:3s]" />

        <div className="relative flex items-center gap-2 font-serif text-xl italic font-semibold">
          <LogoMark className="h-9 w-9" />
          RedMinuto
        </div>

        <div className="relative animate-fade-up">
          <h2 className="font-serif text-3xl font-medium leading-tight">
            Tu apoyo, con <span className="font-serif-accent text-gold-300">seguimiento real</span> y transparente
          </h2>
          <div className="mt-8 space-y-4 border-t border-white/15 pt-6">
            {beneficios.map((b) => (
              <div key={b.texto} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10">
                  <b.icono className="h-3.5 w-3.5 text-gold-300" strokeWidth={2} />
                </span>
                <p className="text-sm text-royal-100/80">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-royal-300">Casa Minuto de Dios · Corporación Minuto de Dios</p>
      </div>

      <div className="flex items-center justify-center bg-cream-100 px-6 py-16">
        <div className="w-full max-w-md animate-fade-up">
          <Card>
            <div className="mb-6 flex gap-1 rounded-full bg-ink-100 p-1">
              <button
                type="button"
                onClick={() => setModo("login")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                  modo === "login" ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => setModo("registro")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                  modo === "registro" ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
                }`}
              >
                Registrarme
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modo === "registro" && (
                <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              )}
              <Input
                label="Correo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {modo === "registro" && (
                <Select label="Quiero participar como" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                  <option value="DONANTE">Donante</option>
                  <option value="VOLUNTARIO">Voluntario</option>
                  <option value="BENEFICIARIO">Beneficiario</option>
                </Select>
              )}

              {error && <p className="text-sm text-clay-600">{error}</p>}

              <Button type="submit" variante="accent" className="w-full" cargando={cargando}>
                {modo === "login" ? "Ingresar" : "Crear cuenta"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
