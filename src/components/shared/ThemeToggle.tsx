import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        'relative h-10 w-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden',
        'hover:bg-muted hover:border-primary/30 transition-colors',
        className
      )}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ y: -30, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 30, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Sun className="h-5 w-5 text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -30, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 30, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Moon className="h-5 w-5 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle at center, hsl(var(--primary)/0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(250, 204, 21, 0.2) 0%, transparent 70%)',
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
};
