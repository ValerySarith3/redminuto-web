import { useEffect, useRef, useState } from "react";

export function useCountUp(valor: number, duracionMs = 900) {
  const [mostrado, setMostrado] = useState(0);
  const desdeRef = useRef(0);

  useEffect(() => {
    const desde = desdeRef.current;
    const diferencia = valor - desde;
    if (diferencia === 0) return;
    const inicio = performance.now();

    let frame: number;
    function tick(ahora: number) {
      const progreso = Math.min(1, (ahora - inicio) / duracionMs);
      const facilitado = 1 - Math.pow(1 - progreso, 3);
      setMostrado(desde + diferencia * facilitado);
      if (progreso < 1) frame = requestAnimationFrame(tick);
      else desdeRef.current = valor;
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracionMs]);

  return mostrado;
}
