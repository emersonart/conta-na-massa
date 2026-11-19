import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  suffixText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefixText,
  suffixText,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs sm:text-sm font-semibold text-[#343A40] flex items-center justify-between">
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {prefixText && (
          <span className="absolute left-3.5 text-slate-500 font-semibold text-sm select-none pointer-events-none tabular-nums">
            {prefixText}
          </span>
        )}

        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full min-h-[44px] rounded-xl border border-[#E5DDD0] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#212529] placeholder:text-slate-400 focus:border-[#E85D04] focus:outline-none focus:ring-3 focus:ring-[#E85D04]/15 transition-all shadow-2xs disabled:bg-slate-100 disabled:cursor-not-allowed tabular-nums',
              prefixText && 'pl-10',
              suffixText && 'pr-12',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )
          )}
          {...props}
        />

        {suffixText && (
          <span className="absolute right-3.5 text-slate-500 font-medium text-xs sm:text-sm select-none pointer-events-none">
            {suffixText}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
