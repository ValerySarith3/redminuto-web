import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

type Variante = "blob" | "fade";

interface BrandImageProps {
  src: string;
  alt: string;
  className?: string;
  variante?: Variante;
  tinte?: "royal" | "gold" | "none";
  inclinar?: boolean;
  accento?: ReactNode;
}

export function BrandImage({
  src,
  alt,
  className = "",
  variante = "blob",
  tinte = "royal",
  inclinar = true,
  accento,
}: BrandImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const transform = useMotionTemplate`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!inclinar || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 10);
    rx.set(py * -10);
  }
  function onMouseLeave() {
    rx.set(0);
    ry.set(0);
  }

  if (variante === "fade") {
    return (
      <div className={`relative ${className}`}>
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{
            maskImage: "radial-gradient(ellipse 78% 82% at 50% 42%, black 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 78% 82% at 50% 42%, black 55%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  const tinteEstilo: CSSProperties =
    tinte === "none"
      ? {}
      : {
          backgroundImage:
            tinte === "gold"
              ? "linear-gradient(140deg, var(--color-gold-500), var(--color-royal-700))"
              : "linear-gradient(140deg, var(--color-royal-700), var(--color-gold-400))",
          mixBlendMode: "color",
          opacity: 0.55,
        };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transform, animation: "blob-morph 10s ease-in-out infinite" }}
      className={`group/img relative overflow-hidden shadow-2xl shadow-royal-900/25 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full scale-[1.03] object-cover grayscale-[0.35] contrast-[1.08] transition-transform duration-700 ease-out group-hover/img:scale-110"
      />
      {tinte !== "none" && <div className="pointer-events-none absolute inset-0" style={tinteEstilo} />}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" />
      {accento}
    </motion.div>
  );
}
