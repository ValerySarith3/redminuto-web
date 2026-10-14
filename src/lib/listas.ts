import { useEffect, useState } from "react";
import { api } from "./api";

// Opción de una lista maestra (catálogo administrable desde el panel).
export interface OpcionLista {
  id: number;
  codigo: string;
  nombre: string;
}

export const LISTA_TIPO_DOCUMENTO = "TIPO_DOCUMENTO";

// Una sola petición por lista mientras la página esté abierta.
const cache = new Map<string, Promise<OpcionLista[]>>();

export function cargarOpciones(codigo: string) {
  let pendiente = cache.get(codigo);
  if (!pendiente) {
    pendiente = api.get<OpcionLista[]>(`/listas/${codigo}/opciones`).catch((e) => {
      cache.delete(codigo);
      throw e;
    });
    cache.set(codigo, pendiente);
  }
  return pendiente;
}

// Tras editar una lista en el panel, los formularios deben volver a pedirla.
export function olvidarOpciones(codigo?: string) {
  if (codigo) cache.delete(codigo);
  else cache.clear();
}

export function useOpciones(codigo: string) {
  const [opciones, setOpciones] = useState<OpcionLista[] | null>(null);
  useEffect(() => {
    let vigente = true;
    cargarOpciones(codigo)
      .then((o) => vigente && setOpciones(o))
      .catch(() => vigente && setOpciones([]));
    return () => {
      vigente = false;
    };
  }, [codigo]);
  return opciones;
}
