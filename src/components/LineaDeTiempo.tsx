import { ETIQUETAS_ESTADO, type CambioEstado } from "../types";

const formato = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

// Historial de estados de una donación, inscripción o solicitud: la trazabilidad que ve el propio usuario.
export function LineaDeTiempo({ historial }: { historial: CambioEstado[] }) {
  if (historial.length === 0) return null;
  return (
    <ol className="mt-4 space-y-3 border-l border-ink-200 pl-4">
      {historial.map((h, i) => {
        const ultimo = i === historial.length - 1;
        return (
          <li key={`${h.creadoEn}-${i}`} className="relative">
            <span
              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-cream-50 ${
                ultimo ? "bg-royal-600" : "bg-ink-300"
              }`}
            />
            <p className={`text-xs font-semibold ${ultimo ? "text-ink-800" : "text-ink-500"}`}>
              {h.estadoAnterior ? `${ETIQUETAS_ESTADO[h.estadoAnterior] ?? h.estadoAnterior} → ` : ""}
              {ETIQUETAS_ESTADO[h.estadoNuevo] ?? h.estadoNuevo}
              {h.porAdmin && <span className="font-normal text-ink-400"> · Casa Minuto de Dios</span>}
            </p>
            <p className="text-[11px] text-ink-400">
              {formato.format(new Date(h.creadoEn))}
              {h.nota ? ` · ${h.nota}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
