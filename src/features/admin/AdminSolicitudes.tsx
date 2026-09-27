import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO_APOYO,
  ETIQUETAS_TIPO_DOCUMENTO,
  type EstadoSolicitud,
  type SolicitudBeneficiario,
} from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { FiltroChips } from "./FiltroChips";

const estados: EstadoSolicitud[] = ["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA"];

type Filtro = "ABIERTAS" | "TODAS" | EstadoSolicitud;
const filtros: Filtro[] = ["ABIERTAS", ...estados, "TODAS"];

function coincide(estado: EstadoSolicitud, filtro: Filtro) {
  if (filtro === "TODAS") return true;
  if (filtro === "ABIERTAS") return estado === "PENDIENTE" || estado === "EN_REVISION";
  return estado === filtro;
}

export function AdminSolicitudes({ filtroInicial }: { filtroInicial?: string }) {
  const toast = useToast();
  const [solicitudes, setSolicitudes] = useState<SolicitudBeneficiario[] | null>(null);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<Filtro>(
    filtros.includes(filtroInicial as Filtro) ? (filtroInicial as Filtro) : "ABIERTAS",
  );

  const visibles = useMemo(
    () => solicitudes?.filter((s) => coincide(s.estado, filtro)) ?? null,
    [solicitudes, filtro],
  );
  const conteo = (f: Filtro) => solicitudes?.filter((s) => coincide(s.estado, f)).length ?? 0;

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const lista = await api.get<SolicitudBeneficiario[]>("/beneficiarios");
    setSolicitudes(lista);
  }

  async function cambiarEstado(solicitud: SolicitudBeneficiario, estado: EstadoSolicitud) {
    setActualizando(solicitud.id);
    try {
      await api.put(`/beneficiarios/${solicitud.id}/estado`, { estado });
      setSolicitudes(
        (actual) => actual?.map((s) => (s.id === solicitud.id ? { ...s, estado } : s)) ?? actual,
      );
      toast.exito("Solicitud actualizada");
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "No se pudo actualizar la solicitud";
      toast.fallo("No se pudo actualizar la solicitud", mensaje);
    } finally {
      setActualizando(null);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-medium text-ink-900">Solicitudes de ayuda</h2>
      <FiltroChips
        valor={filtro}
        onChange={setFiltro}
        opciones={filtros.map((f) => ({
          id: f,
          label: f === "TODAS" ? "Todas" : f === "ABIERTAS" ? "Abiertas" : ETIQUETAS_ESTADO[f],
          cantidad: conteo(f),
        }))}
      />

      {!visibles ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : visibles.length === 0 ? (
        <Card className="text-center text-ink-500">No hay solicitudes en este filtro.</Card>
      ) : (
        <div className="space-y-3">
          {visibles.map((solicitud) => (
            <Card key={solicitud.id} className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-800">{solicitud.nombreCompleto}</p>
                  <Badge>{solicitud.estado}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {ETIQUETAS_TIPO_DOCUMENTO[solicitud.tipoDocumento]} {solicitud.numeroDocumento} · {solicitud.telefono}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {solicitud.direccion}, {solicitud.ciudad} · {solicitud.personasACargo}{" "}
                  {solicitud.personasACargo === 1 ? "persona a cargo" : "personas a cargo"}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  Cuenta: {solicitud.beneficiario?.nombre} ({solicitud.beneficiario?.email})
                </p>
                <p className="mt-2 text-sm font-semibold text-ink-700">
                  {solicitud.programa?.nombre} · {ETIQUETAS_TIPO_APOYO[solicitud.tipoApoyo]}
                </p>
                <p className="mt-1 max-w-xl text-sm text-ink-600">{solicitud.descripcion}</p>
              </div>
              <div className="w-full shrink-0 sm:w-48">
                <Select
                  label="Estado"
                  value={solicitud.estado}
                  disabled={actualizando === solicitud.id}
                  onChange={(e) => cambiarEstado(solicitud, e.target.value as EstadoSolicitud)}
                >
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {ETIQUETAS_ESTADO[estado]}
                    </option>
                  ))}
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
