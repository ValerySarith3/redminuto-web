import iconoLogo from "../assets/logo-icono.png";
import logoCompleto from "../assets/logo-redminuto.png";

export function LogoMark({ className = "" }: { className?: string }) {
  return <img src={iconoLogo} alt="" aria-hidden="true" className={`object-contain ${className}`} />;
}

export function LogoCompleto({ className = "" }: { className?: string }) {
  return <img src={logoCompleto} alt="RedMinuto · Tu aporte, su futuro" className={`object-contain ${className}`} />;
}
