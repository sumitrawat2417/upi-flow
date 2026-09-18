import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: `
    bg-indigo-500 text-white border border-indigo-400/30
    hover:bg-indigo-400
    active:scale-95
    shadow-[0_0_24px_rgba(99,102,241,0.35)]
    hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]
  `,
  secondary: `
    bg-white/5 text-slate-200 border border-white/10
    hover:bg-white/10 hover:border-white/20
    active:scale-95
  `,
  ghost: `
    bg-transparent text-slate-400 border border-transparent
    hover:text-slate-200 hover:bg-white/5
    active:scale-95
  `,
  danger: `
    bg-rose-500/10 text-rose-400 border border-rose-500/25
    hover:bg-rose-500/20 hover:border-rose-500/40
    active:scale-95
  `,
  success: `
    bg-emerald-500/10 text-emerald-400 border border-emerald-500/25
    hover:bg-emerald-500/20 hover:border-emerald-500/40
    active:scale-95
  `,
};

const sizeStyles: Record<Size, string> = {
  sm:  'px-4 py-2 text-sm rounded-xl gap-1.5 h-9',
  md:  'px-5 py-2.5 text-sm rounded-2xl gap-2 h-11',
  lg:  'px-6 py-3.5 text-base rounded-2xl gap-2.5 h-14',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-semibold tracking-tight
        transition-all duration-150 ease-out
        select-none cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};
