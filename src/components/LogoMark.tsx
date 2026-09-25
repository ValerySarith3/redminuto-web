import iconoLogo from "../assets/logo-icono.png";
import logoCompleto from "../assets/logo-redminuto.png";

// Símbolo del logo real (corazón con las dos personas), recortado de src/assets/LOGO.png.
export function LogoMark({ className = "" }: { className?: string }) {
  return <img src={iconoLogo} alt="" aria-hidden="true" className={`object-contain ${className}`} />;
}

// Logo completo con el nombre y el lema. Solo sobre fondos claros: el "Red" azul marino no se lee sobre azul oscuro.
export function LogoCompleto({ className = "" }: { className?: string }) {
  return <img src={logoCompleto} alt="RedMinuto · Tu aporte, su futuro" className={`object-contain ${className}`} />;
}
