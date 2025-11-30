import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getTokenBySymbol, getTokenLogoFallback } from '@/constants/tokens';

interface TokenLogoProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export const TokenLogo = ({ symbol, size = 'md', className }: TokenLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const token = getTokenBySymbol(symbol);
  
  const logoUrl = token?.logoURI;
  const fallbackUrl = token?.address ? getTokenLogoFallback(token.address) : undefined;

  if (imageError || !logoUrl) {
    return (
      <div className={cn(
        sizeClasses[size],
        "rounded-full bg-primary/20 flex items-center justify-center",
        className
      )}>
        <span className="text-xs font-bold text-primary">{symbol.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={symbol}
      className={cn(sizeClasses[size], "rounded-full object-cover", className)}
      onError={() => {
        if (fallbackUrl && logoUrl !== fallbackUrl) {
          // Try fallback
          const img = new Image();
          img.src = fallbackUrl;
          img.onload = () => setImageError(false);
          img.onerror = () => setImageError(true);
        } else {
          setImageError(true);
        }
      }}
    />
  );
};
