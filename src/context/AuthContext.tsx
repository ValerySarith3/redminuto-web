import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { Usuario } from "../types";

interface LoginRespuesta {
  token: string;
  usuario: Usuario;
}

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  registrarse: (datos: { nombre: string; email: string; password: string; rol: Usuario["rol"] }) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "redminuto_token";
const USUARIO_KEY = "redminuto_usuario";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem(USUARIO_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (guardado && token) {
      try {
        setUsuario(JSON.parse(guardado));
      } catch {
        localStorage.removeItem(USUARIO_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setCargando(false);
  }, []);

  function guardarSesion(respuesta: LoginRespuesta) {
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
    setUsuario(respuesta.usuario);
  }

  async function login(email: string, password: string) {
    const respuesta = await api.post<LoginRespuesta>("/usuarios/login", { email, password });
    guardarSesion(respuesta);
    return respuesta.usuario;
  }

  async function registrarse(datos: { nombre: string; email: string; password: string; rol: Usuario["rol"] }) {
    const respuesta = await api.post<LoginRespuesta>("/usuarios/registro", datos);
    guardarSesion(respuesta);
    return respuesta.usuario;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrarse, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
