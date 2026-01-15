import React, { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = 'hsl(var(--primary))',
      shimmerSize = '0.1em',
      shimmerDuration = '2s',
      borderRadius = '100px',
      background = 'hsl(var(--background))',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            '--shimmer-color': shimmerColor,
            '--shimmer-size': shimmerSize,
            '--shimmer-duration': shimmerDuration,
            '--radius': borderRadius,
            '--bg': background,
          } as CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-primary/20 px-6 py-3 text-foreground [background:var(--bg)] [border-radius:var(--radius)]',
          'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px] hover:scale-[1.02]',
          className
        )}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className={cn(
            '-z-30 blur-[2px]',
            'absolute inset-0 overflow-visible [container-type:size]'
          )}
        >
          <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        
        {/* Content */}
        <span className="z-10 flex items-center gap-2 text-sm font-semibold">
          {children}
        </span>
        
        {/* Backdrop */}
        <div
          className={cn(
            'insert-0 absolute h-full w-full',
            'rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_hsl(var(--primary)/0.15)]',
            'transform-gpu transition-all duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-6px_10px_hsl(var(--primary)/0.25)]',
            'group-active:shadow-[inset_0_-10px_10px_hsl(var(--primary)/0.2)]'
          )}
        />
        
        {/* Highlight */}
        <div
          className={cn(
            'absolute inset-0 rounded-[var(--radius)]',
            'shadow-[inset_0_-1px_1px_hsl(var(--primary)/0.2),inset_0_1px_1px_hsl(var(--foreground)/0.08)]'
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
