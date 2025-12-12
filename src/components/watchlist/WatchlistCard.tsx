import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { WatchlistButton } from './WatchlistButton';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { getTokenByAddress, TOKEN_LIST } from '@/constants/tokens';

// Mock prices - in production would come from API
const MOCK_PRICES: Record<string, { price: number; change24h: number }> = {
  '0x0000000000000000000000000000000000000000': { price: 3245.67, change24h: 2.34 },
  '0xfd290e1e7dac27ecaaa4a93fbb66cd0f00b2e073': { price: 3245.67, change24h: 2.34 },
  '0x7e76eb292bdf45ae633d0ff9e641b6c9f6254419': { price: 0.0234, change24h: 15.67 },
  '0x5fa86c5e03edc6f894826c84ace1ef704a891322': { price: 0.00089, change24h: -3.21 },
  '0x7115e9e830bf16d7629ffbe60b4d6b0920a5e369': { price: 0.00156, change24h: 8.45 },
  '0x1855c26d2540264a42e3f5aa03edbeebdb598818': { price: 67234.56, change24h: 1.23 },
  '0xd15b8348135bb498b5a4a05bbe008596a8bcaec5': { price: 178.45, change24h: -0.89 },
};

export const WatchlistCard = () => {
  const { watchlist } = useWatchlistStore();
  const [prices, setPrices] = useState(MOCK_PRICES);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          const randomChange = (Math.random() - 0.5) * 0.02;
          updated[key] = {
            ...updated[key],
            price: updated[key].price * (1 + randomChange),
            change24h: updated[key].change24h + (Math.random() - 0.5) * 0.5,
          };
        });
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const watchedTokens = watchlist
    .map((address) => getTokenByAddress(address))
    .filter(Boolean);

  if (watchedTokens.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No tokens in watchlist</p>
            <p className="text-sm text-muted-foreground">
              Click the star icon on any token to add it to your watchlist
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="space-y-2">
          {watchedTokens.map((token) => {
            if (!token) return null;
            const priceData = prices[token.address.toLowerCase()] || { price: 0, change24h: 0 };
            const isPositive = priceData.change24h >= 0;

            return (
              <div
                key={token.address}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <Link 
                  to={`/token/${token.address}`}
                  className="flex items-center gap-3 flex-1"
                >
                  <TokenLogo 
                    address={token.address} 
                    symbol={token.symbol} 
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium text-foreground">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </Link>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ${priceData.price < 0.01 
                        ? priceData.price.toFixed(6) 
                        : priceData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/token/${token.address}`}
                      className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      <ExternalLink size={14} className="text-muted-foreground" />
                    </Link>
                    <WatchlistButton tokenAddress={token.address} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
