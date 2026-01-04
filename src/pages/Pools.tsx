import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, Droplets, Plus, LayoutGrid, List, Sparkles, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { usePoolData } from '@/hooks/usePoolData';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

const Pools = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apy'>('tvl');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { pools, isLoading, totalTVL, totalVolume24h, totalFees24h, totalPools, refetch } = usePoolData();

  const filteredPools = useMemo(() => {
    let filtered = pools.filter(
      (pool) =>
        pool.tokenA.symbol.toLowerCase().includes(search.toLowerCase()) ||
        pool.tokenB.symbol.toLowerCase().includes(search.toLowerCase())
    );

    // Sort pools
    filtered.sort((a, b) => {
      if (sortBy === 'tvl') return b.tvl - a.tvl;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      return b.apy - a.apy;
    });

    return filtered;
  }, [pools, search, sortBy]);

  const stats = [
    { label: 'Total TVL', value: formatCurrency(totalTVL), icon: Droplets, color: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Volume (24h)', value: formatCurrency(totalVolume24h), icon: TrendingUp, color: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Total Pools', value: totalPools.toString(), icon: LayoutGrid, color: 'from-green-500/20 to-emerald-500/20' },
    { label: 'Fees (24h)', value: formatCurrency(totalFees24h), icon: Sparkles, color: 'from-orange-500/20 to-yellow-500/20' },
  ];

  return (
    <div className="container px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary font-medium">Real-time Data</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Liquidity Pools</h1>
          <p className="text-muted-foreground">
            Explore available pools and add liquidity to earn fees
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link to="/liquidity">
            <Button className="gap-2 bg-primary hover:bg-primary/90 glow-purple-sm">
              <Plus className="h-4 w-4" />
              New Position
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/30 border-border/50">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="pt-6 relative">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search, Sort and View Toggle */}
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
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={viewMode === 'cards' ? 'bg-primary' : ''}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-primary' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && pools.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && !isLoading && filteredPools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPools.map((pool) => (
            <Card 
              key={pool.id} 
              className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 border-border/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                {/* Pool Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <Link to={`/token/${pool.tokenA.address}`}>
                        <TokenLogo symbol={pool.tokenA.symbol} size="lg" className="ring-2 ring-background hover:ring-primary transition-all" />
                      </Link>
                      <Link to={`/token/${pool.tokenB.address}`}>
                        <TokenLogo symbol={pool.tokenB.symbol} size="lg" className="ring-2 ring-background hover:ring-primary transition-all" />
                      </Link>
                    </div>
                    <div>
                      <div className="flex gap-1 font-semibold">
                        <Link to={`/token/${pool.tokenA.address}`} className="hover:text-primary transition-colors">
                          {pool.tokenA.symbol}
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <Link to={`/token/${pool.tokenB.address}`} className="hover:text-primary transition-colors">
                          {pool.tokenB.symbol}
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground">Liquidity Pool</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    {pool.apy.toFixed(1)}% APY
                  </Badge>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">TVL</div>
                    <div className="font-semibold">{formatCurrency(pool.tvl)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Volume (24h)</div>
                    <div className="font-semibold">{formatCurrency(pool.volume24h)}</div>
                  </div>
                </div>

                {/* Reserves Info */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="p-2 rounded bg-muted/20">
                    <span className="text-muted-foreground">{pool.tokenA.symbol}: </span>
                    <span className="font-mono">{parseFloat(pool.reserve0Formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/20">
                    <span className="text-muted-foreground">{pool.tokenB.symbol}: </span>
                    <span className="font-mono">{parseFloat(pool.reserve1Formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 mb-4">
                  <div className="text-sm text-muted-foreground">Fees (24h)</div>
                  <div className="font-medium text-success">{formatCurrency(pool.fees24h)}</div>
                </div>

                {/* Action Button */}
                <Link to="/liquidity" className="block">
                  <Button className="w-full gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all">
                    <Plus className="h-4 w-4" />
                    Add Liquidity
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPools.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Pools Found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? `No pools match "${search}"` : 'No liquidity pools available yet'}
            </p>
            <Link to="/liquidity">
              <Button>Create First Pool</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'table' && !isLoading && filteredPools.length > 0 && (
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
                          <Link to={`/token/${pool.tokenA.address}`}>
                            <TokenLogo symbol={pool.tokenA.symbol} size="md" className="ring-2 ring-background hover:ring-primary transition-all" />
                          </Link>
                          <Link to={`/token/${pool.tokenB.address}`}>
                            <TokenLogo symbol={pool.tokenB.symbol} size="md" className="ring-2 ring-background hover:ring-primary transition-all" />
                          </Link>
                        </div>
                        <div className="flex gap-1">
                          <Link to={`/token/${pool.tokenA.address}`} className="font-medium hover:text-primary transition-colors">
                            {pool.tokenA.symbol}
                          </Link>
                          <span>/</span>
                          <Link to={`/token/${pool.tokenB.address}`} className="font-medium hover:text-primary transition-colors">
                            {pool.tokenB.symbol}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">{formatCurrency(pool.tvl)}</td>
                    <td className="p-4 text-right">{formatCurrency(pool.volume24h)}</td>
                    <td className="p-4 text-right">
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        {pool.apy.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-muted-foreground">{formatCurrency(pool.fees24h)}</td>
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
      )}
    </div>
  );
};

export default Pools;
