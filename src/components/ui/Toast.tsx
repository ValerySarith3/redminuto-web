import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastTono = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  tono: ToastTono;
  titulo: string;
  descripcion?: string;
}

interface ToastContextValue {
  notificar: (toast: Omit<ToastItem, "id">) => void;
  exito: (titulo: string, descripcion?: string) => void;
  fallo: (titulo: string, descripcion?: string) => void;
  info: (titulo: string, descripcion?: string) => void;
  advertencia: (titulo: string, descripcion?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const iconos: Record<ToastTono, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const estilos: Record<ToastTono, string> = {
  success: "border-royal-200 bg-white text-ink-800 [&_svg]:text-royal-600",
  error: "border-clay-100 bg-white text-ink-800 [&_svg]:text-clay-600",
  info: "border-royal-200 bg-white text-ink-800 [&_svg]:text-royal-600",
  warning: "border-gold-200 bg-white text-ink-800 [&_svg]:text-gold-600",
};

const barras: Record<ToastTono, string> = {
  success: "bg-royal-600",
  error: "bg-clay-500",
  info: "bg-royal-500",
  warning: "bg-gold-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [saliendo, setSaliendo] = useState<Set<number>>(new Set());
  const idRef = useRef(0);

  const cerrar = useCallback((id: number) => {
    setSaliendo((actual) => new Set(actual).add(id));
    setTimeout(() => {
      setToasts((actual) => actual.filter((t) => t.id !== id));
      setSaliendo((actual) => {
        const copia = new Set(actual);
        copia.delete(id);
        return copia;
      });
    }, 250);
  }, []);

  const notificar = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = idRef.current++;
      setToasts((actual) => [...actual, { ...toast, id }]);
      setTimeout(() => cerrar(id), 5000);
    },
    [cerrar],
  );

  const value: ToastContextValue = {
    notificar,
    exito: (titulo, descripcion) => notificar({ tono: "success", titulo, descripcion }),
    fallo: (titulo, descripcion) => notificar({ tono: "error", titulo, descripcion }),
    info: (titulo, descripcion) => notificar({ tono: "info", titulo, descripcion }),
    advertencia: (titulo, descripcion) => notificar({ tono: "warning", titulo, descripcion }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map((toast) => {
          const Icono = iconos[toast.tono];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border shadow-lg shadow-royal-900/5 ${estilos[toast.tono]} ${
                saliendo.has(toast.id) ? "animate-toast-out" : "animate-toast-in"
              }`}
            >
              <div className={`absolute inset-y-0 left-0 w-1 ${barras[toast.tono]}`} />
              <div className="flex items-start gap-3 py-3 pl-4 pr-3">
                <Icono className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{toast.titulo}</p>
                  {toast.descripcion && <p className="mt-0.5 text-xs text-ink-500">{toast.descripcion}</p>}
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => cerrar(toast.id)}
                  className="shrink-0 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
