import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vercel from './vercel.json' with { type: 'json' }

// `vite preview` sirve el build con las mismas cabeceras de seguridad que Vercel, para poder probarlas en local
// (la API local está en localhost:4000 y no hay HTTPS, así que se ajustan esas dos partes).
const cabecerasPreview = Object.fromEntries(
  vercel.headers[0].headers
    .filter((h) => h.key !== 'Strict-Transport-Security' && h.key !== 'Access-Control-Allow-Origin')
    .map((h) => [
      h.key,
      h.key === 'Content-Security-Policy'
        ? h.value.replace('connect-src', 'connect-src http://localhost:4000').replace('; upgrade-insecure-requests', '')
        : h.value,
    ]),
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { headers: cabecerasPreview },
})
