import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Droplets, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { getTokenBySymbol } from '@/constants/tokens';

interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  tvl: string;
  volume24h: string;
  apy: number;
  fees24h: string;
}

const mockPools: Pool[] = [
  { id: '1', tokenA: 'ETH', tokenB: 'PRMZ', tvl: '$2.4M', volume24h: '$567K', apy: 24.5, fees24h: '$1,234' },
  { id: '2', tokenA: 'ETH', tokenB: 'RISE', tvl: '$1.8M', volume24h: '$345K', apy: 18.2, fees24h: '$890' },
  { id: '3', tokenA: 'ETH', tokenB: 'SGN', tvl: '$890K', volume24h: '$123K', apy: 32.1, fees24h: '$456' },
  { id: '4', tokenA: 'ETH', tokenB: 'WBTC', tvl: '$5.6M', volume24h: '$1.2M', apy: 12.4, fees24h: '$3,456' },
  { id: '5', tokenA: 'ETH', tokenB: 'SOL', tvl: '$1.2M', volume24h: '$234K', apy: 15.8, fees24h: '$678' },
  { id: '6', tokenA: 'PRMZ', tokenB: 'RISE', tvl: '$456K', volume24h: '$89K', apy: 45.2, fees24h: '$234' },
];

const Pools = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apy'>('tvl');

  const filteredPools = mockPools.filter(
    (pool) =>
      pool.tokenA.toLowerCase().includes(search.toLowerCase()) ||
      pool.tokenB.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Liquidity Pools</h1>
          <p className="text-muted-foreground">
            Explore available pools and add liquidity to earn fees
          </p>
        </div>
        <Link to="/liquidity">
          <Button className="gap-2 bg-primary hover:bg-primary/90 glow-purple-sm">
            <Plus className="h-4 w-4" />
            New Position
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total TVL', value: '$45.2M', icon: Droplets },
          { label: 'Volume (24h)', value: '$12.5M', icon: TrendingUp },
          { label: 'Total Pools', value: '156', icon: Droplets },
          { label: 'Fees (24h)', value: '$34.5K', icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="gradient-card border-border/50">
            <CardContent className="pt-6">
              <stat.icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>
        <div className="flex gap-2">
          {(['tvl', 'volume', 'apy'] as const).map((option) => (
            <Button
              key={option}
              variant={sortBy === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(option)}
              className={sortBy === option ? 'bg-primary' : 'border-border/50'}
            >
              {option.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Pools Table */}
      <Card className="gradient-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pool</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">TVL</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Volume (24h)</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">APY</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Fees (24h)</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPools.map((pool) => (
                <tr
                  key={pool.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <Link to={`/token/${getTokenBySymbol(pool.tokenA)?.address || ''}`}>
                          <TokenLogo symbol={pool.tokenA} size="md" className="ring-2 ring-background hover:ring-primary transition-all" />
                        </Link>
                        <Link to={`/token/${getTokenBySymbol(pool.tokenB)?.address || ''}`}>
                          <TokenLogo symbol={pool.tokenB} size="md" className="ring-2 ring-background hover:ring-primary transition-all" />
                        </Link>
                      </div>
                      <div className="flex gap-1">
                        <Link to={`/token/${getTokenBySymbol(pool.tokenA)?.address || ''}`} className="font-medium hover:text-primary transition-colors">
                          {pool.tokenA}
                        </Link>
                        <span>/</span>
                        <Link to={`/token/${getTokenBySymbol(pool.tokenB)?.address || ''}`} className="font-medium hover:text-primary transition-colors">
                          {pool.tokenB}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium">{pool.tvl}</td>
                  <td className="p-4 text-right">{pool.volume24h}</td>
                  <td className="p-4 text-right">
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      {pool.apy}%
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">{pool.fees24h}</td>
                  <td className="p-4 text-right">
                    <Link to="/liquidity">
                      <Button size="sm" variant="outline" className="border-border/50 hover:border-primary/50">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Pools;
