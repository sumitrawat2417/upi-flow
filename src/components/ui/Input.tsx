import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label, error, hint, icon, className = '', id, ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="label-sm"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full h-12 rounded-xl
            bg-[#0D1120] border border-white/[0.07]
            text-slate-200 placeholder:text-slate-600
            text-[15px] font-medium tracking-[-0.01em]
            ${icon ? 'pl-10 pr-4' : 'px-4'}
            outline-none
            transition-all duration-100
            focus:border-amber-400/40 focus:bg-[#101624]
            focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]
            ${error
              ? 'border-red-500/40 focus:border-red-500/50 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
              : ''
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <p className="text-xs text-red-400 font-medium mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-600 mt-0.5">{hint}</p>}
    </div>
  );
};
