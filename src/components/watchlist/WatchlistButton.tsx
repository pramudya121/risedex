import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  tokenAddress: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WatchlistButton = ({ tokenAddress, size = 'md', className }: WatchlistButtonProps) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const isWatched = isInWatchlist(tokenAddress);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(sizeClasses[size], 'rounded-full', className)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleWatchlist(tokenAddress);
      }}
      title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star
        size={iconSizes[size]}
        className={cn(
          'transition-colors',
          isWatched 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-muted-foreground hover:text-yellow-400'
        )}
      />
    </Button>
  );
};
