import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Token } from '@/constants/tokens';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  tokenIn: Token | null;
  tokenOut: Token | null;
  currentRate: string;
}

type TimeFrame = '1H' | '24H' | '7D' | '30D';

interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
}

// Generate realistic price data with some volatility
const generatePriceData = (
  basePrice: number,
  timeFrame: TimeFrame,
  volatility: number = 0.02
): PricePoint[] => {
  const points: PricePoint[] = [];
  const now = Date.now();
  
  let intervals: number;
  let intervalMs: number;
  let formatTime: (date: Date) => string;

  switch (timeFrame) {
    case '1H':
      intervals = 60;
      intervalMs = 60 * 1000; // 1 minute
      formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      break;
    case '24H':
      intervals = 96;
      intervalMs = 15 * 60 * 1000; // 15 minutes
      formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      break;
    case '7D':
      intervals = 84;
      intervalMs = 2 * 60 * 60 * 1000; // 2 hours
      formatTime = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      break;
    case '30D':
      intervals = 90;
      intervalMs = 8 * 60 * 60 * 1000; // 8 hours
      formatTime = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      break;
  }

  let price = basePrice * (1 - volatility * 2 + Math.random() * volatility * 2);
  
  for (let i = intervals; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const date = new Date(timestamp);
    
    // Add some realistic price movement
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, basePrice * 0.5);
    price = Math.min(price, basePrice * 1.5);
    
    points.push({
      time: formatTime(date),
      price: parseFloat(price.toFixed(6)),
      timestamp,
    });
  }

  // Ensure last point is close to current rate
  if (points.length > 0) {
    points[points.length - 1].price = basePrice;
  }

  return points;
};

export const PriceChart = ({ tokenIn, tokenOut, currentRate }: PriceChartProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24H');
  const [isLoading, setIsLoading] = useState(true);

  const basePrice = useMemo(() => {
    return currentRate ? parseFloat(currentRate) : 1;
  }, [currentRate]);

  const priceData = useMemo(() => {
    if (!tokenIn || !tokenOut || basePrice <= 0) return [];
    return generatePriceData(basePrice, timeFrame, 0.015);
  }, [tokenIn, tokenOut, basePrice, timeFrame]);

  const priceChange = useMemo(() => {
    if (priceData.length < 2) return { value: 0, percent: 0 };
    const firstPrice = priceData[0].price;
    const lastPrice = priceData[priceData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percent = (change / firstPrice) * 100;
    return { value: change, percent };
  }, [priceData]);

  const minPrice = useMemo(() => {
    if (priceData.length === 0) return 0;
    return Math.min(...priceData.map(p => p.price)) * 0.995;
  }, [priceData]);

  const maxPrice = useMemo(() => {
    if (priceData.length === 0) return 0;
    return Math.max(...priceData.map(p => p.price)) * 1.005;
  }, [priceData]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [timeFrame, tokenIn, tokenOut]);

  if (!tokenIn || !tokenOut) {
    return null;
  }

  const isPositive = priceChange.percent >= 0;
  const chartColor = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
  const gradientId = `priceGradient-${tokenIn.symbol}-${tokenOut.symbol}`;

  return (
    <Card className="w-full gradient-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium text-muted-foreground">
              {tokenIn.symbol} / {tokenOut.symbol}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">
                {basePrice > 0 ? basePrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: basePrice < 1 ? 6 : 4,
                }) : '—'}
              </span>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{isPositive ? '+' : ''}{priceChange.percent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {(['1H', '24H', '7D', '30D'] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                variant={timeFrame === tf ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs",
                  timeFrame === tf && "bg-primary/20 text-primary hover:bg-primary/30"
                )}
                onClick={() => setTimeFrame(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(val) => val.toFixed(val < 1 ? 4 : 2)}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600 }}
                formatter={(value: number) => [
                  value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: value < 1 ? 6 : 4,
                  }),
                  'Price'
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
