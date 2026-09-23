import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direccion = "up" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  className?: string;
  direccion?: Direccion;
  retraso?: number;
  duracion?: number;
  distancia?: number;
  una_vez?: boolean;
  as?: "div" | "section" | "li";
}

const offsets: Record<Direccion, (d: number) => { x?: number; y?: number }> = {
  up: (d) => ({ y: d }),
  left: (d) => ({ x: -d }),
  right: (d) => ({ x: d }),
  none: () => ({}),
};

export function Reveal({
  children,
  className,
  direccion = "up",
  retraso = 0,
  duracion = 0.7,
  distancia = 28,
  una_vez = true,
  as = "div",
}: RevealProps) {
  const variants: Variants = {
    oculto: { opacity: 0, ...offsets[direccion](distancia) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: duracion, delay: retraso, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const Componente = motion[as];

  return (
    <Componente
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: una_vez, amount: 0.25 }}
      variants={variants}
    >
      {children}
    </Componente>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  espaciado?: number;
  una_vez?: boolean;
}

export function StaggerGroup({ children, className, espaciado = 0.09, una_vez = true }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: una_vez, amount: 0.2 }}
      variants={{ visible: { transition: { staggerChildren: espaciado } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem: Variants = {
  oculto: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export const StaggerItem = motion.div;
