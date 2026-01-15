import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
}

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  as: Component = 'div',
}: MovingBorderProps) => {
  return (
    <Component
      className={cn(
        'relative bg-transparent p-[1px] overflow-hidden',
        containerClassName
      )}
      style={{
        borderRadius: 'inherit',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: 'inherit' }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={cn(
            'absolute h-[200%] w-[200%] opacity-[0.7]',
            borderClassName
          )}
          style={{
            left: '-50%',
            top: '-50%',
            background: `conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent 30%)`,
          }}
        />
      </div>
      <div
        className={cn(
          'relative z-10 bg-card rounded-[inherit]',
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
};
