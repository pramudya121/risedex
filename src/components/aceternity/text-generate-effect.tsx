import { useEffect, useState } from 'react';
import { motion, stagger, useAnimate, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });
  const [hasAnimated, setHasAnimated] = useState(false);
  const wordsArray = words.split(' ');

  useEffect(() => {
    if (isInView && !hasAnimated) {
      animate(
        'span',
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none',
        },
        {
          duration: duration,
          delay: stagger(0.08),
        }
      );
      setHasAnimated(true);
    }
  }, [isInView, animate, filter, duration, hasAnimated]);

  return (
    <div className={cn('font-bold', className)} ref={scope}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="opacity-0 inline-block mr-[0.25em]"
          style={{
            filter: filter ? 'blur(10px)' : 'none',
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};
