import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  delay?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export const NumberTicker = ({
  value,
  direction = 'up',
  className,
  delay = 0,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: NumberTickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const motionValue = useSpring(direction === 'down' ? value : 0, {
    damping: 60,
    stiffness: 100,
  });

  const rounded = useTransform(motionValue, (latest) => {
    return prefix + latest.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value);
        setHasAnimated(true);
      }, delay * 1000);
    }
  }, [motionValue, isInView, delay, value, direction, hasAnimated]);

  // Update value when it changes
  useEffect(() => {
    if (hasAnimated) {
      motionValue.set(direction === 'down' ? 0 : value);
    }
  }, [value, hasAnimated, motionValue, direction]);

  return (
    <motion.span ref={ref} className={cn('tabular-nums', className)}>
      {rounded}
    </motion.span>
  );
};
