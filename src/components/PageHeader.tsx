import { Reveal } from "./Reveal";

interface PageHeaderProps {
  eyebrow: string;
  titulo: string;
  acento: string;
  descripcion: string;
}

export function PageHeader({ eyebrow, titulo, acento, descripcion }: PageHeaderProps) {
  return (
    <section className="dot-grid-dark relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-royal-50/60 to-cream-50">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 animate-blob rounded-full bg-gold-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 animate-blob rounded-full bg-royal-200/40 blur-3xl [animation-delay:4s]" />

      <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-32">
        <Reveal>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-royal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {eyebrow}
          </p>
        </Reveal>
        <Reveal retraso={0.08}>
          <h1 className="mt-3 font-serif text-4xl font-medium text-ink-900 sm:text-5xl">
            {titulo} <span className="font-serif-accent text-royal-700">{acento}</span>
          </h1>
        </Reveal>
        <Reveal retraso={0.16}>
          <p className="mt-4 max-w-xl text-ink-500">{descripcion}</p>
        </Reveal>
      </div>
    </section>
  );
}
