export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M22 40C12.5 33.2 6 27.4 6 20.4 6 14.9 10.2 11 15.2 11c2.9 0 5.7 1.4 7.4 3.7l1.6 2.1-1.3-2.5C21.5 11.6 23.8 9 27 9c3.4 0 6 2.5 6 6.1 0 1-.2 1.9-.6 2.8"
        fill="none"
        stroke="#FDCE32"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M18 17C18 17 24 21 24 29c0-8 6-12 6-12 6 0 10.5 4.3 10.5 9.7 0 6.5-6.1 11.9-16.5 19.3C13.6 39.6 7.5 34.2 7.5 27.7 7.5 22.3 12 18 18 18Z"
        fill="currentColor"
        className="text-royal-600"
      />
    </svg>
  );
}
