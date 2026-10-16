import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './components/ui/Toast.tsx'
// Fuentes servidas desde la propia app (sin depender de Google Fonts).
import '@fontsource-variable/inter'
import '@fontsource-variable/merriweather/wght.css'
import '@fontsource-variable/merriweather/wght-italic.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
