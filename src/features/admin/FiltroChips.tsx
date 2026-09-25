// Fila de filtros por estado con su conteo (Donaciones, Voluntariado, Solicitudes).
export function FiltroChips<T extends string>({
  opciones,
  valor,
  onChange,
}: {
  opciones: { id: T; label: string; cantidad: number }[];
  valor: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            valor === o.id
              ? "border-royal-600 bg-royal-600 text-white"
              : "border-ink-200 bg-cream-50 text-ink-600 hover:border-royal-400"
          }`}
        >
          {o.label}
          <span
            className={`rounded-full px-1.5 tabular-nums ${valor === o.id ? "bg-white/20" : "bg-ink-100 text-ink-500"}`}
          >
            {o.cantidad}
          </span>
        </button>
      ))}
    </div>
  );
}
