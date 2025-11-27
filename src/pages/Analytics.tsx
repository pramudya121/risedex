import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react';

const volumeData = [
  { date: 'Mon', volume: 2400000, tvl: 12000000 },
  { date: 'Tue', volume: 1398000, tvl: 12500000 },
  { date: 'Wed', volume: 9800000, tvl: 13000000 },
  { date: 'Thu', volume: 3908000, tvl: 13200000 },
  { date: 'Fri', volume: 4800000, tvl: 14000000 },
  { date: 'Sat', volume: 3800000, tvl: 14500000 },
  { date: 'Sun', volume: 4300000, tvl: 15000000 },
];

const topTokens = [
  { symbol: 'ETH', price: '$3,245.67', volume: '$8.5M', change: '+2.45%', positive: true },
  { symbol: 'PRMZ', price: '$0.0234', volume: '$2.1M', change: '-1.23%', positive: false },
  { symbol: 'RISE', price: '$0.156', volume: '$1.8M', change: '+5.67%', positive: true },
  { symbol: 'WBTC', price: '$67,234', volume: '$1.2M', change: '+1.89%', positive: true },
  { symbol: 'SOL', price: '$178.45', volume: '$890K', change: '-0.56%', positive: false },
];

const topPools = [
  { pair: 'ETH/PRMZ', tvl: '$2.4M', volume: '$567K', apy: '24.5%' },
  { pair: 'ETH/RISE', tvl: '$1.8M', volume: '$345K', apy: '18.2%' },
  { pair: 'ETH/WBTC', tvl: '$5.6M', volume: '$1.2M', apy: '12.4%' },
  { pair: 'ETH/SOL', tvl: '$1.2M', volume: '$234K', apy: '15.8%' },
  { pair: 'PRMZ/RISE', tvl: '$456K', volume: '$89K', apy: '45.2%' },
];

const Analytics = () => {
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Platform statistics and market overview
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Volume (24h)', value: '$12.5M', icon: DollarSign, change: '+12.5%' },
          { label: 'Total TVL', value: '$45.2M', icon: TrendingUp, change: '+5.2%' },
          { label: 'Total Trades', value: '24,567', icon: Activity, change: '+8.9%' },
          { label: 'Active Users', value: '1,234', icon: Users, change: '+15.3%' },
        ].map((stat) => (
          <Card key={stat.label} className="gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-success">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-glow">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Volume (7D)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${(value/1000000).toFixed(2)}M`, 'Volume']}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>TVL (7D)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${(value/1000000).toFixed(2)}M`, 'TVL']}
                />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Top Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTokens.map((token, i) => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-4">{i + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{token.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.price}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{token.volume}</div>
                    <div className={`text-sm ${token.positive ? 'text-success' : 'text-destructive'}`}>
                      {token.change}
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
            <CardTitle>Top Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPools.map((pool, i) => (
                <div
                  key={pool.pair}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-4">{i + 1}</span>
                    <div>
                      <div className="font-medium">{pool.pair}</div>
                      <div className="text-sm text-muted-foreground">TVL: {pool.tvl}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-success">{pool.apy} APY</div>
                    <div className="text-sm text-muted-foreground">{pool.volume}</div>
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
