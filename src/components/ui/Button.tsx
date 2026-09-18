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
  primary: [
    'bg-amber-400 text-slate-900 border border-amber-300/20',
    'font-semibold tracking-tight',
    'hover:bg-amber-300',
    'active:scale-[0.97] active:bg-amber-500',
    'shadow-[0_1px_16px_rgba(245,158,11,0.3)]',
    'hover:shadow-[0_1px_20px_rgba(245,158,11,0.45)]',
    'disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-white/[0.05] text-slate-200 border border-white/[0.08]',
    'hover:bg-white/[0.09] hover:border-white/[0.14]',
    'active:scale-[0.97]',
  ].join(' '),

  ghost: [
    'bg-transparent text-slate-400 border border-transparent',
    'hover:text-slate-200 hover:bg-white/[0.05]',
    'active:scale-[0.97]',
  ].join(' '),

  danger: [
    'bg-red-500/10 text-red-400 border border-red-500/20',
    'hover:bg-red-500/18 hover:border-red-500/35',
    'active:scale-[0.97]',
  ].join(' '),

  success: [
    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'hover:bg-emerald-500/18 hover:border-emerald-500/35',
    'active:scale-[0.97]',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm:  'px-4 py-2 text-xs rounded-xl gap-1.5 h-9',
  md:  'px-5 py-2.5 text-sm rounded-2xl gap-2 h-11',
  lg:  'px-6 py-3.5 text-[15px] rounded-2xl gap-2.5 h-14',
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
}) => (
  <button
    className={`
      inline-flex items-center justify-center
      font-semibold tracking-[-0.01em]
      transition-all duration-100 ease-out
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
        {icon && iconPosition === 'left'  && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </>
    )}
  </button>
);
