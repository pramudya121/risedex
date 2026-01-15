import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowingStarsBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const GlowingStarsBackground = ({
  className,
  children,
}: GlowingStarsBackgroundProps) => {
  return (
    <div className={cn('relative min-h-[200px] overflow-hidden', className)}>
      <div className="absolute inset-0">
        <Stars />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface GlowingStarsCardProps {
  className?: string;
  children?: React.ReactNode;
}

export const GlowingStarsCard = ({
  className,
  children,
}: GlowingStarsCardProps) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card border border-border/50 p-6',
        className
      )}
    >
      <div className="absolute inset-0 opacity-50">
        <Stars count={15} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface StarsProps {
  count?: number;
}

const Stars = ({ count = 30 }: StarsProps) => {
  const [stars, setStars] = useState<
    Array<{ id: number; x: number; y: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div className="absolute inset-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute h-1 w-1 rounded-full bg-primary"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

interface GlowingStarsTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export const GlowingStarsTitle = ({
  className,
  children,
}: GlowingStarsTitleProps) => {
  return (
    <h2 className={cn('text-2xl font-bold text-foreground', className)}>
      {children}
    </h2>
  );
};

interface GlowingStarsDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const GlowingStarsDescription = ({
  className,
  children,
}: GlowingStarsDescriptionProps) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
};
