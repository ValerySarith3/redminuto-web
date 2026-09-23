import { GraduationCap, HeartHandshake, HomeIcon, UtensilsCrossed, type LucideIcon } from "lucide-react";

const reglas: [RegExp, LucideIcon][] = [
  [/comedor|aliment|nutric/i, UtensilsCrossed],
  [/educ|escolar|colegio|niñ|joven/i, GraduationCap],
  [/vivienda|hogar|casa/i, HomeIcon],
];

export function iconoPrograma(nombre: string): LucideIcon {
  const encontrada = reglas.find(([regex]) => regex.test(nombre));
  return encontrada ? encontrada[1] : HeartHandshake;
}
