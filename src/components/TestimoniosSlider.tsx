import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, staggerItem } from "./Reveal";

interface Testimonio {
  nombre: string;
  rol: string;
  texto: string;
}

const testimonios: Testimonio[] = [
  {
    nombre: "Marcela R.",
    rol: "Donante frecuente",
    texto: "Puedo ver exactamente en qué campaña quedó mi aporte y cómo va avanzando la meta. Eso me da mucha confianza.",
  },
  {
    nombre: "Julián T.",
    rol: "Voluntario · Programa de educación",
    texto: "Me inscribí un viernes y el lunes ya tenía mi cupo confirmado. El seguimiento del programa se siente muy transparente.",
  },
  {
    nombre: "Doña Aracelly",
    rol: "Beneficiaria",
    texto: "Envié mi solicitud desde el celular y pude seguir el estado sin tener que llamar a nadie. Me sentí acompañada todo el proceso.",
  },
  {
    nombre: "Camilo P.",
    rol: "Donante",
    texto: "Que cada minuto cuente de verdad se nota: los porcentajes de recaudo se actualizan apenas uno dona.",
  },
];

export function TestimoniosSlider() {
  const trackRef = useRef<HTMLDivElement>(null);

  function desplazar(direccion: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const tarjeta = track.querySelector("article");
    const ancho = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : 320;
    track.scrollBy({ left: direccion * ancho, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <Reveal className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-royal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Voces de la comunidad
          </p>
          <h2 className="mt-2 font-serif text-2xl font-medium text-ink-900">Lo que dice quien ya participa</h2>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => desplazar(-1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:border-royal-400 hover:text-royal-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => desplazar(1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:border-royal-400 hover:text-royal-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Reveal>

      <StaggerGroup espaciado={0.08}>
        <div ref={trackRef} className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {testimonios.map((t) => (
            <StaggerItem
              key={t.nombre}
              variants={staggerItem}
              className="relative w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-ink-200 bg-cream-50 p-6 shadow-sm shadow-royal-900/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-royal-300 hover:shadow-lg hover:shadow-royal-900/10 sm:w-[46%] lg:w-[31%]"
            >
              <Quote
                className="pointer-events-none absolute -right-2 -top-3 h-20 w-20 text-royal-50"
                strokeWidth={1.5}
                fill="currentColor"
              />
              <Quote className="relative h-6 w-6 text-gold-400" strokeWidth={2.2} />
              <p className="relative mt-3 text-sm leading-relaxed text-ink-700">"{t.texto}"</p>
              <div className="relative mt-4 flex items-center gap-2 border-t border-ink-100 pt-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-royal-500 to-royal-700 text-xs font-semibold text-white">
                  {t.nombre.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{t.nombre}</p>
                  <p className="text-xs text-ink-500">{t.rol}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerGroup>
    </div>
  );
}
