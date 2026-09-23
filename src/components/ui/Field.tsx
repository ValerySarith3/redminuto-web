import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseClasses =
  "w-full rounded-xl border border-ink-200 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors duration-150 focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/25";

function Wrapper({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

export function Input({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label}>
      <input className={baseClasses} {...props} />
    </Wrapper>
  );
}

export function Textarea({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label}>
      <textarea className={`${baseClasses} min-h-28 resize-y`} {...props} />
    </Wrapper>
  );
}

export function Select({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label}>
      <select className={baseClasses} {...props}>
        {children}
      </select>
    </Wrapper>
  );
}

export function Checkbox({
  label,
  ...props
}: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-royal-600 focus:ring-2 focus:ring-royal-500/25"
        {...props}
      />
      <span className="text-sm text-ink-600">{label}</span>
    </label>
  );
}
