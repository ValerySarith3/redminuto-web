interface ProgressBarProps {
  porcentaje: number;
  etiqueta?: string;
  compact?: boolean;
}

export function ProgressBar({ porcentaje, etiqueta, compact }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, porcentaje));

  return (
    <div>
      {etiqueta && (
        <div className={`mb-1.5 flex items-center justify-between text-xs text-ink-500 ${compact ? "text-[11px]" : ""}`}>
          <span>{etiqueta}</span>
          <span className="tabular-nums font-semibold text-royal-700">{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-ink-100 ${compact ? "h-1.5" : "h-2"}`}>
        <div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-royal-500 via-royal-600 to-gold-400 transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
