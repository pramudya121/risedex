import { SwapCard } from '@/components/swap/SwapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useEffect, useState } from 'react';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

const Swap = () => {
  const { swap } = useAppStore();
  const [priceData, setPriceData] = useState<PriceData[]>([
    { symbol: 'ETH', price: 3245.67, change24h: 2.45 },
    { symbol: 'PRMZ', price: 0.0234, change24h: -1.23 },
    { symbol: 'RISE', price: 0.156, change24h: 5.67 },
    { symbol: 'SGN', price: 0.0089, change24h: 0.34 },
    { symbol: 'WBTC', price: 67234.56, change24h: 1.89 },
    { symbol: 'SOL', price: 178.45, change24h: -0.56 },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData((prev) =>
        prev.map((item) => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.002),
          change24h: item.change24h + (Math.random() - 0.5) * 0.2,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Main Swap Card */}
        <div className="w-full lg:w-auto flex justify-center">
          <SwapCard />
        </div>

        {/* Live Prices Sidebar */}
        <Card className="w-full lg:w-80 gradient-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Prices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priceData.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {item.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <span className="font-medium">{item.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${item.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: item.price < 1 ? 4 : 2,
                    })}
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      item.change24h >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {item.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(item.change24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
        {[
          { label: 'Total Volume (24h)', value: '$12.5M' },
          { label: 'Total Liquidity', value: '$45.2M' },
          { label: 'Total Pairs', value: '156' },
          { label: 'Total Trades', value: '24,567' },
        ].map((stat) => (
          <Card key={stat.label} className="gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary text-glow">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Swap;
