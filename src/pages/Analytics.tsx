import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Zap, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenLogo } from '@/components/shared/TokenLogo';


// Generate historical data
const generateVolumeData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      volume: Math.random() * 8000000 + 2000000,
      tvl: 12000000 + Math.random() * 5000000 + (days - i) * 200000,
      trades: Math.floor(Math.random() * 3000 + 1000),
      fees: Math.random() * 50000 + 10000,
    });
  }
  return data;
};

const tokenDistribution = [
  { name: 'ETH', value: 45, color: 'hsl(var(--primary))' },
  { name: 'PRMZ', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'RISE', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'WBTC', value: 12, color: 'hsl(var(--chart-4))' },
  { name: 'SOL', value: 8, color: 'hsl(var(--chart-5))' },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Live stats with real-time simulation
  const [stats, setStats] = useState({
    totalVolume: 12500000,
    totalTvl: 45200000,
    totalTrades: 24567,
    activeUsers: 1234,
    avgTradeSize: 508.67,
    totalFees: 125000,
  });

  const [topTokens, setTopTokens] = useState([
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', price: 3245.67, volume: 8500000, change: 2.45 },
    { symbol: 'PRMZ', address: '0x7E76eB292BDF45aE633d0Ff9E641B6C9f6254419', price: 0.0234, volume: 2100000, change: -1.23 },
    { symbol: 'RISE', address: '0x5Fa86c5e03eDc6F894826c84ace1ef704a891322', price: 0.156, volume: 1800000, change: 5.67 },
    { symbol: 'WBTC', address: '0x1855C26D2540264A42e3F5Aa03EDbeEbDB598818', price: 67234, volume: 1200000, change: 1.89 },
    { symbol: 'SOL', address: '0xD15b8348135BB498B5A4a05BBE008596a8BcaEc5', price: 178.45, volume: 890000, change: -0.56 },
  ]);

  const [topPools, setTopPools] = useState([
    { pair: 'ETH/PRMZ', token0: 'ETH', token1: 'PRMZ', tvl: 2400000, volume: 567000, apy: 24.5, fees24h: 1701 },
    { pair: 'ETH/RISE', token0: 'ETH', token1: 'RISE', tvl: 1800000, volume: 345000, apy: 18.2, fees24h: 1035 },
    { pair: 'ETH/WBTC', token0: 'ETH', token1: 'WBTC', tvl: 5600000, volume: 1200000, apy: 12.4, fees24h: 3600 },
    { pair: 'ETH/SOL', token0: 'ETH', token1: 'SOL', tvl: 1200000, volume: 234000, apy: 15.8, fees24h: 702 },
    { pair: 'PRMZ/RISE', token0: 'PRMZ', token1: 'RISE', tvl: 456000, volume: 89000, apy: 45.2, fees24h: 267 },
  ]);

  const volumeData = generateVolumeData(timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30);

  // Real-time updates simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        totalVolume: prev.totalVolume + Math.random() * 50000 - 25000,
        totalTvl: prev.totalTvl + Math.random() * 100000 - 50000,
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 5),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3 - 1),
        avgTradeSize: prev.avgTradeSize + Math.random() * 10 - 5,
        totalFees: prev.totalFees + Math.random() * 500,
      }));

      setTopTokens(prev => prev.map(token => ({
        ...token,
        price: token.price * (1 + (Math.random() * 0.002 - 0.001)),
        volume: token.volume + Math.random() * 10000,
        change: token.change + (Math.random() * 0.1 - 0.05),
      })));

      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };


  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Real-time platform statistics and market overview
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          <Button
            variant={isLive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="gap-2"
          >
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Paused
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Volume (24h)', value: formatCurrency(stats.totalVolume), icon: DollarSign, change: 12.5, positive: true },
          { label: 'Total TVL', value: formatCurrency(stats.totalTvl), icon: TrendingUp, change: 5.2, positive: true },
          { label: 'Total Trades', value: formatNumber(stats.totalTrades), icon: Activity, change: 8.9, positive: true },
          { label: 'Active Users', value: formatNumber(stats.activeUsers), icon: Users, change: 15.3, positive: true },
          { label: 'Avg Trade', value: formatCurrency(stats.avgTradeSize), icon: Zap, change: -2.1, positive: false },
          { label: 'Fees (24h)', value: formatCurrency(stats.totalFees), icon: DollarSign, change: 18.7, positive: true },
        ].map((stat) => (
          <Card key={stat.label} className="gradient-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className={`text-xs flex items-center gap-0.5 ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                  {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-glow">{stat.value}</div>
              <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(['24h', '7d', '30d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Volume & Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))" 
                  tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))" 
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'volume' ? formatCurrency(value) : formatNumber(value),
                    name === 'volume' ? 'Volume' : 'Trades'
                  ]}
                />
                <Bar yAxisId="left" dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="trades" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">TVL Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'TVL']}
                />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#tvlGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 - Fees & Distribution */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fees Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Fees']}
                />
                <Line 
                  type="monotone" 
                  dataKey="fees" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-3))', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">TVL Distribution by Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={tokenDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {tokenDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 grid grid-cols-2 gap-2">
                {tokenDistribution.map((token) => (
                  <div key={token.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: token.color }}
                    />
                    <span className="text-sm font-medium">{token.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{token.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Top Tokens by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 text-xs text-muted-foreground px-3 pb-2 border-b border-border/50">
                <span>#</span>
                <span>Token</span>
                <span className="text-right">Price</span>
                <span className="text-right">24h Change</span>
              </div>
              {topTokens.map((token, i) => (
                <div
                  key={token.symbol}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-muted-foreground text-sm w-4">{i + 1}</span>
                  <div className="flex items-center gap-3">
                    <TokenLogo 
                      symbol={token.symbol}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(token.volume)} vol</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${token.price < 1 ? token.price.toFixed(4) : token.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className={`text-right font-medium ${token.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {token.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(token.change).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pools */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Top Pools by TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 text-xs text-muted-foreground px-3 pb-2 border-b border-border/50">
                <span>#</span>
                <span>Pool</span>
                <span className="text-right">TVL</span>
                <span className="text-right">APY</span>
              </div>
              {topPools.map((pool, i) => (
                <div
                  key={pool.pair}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <span className="text-muted-foreground text-sm w-4">{i + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <TokenLogo 
                        symbol={pool.token0}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                      <TokenLogo 
                        symbol={pool.token1}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{pool.pair}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(pool.volume)} vol</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(pool.tvl)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(pool.fees24h)} fees</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-success">{pool.apy.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
