import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'flat' | 'elevated' | 'accent';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-[#FDFBF7] border border-[#E5DDD0] shadow-warm',
    flat: 'bg-[#FDFBF7] border border-[#E5DDD0]',
    elevated: 'bg-white border border-[#E5DDD0] shadow-soft',
    accent: 'bg-[#FFF4ED] border border-[#FFE5D4]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-4 sm:p-6 transition-all duration-200',
          variants[variant],
          hoverable && 'hover:border-[#E85D04]/60 hover:shadow-warm-md cursor-pointer active:scale-[0.995]',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
