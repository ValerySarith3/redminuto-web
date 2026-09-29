import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LogoMark } from "../../components/LogoMark";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Checkbox, Input } from "../../components/ui/Field";
import { useToast } from "../../components/ui/Toast";

const beneficios = [
  { icono: Sparkles, texto: "Dona, hazte voluntario o solicita ayuda en un solo lugar" },
  { icono: LayoutDashboard, texto: "Sigue el avance real de cada campaña y programa" },
  { icono: ShieldCheck, texto: "Tus datos viajan cifrados y tu sesión con JWT" },
];

const coloresFuerza = ["bg-clay-500", "bg-gold-400", "bg-royal-500"];

// 0 = vacía, 1 = débil, 2 = aceptable (8+ con letras y números), 3 = fuerte
function fuerzaPassword(password: string) {
  if (!password) return 0;
  const cumpleMinimo = password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  if (!cumpleMinimo) return 1;
  return password.length >= 12 || /[^a-zA-Z0-9]/.test(password) ? 3 : 2;
}

export function AuthPage() {
  const { login, registrarse } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [modo, setModo] = useState<"login" | "registro">("login");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [aceptaDatos, setAceptaDatos] = useState(false);
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
        if (fuerzaPassword(password) < 2) throw new Error("La contraseña debe tener al menos 8 caracteres, con letras y números");
        if (password !== confirmacion) throw new Error("Las contraseñas no coinciden");
        if (!aceptaDatos) throw new Error("Debes aceptar la política de tratamiento de datos para registrarte");
        usuarioSesion = await registrarse({ nombre, email, password, aceptaTratamientoDatos: aceptaDatos });
        toast.exito("¡Cuenta creada!", "Ya puedes donar, inscribirte como voluntario o solicitar ayuda.");
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

  const fuerza = fuerzaPassword(password);

  function cambiarModo(nuevo: "login" | "registro") {
    setModo(nuevo);
    setError(null);
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

        <div className="relative flex items-center gap-2 font-serif text-xl font-bold">
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
                onClick={() => cambiarModo("login")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                  modo === "login" ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => cambiarModo("registro")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                  modo === "registro" ? "bg-cream-50 text-royal-700 shadow-sm" : "text-ink-500 hover:text-ink-700"
                }`}
              >
                Registrarme
              </button>
            </div>

            <div className="mb-5">
              <h1 className="text-xl font-bold text-ink-900">
                {modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
              </h1>
              <p className="mt-0.5 text-sm text-ink-500">
                {modo === "login" ? "Ingresa con tu correo y contraseña." : "Te toma menos de un minuto."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modo === "registro" && (
                <Input
                  label="Nombre completo"
                  placeholder="Como aparece en tu documento"
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              )}
              <Input
                label="Correo"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {modo === "login" ? (
                <CampoPassword
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                  visible={verPassword}
                  onToggle={() => setVerPassword((v) => !v)}
                  minLength={6}
                />
              ) : (
                <div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CampoPassword
                      label="Contraseña"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      value={password}
                      onChange={setPassword}
                      visible={verPassword}
                      onToggle={() => setVerPassword((v) => !v)}
                      minLength={8}
                    />
                    <Input
                      label="Confirmar contraseña"
                      type={verPassword ? "text" : "password"}
                      placeholder="Repítela"
                      autoComplete="new-password"
                      value={confirmacion}
                      onChange={(e) => setConfirmacion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1" aria-hidden="true">
                    {[1, 2, 3].map((nivel) => (
                      <span
                        key={nivel}
                        className={`h-1 rounded-full transition-colors ${
                          fuerza >= nivel ? coloresFuerza[fuerza - 1] : "bg-ink-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink-500">Usa al menos 8 caracteres, con letras y números.</p>
                </div>
              )}

              {modo === "registro" && (
                <p className="rounded-xl bg-royal-50 px-3.5 py-2.5 text-xs text-royal-800">
                  Con una sola cuenta puedes donar, inscribirte como voluntario y solicitar ayuda.
                </p>
              )}
              {modo === "registro" && (
                <Checkbox
                  checked={aceptaDatos}
                  onChange={(e) => setAceptaDatos(e.target.checked)}
                  label={
                    <>
                      Autorizo el tratamiento de mis datos personales según la{" "}
                      <Link to="/privacidad" target="_blank" className="font-semibold text-royal-700 underline">
                        política de privacidad
                      </Link>{" "}
                      (Ley 1581 de 2012).
                    </>
                  }
                />
              )}

              {error && <p className="text-sm text-clay-600">{error}</p>}

              <Button type="submit" variante="accent" className="w-full" cargando={cargando}>
                {modo === "login" ? "Ingresar" : "Crear cuenta"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-500">
              {modo === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <button
                type="button"
                onClick={() => cambiarModo(modo === "login" ? "registro" : "login")}
                className="font-semibold text-royal-700 underline hover:text-royal-800"
              >
                {modo === "login" ? "Regístrate aquí" : "Ingresa aquí"}
              </button>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CampoPassword({
  label,
  value,
  onChange,
  visible,
  onToggle,
  ...props
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const Icono = visible ? EyeOff : Eye;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full rounded-xl border border-ink-200 bg-cream-50 py-2.5 pl-3.5 pr-10 text-sm text-ink-800 placeholder:text-ink-400 transition-colors duration-150 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25"
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink-400 hover:text-ink-700"
        >
          <Icono className="h-4 w-4" />
        </button>
      </span>
    </label>
  );
}
