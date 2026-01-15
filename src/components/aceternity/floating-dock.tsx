import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DockItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface FloatingDockProps {
  items: DockItem[];
  className?: string;
  activeItem?: string;
}

export const FloatingDock = ({ items, className, activeItem }: FloatingDockProps) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto flex h-14 items-end gap-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 px-3 pb-2 shadow-lg',
        className
      )}
    >
      {items.map((item) => (
        <DockIcon 
          key={item.path} 
          mouseX={mouseX} 
          item={item} 
          isActive={activeItem === item.path}
        />
      ))}
    </motion.div>
  );
};

interface DockIconProps {
  mouseX: ReturnType<typeof useMotionValue>;
  item: DockItem;
  isActive?: boolean;
}

const DockIcon = ({ mouseX, item, isActive }: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [36, 56, 36]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link to={item.path}>
      <motion.div
        ref={ref}
        style={{ width }}
        className={cn(
          'aspect-square flex items-center justify-center rounded-full transition-colors',
          isActive 
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <motion.div className="flex items-center justify-center">
          {item.icon}
        </motion.div>
      </motion.div>
    </Link>
  );
};
