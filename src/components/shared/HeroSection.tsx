import { motion } from 'framer-motion';
import { Spotlight } from '@/components/magicui/spotlight';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { GlowingStarsBackground } from '@/components/aceternity/glowing-stars';
import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const HeroSection = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  className,
  children,
}: HeroSectionProps) => {
  return (
    <Spotlight
      className={cn(
        'relative min-h-[60vh] flex items-center justify-center py-16',
        className
      )}
      spotlightColor="hsl(var(--primary)/0.15)"
    >
      <GlowingStarsBackground className="absolute inset-0" />
      
      <div className="relative z-10 container px-4 text-center">
        {/* Animated subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            {subtitle}
          </span>
        </motion.div>

        {/* Main title with text generate effect */}
        <div className="mb-6">
          <TextGenerateEffect
            words={title}
            className="text-4xl md:text-6xl lg:text-7xl tracking-tight"
          />
        </div>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            {description}
          </motion.p>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {primaryAction && (
              <ShimmerButton
                onClick={primaryAction.onClick}
                className="group"
              >
                {primaryAction.label}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </ShimmerButton>
            )}
            
            {secondaryAction && (
              <motion.button
                onClick={secondaryAction.onClick}
                className="px-6 py-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {secondaryAction.label}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Children (additional content) */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-12"
          >
            {children}
          </motion.div>
        )}
      </div>
    </Spotlight>
  );
};
