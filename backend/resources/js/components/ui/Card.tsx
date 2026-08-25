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
          'bg-white border border-[#E5DDD0]/80 rounded-2xl p-5 sm:p-6 shadow-soft transition-all duration-200',
          hoverable && 'hover:shadow-soft-lg hover:border-[#E85D04]/30 hover:-translate-y-0.5 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
