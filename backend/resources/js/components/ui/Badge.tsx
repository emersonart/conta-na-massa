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
    sage: 'bg-[#D8F3DC]/80 text-[#1B4332] border border-[#74C69D]/40 font-semibold',
    paprika: 'bg-[#FFF4ED] text-[#E85D04] border border-[#FFE5D4] font-semibold',
    mustard: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold',
    charcoal: 'bg-[#212529] text-white border border-[#343A40] font-medium',
    neutral: 'bg-[#F0EAE1]/80 text-[#343A40] border border-[#E5DDD0] font-medium',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-lg tracking-tight',
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
