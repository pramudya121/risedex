import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  speed?: 'slow' | 'normal' | 'fast';
}

export const Marquee = ({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  speed = 'normal',
}: MarqueeProps) => {
  const speedMap = {
    slow: '40s',
    normal: '25s',
    fast: '15s',
  };

  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 [--duration:25s] [--gap:1rem] [gap:var(--gap)]',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
      style={{
        '--duration': speedMap[speed],
      } as React.CSSProperties}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex shrink-0 justify-around [gap:var(--gap)]',
              vertical ? 'animate-marquee-vertical flex-col' : 'animate-marquee',
              pauseOnHover && 'group-hover:[animation-play-state:paused]',
              reverse && 'direction-reverse'
            )}
            style={{
              animationDirection: reverse ? 'reverse' : 'normal',
            }}
          >
            {children}
          </div>
        ))}
    </div>
  );
};
