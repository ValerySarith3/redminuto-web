import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// Ventana emergente: encabezado y pie fijos, y el contenido se desplaza por dentro si no cabe en la pantalla.
export function Modal({
  titulo,
  subtitulo,
  onClose,
  children,
  pie,
  ancho = "max-w-md",
}: {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: string;
}) {
  const cerrar = useRef(onClose);
  useEffect(() => {
    cerrar.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") cerrar.current();
    }
    window.addEventListener("keydown", onKeyDown);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-royal-950/50 p-3 backdrop-blur-sm animate-fade-in sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full ${ancho} animate-pop flex-col overflow-hidden rounded-2xl border border-ink-200 bg-cream-50 shadow-2xl shadow-royal-900/20 sm:max-h-[calc(100dvh-3rem)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-ink-100 px-6 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-medium text-ink-900">{titulo}</h3>
            {subtitulo && <div className="mt-0.5 text-sm text-ink-500">{subtitulo}</div>}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="-mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:thin]">{children}</div>
        {pie && <footer className="flex shrink-0 justify-end gap-3 border-t border-ink-100 bg-cream-100/60 px-6 py-3">{pie}</footer>}
      </div>
    </div>
  );
}
