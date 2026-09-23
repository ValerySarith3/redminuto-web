# RedMinuto Web

Frontend de **RedMinuto**, la plataforma de Casa Minuto de Dios para donaciones, voluntariado y solicitudes de ayuda, con seguimiento en tiempo real. Construido con React 19, React Router, Tailwind CSS v4 y Framer Motion.

Este proyecto consume la API del proyecto hermano `redminuto-api`. Para las credenciales del usuario administrador y la puesta en marcha de la base de datos MySQL, consulta el `README.md` de `redminuto-api`.

## Puesta en marcha

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y ajusta `VITE_API_URL` si tu API no corre en `http://localhost:4000/api`:
   ```
   cp .env.example .env
   ```
3. Asegúrate de que `redminuto-api` esté corriendo (ver su README).
4. Levanta el servidor de desarrollo:
   ```
   npm run dev
   ```

## Scripts

| Script          | Descripción                                   |
|------------------|-------------------------------------------------|
| `npm run dev`    | Servidor de desarrollo con recarga en caliente  |
| `npm run build`  | Compila TypeScript y genera el build de producción en `dist/` |
| `npm run preview`| Sirve el build de producción localmente         |
| `npm run lint`   | Corre Oxlint                                    |

## Rutas principales

| Ruta               | Quién la ve                          | Descripción                                  |
|---------------------|----------------------------------------|-----------------------------------------------|
| `/`                 | Todos                                  | Portada, programas y campañas activas         |
| `/voluntariado`     | Todos (requiere cuenta para inscribirse) | Actividades de voluntariado y cupos           |
| `/beneficiarios`    | Todos (requiere cuenta para enviar)    | Formulario de solicitud de ayuda              |
| `/dashboard`        | Usuarios autenticados                  | Seguimiento personal: donaciones, inscripciones y solicitudes |
| `/auth`             | Visitantes                             | Ingreso y registro                            |
| `/admin`            | Solo rol `ADMIN`                       | Gestión de usuarios, programas, campañas, voluntariado y solicitudes |

## Estructura

```
src/
  components/     Componentes compartidos (Navbar, Reveal, BrandImage, ui/...)
  context/        AuthContext (sesión y token)
  features/       Una carpeta por página/módulo (programas, voluntarios, beneficiarios, dashboard, admin, auth)
  lib/            Cliente HTTP (api.ts) y utilidades
```
