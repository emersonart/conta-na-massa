import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sage' | 'paprika' | 'mustard' | 'charcoal' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'sage',
  size = 'md',
  ...props
}) => {
  const variants = {
    sage: 'bg-[#D8F3DC] text-[#2D6A4F] border border-[#74C69D]/40 font-semibold',
    paprika: 'bg-orange-100 text-[#E85D04] border border-orange-200 font-semibold',
    mustard: 'bg-amber-100 text-amber-900 border border-amber-200 font-medium',
    charcoal: 'bg-slate-800 text-white border border-slate-700 font-medium',
    neutral: 'bg-[#F0EAE1] text-[#343A40] border border-[#E5DDD0] font-medium',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 leading-none select-none tabular-nums',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
