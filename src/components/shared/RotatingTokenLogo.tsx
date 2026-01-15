import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RotatingTokenLogoProps {
  src: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RotatingTokenLogo = ({
  src,
  alt,
  className,
  size = 'lg',
}: RotatingTokenLogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <div className={cn('relative perspective-[1000px]', className)}>
      {/* Glow effect */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full bg-primary/40 blur-xl',
          sizeClasses[size]
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Rotating token */}
      <motion.div
        className={cn(
          'relative rounded-full overflow-hidden shadow-lg shadow-primary/30',
          sizeClasses[size]
        )}
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
};
