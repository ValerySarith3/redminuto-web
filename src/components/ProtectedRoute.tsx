import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../types";

export function ProtectedRoute({ children, rolRequerido }: { children: ReactNode; rolRequerido?: Rol }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!usuario) return <Navigate to="/auth" replace />;
  if (rolRequerido && usuario.rol !== rolRequerido) return <Navigate to="/" replace />;
  if (!rolRequerido && usuario.rol === "ADMIN") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RutaPublica({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (usuario?.rol === "ADMIN") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
