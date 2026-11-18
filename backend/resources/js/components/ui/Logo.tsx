import React from 'react';
import { Croissant } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className }) => {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const svgSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-8 h-8',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={twMerge(clsx('flex items-center gap-3 select-none', className))}>
      <div
        className={twMerge(
          clsx(
            'bg-gradient-to-tr from-[#E85D04] to-[#F4A261] flex items-center justify-center text-white shadow-sm shrink-0',
            iconSizes[size]
          )
        )}
      >
        <Croissant className={twMerge(clsx(svgSizes[size]))} strokeWidth={2.2} />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={twMerge(
              clsx(
                'font-extrabold font-heading text-[#212529] tracking-tight leading-tight',
                titleSizes[size]
              )
            )}
          >
            Conta na Massa
          </span>
          <span className="text-[11px] font-medium text-slate-500 leading-tight">
            Precificação para Confeitaria & Panificação
          </span>
        </div>
      )}
    </div>
  );
};
