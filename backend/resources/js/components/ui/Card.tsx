import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-[#FDFBF7] border border-[#E5DDD0] rounded-xl p-4 sm:p-6 transition-colors',
          hoverable && 'hover:border-[#E85D04] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
