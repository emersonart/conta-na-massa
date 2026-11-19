import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

  const variants = {
    primary: 'bg-[#E85D04] hover:bg-[#DC2F02] active:bg-[#D00000] text-white shadow-warm hover:shadow-warm-md focus:ring-[#E85D04]/40 font-semibold',
    secondary: 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-warm hover:shadow-warm-md focus:ring-[#2D6A4F]/40 font-semibold',
    outline: 'border border-[#E5DDD0] bg-white hover:bg-[#FDFBF7] text-[#212529] hover:border-[#E85D04]/50 focus:ring-[#E85D04]/20 shadow-2xs',
    ghost: 'bg-transparent hover:bg-[#F0EAE1]/70 text-[#343A40] hover:text-[#212529] focus:ring-slate-400/20',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-warm focus:ring-rose-500/30 font-semibold',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[42px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[48px] font-semibold',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
