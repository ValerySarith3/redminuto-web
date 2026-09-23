import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className = "", hover = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-ink-200 bg-cream-50 p-6 shadow-sm shadow-royal-900/[0.03] transition-all duration-200 ease-out ${
        hover ? "hover:-translate-y-1 hover:border-royal-300 hover:shadow-lg hover:shadow-royal-900/10" : ""
      } ${className}`}
      {...props}
    />
  );
}
