import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-widest text-slate-400"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full h-12 rounded-2xl
            bg-white/[0.04] border border-white/[0.08]
            text-slate-100 placeholder:text-slate-600
            text-sm font-medium
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            outline-none
            transition-all duration-150
            focus:border-indigo-500/60 focus:bg-white/[0.06]
            focus:ring-2 focus:ring-indigo-500/20
            ${error ? 'border-rose-500/50 focus:border-rose-500/60 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
};
