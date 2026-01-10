import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  TrendingUp, 
  Droplets, 
  Plus, 
  LayoutGrid, 
  List, 
  Sparkles, 
  ArrowUpRight, 
  RefreshCw,
  Star,
  Info,
  Percent
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { usePoolData } from '@/hooks/usePoolData';

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatNumber = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(2);
};

const Pools = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apy'>('tvl');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [favorites, setFavorites] = useState<string[]>([]);

  const { pools, isLoading, totalTVL, totalVolume24h, totalFees24h, totalPools, refetch } = usePoolData();

  // Calculate average APY
  const averageAPY = useMemo(() => {
    if (pools.length === 0) return 0;
    return pools.reduce((acc, pool) => acc + pool.apy, 0) / pools.length;
  }, [pools]);

  const toggleFavorite = (poolId: string) => {
    setFavorites(prev => 
      prev.includes(poolId) 
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  const filteredPools = useMemo(() => {
    let filtered = pools.filter(
      (pool) =>
        pool.tokenA.symbol.toLowerCase().includes(search.toLowerCase()) ||
        pool.tokenB.symbol.toLowerCase().includes(search.toLowerCase())
    );

    // Sort pools
    filtered.sort((a, b) => {
      // Favorites first
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      
      if (sortBy === 'tvl') return b.tvl - a.tvl;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      return b.apy - a.apy;
    });

    return filtered;
  }, [pools, search, sortBy, favorites]);

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Liquidity Pools
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Explore and provide liquidity to earn trading fees
        </p>
      </div>

      {/* Main Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Pools</div>
            {isLoading ? (
              <Skeleton className="h-6 w-12 mx-auto" />
            ) : (
              <div className="text-xl font-bold">{totalPools}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total TVL</div>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div className="text-xl font-bold text-primary">{formatCurrency(totalTVL)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div className="text-xl font-bold">{formatCurrency(totalVolume24h)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Avg APY</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mx-auto" />
            ) : (
              <div className="text-xl font-bold text-success">{averageAPY.toFixed(2)}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Featured Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Value Locked</div>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <div className="text-3xl font-bold text-primary">{formatCurrency(totalTVL)}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">Pools on-chain reserves</div>
          </CardContent>
          <div className="absolute top-4 right-4 p-2 rounded-full bg-primary/20">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">24h Volume</div>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <div className="text-3xl font-bold text-blue-400">{formatCurrency(totalVolume24h)}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">Estimated from TVL</div>
          </CardContent>
          <div className="absolute top-4 right-4 p-2 rounded-full bg-blue-500/20">
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-success/20 via-success/10 to-transparent border-success/30">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Average APY</div>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <div className="text-3xl font-bold text-success">{averageAPY.toFixed(2)}%</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">Based on trading fees</div>
          </CardContent>
          <div className="absolute top-4 right-4 p-2 rounded-full bg-success/20">
            <Percent className="h-5 w-5 text-success" />
          </div>
        </Card>
      </div>

      {/* Search, Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>

        {/* Favorites Toggle */}
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 border-border/50 ${favorites.length > 0 ? 'text-yellow-400 border-yellow-400/30' : ''}`}
        >
          <Star className={`h-4 w-4 ${favorites.length > 0 ? 'fill-yellow-400' : ''}`} />
          Favorites
        </Button>

        {/* Sort Buttons */}
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
          {(['tvl', 'volume', 'apy'] as const).map((option) => (
            <Button
              key={option}
              variant={sortBy === option ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(option)}
              className={sortBy === option ? 'bg-primary' : ''}
            >
              {option === 'tvl' ? 'TVL' : option === 'volume' ? 'Volume' : 'APY'}
            </Button>
          ))}
        </div>

        {/* View Toggle */}
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

        {/* Refresh & Create */}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading} className="border-border/50">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link to="/create-pool">
            <Button className="gap-2 bg-primary hover:bg-primary/90 glow-purple-sm">
              <Plus className="h-4 w-4" />
              Create Pool
            </Button>
          </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPools.map((pool) => (
            <Card 
              key={pool.id} 
              className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-muted/30 to-background border-border/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 relative">
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
                      <div className="flex gap-1 font-semibold text-lg">
                        <Link to={`/token/${pool.tokenA.address}`} className="hover:text-primary transition-colors">
                          {pool.tokenA.symbol}
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <Link to={`/token/${pool.tokenB.address}`} className="hover:text-primary transition-colors">
                          {pool.tokenB.symbol}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Fee: 0.3%</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-success/30 text-success">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(pool.id)}
                  >
                    <Star className={`h-4 w-4 ${favorites.includes(pool.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </Button>
                </div>

                {/* TVL Display */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <span>TVL</span>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-success/20 text-success">
                      {pool.apy.toFixed(1)}% APY
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(pool.tvl)}</div>
                </div>

                {/* Token Balances */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <TokenLogo symbol={pool.tokenA.symbol} size="sm" />
                    <div>
                      <div className="text-xs text-muted-foreground">{pool.tokenA.symbol}</div>
                      <div className="font-mono text-xs">{formatNumber(parseFloat(pool.reserve0Formatted))}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <TokenLogo symbol={pool.tokenB.symbol} size="sm" />
                    <div>
                      <div className="text-xs text-muted-foreground">{pool.tokenB.symbol}</div>
                      <div className="font-mono text-xs">{formatNumber(parseFloat(pool.reserve1Formatted))}</div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between text-sm mb-4 px-1">
                  <div>
                    <div className="text-xs text-muted-foreground">24h Volume</div>
                    <div className="font-medium">{formatCurrency(pool.volume24h)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">24h Fees</div>
                    <div className="font-medium text-success">{formatCurrency(pool.fees24h)}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/pool/${pool.pairAddress}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-border/50 hover:border-primary/50"
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </Link>
                  <Link to="/liquidity" className="flex-1">
                    <Button className="w-full gap-1 bg-primary hover:bg-primary/90" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Liquidity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPools.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <Droplets className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Pools Found</h3>
            <p className="text-muted-foreground mb-6">
              {search ? `No pools match "${search}"` : 'No liquidity pools available yet'}
            </p>
            <Link to="/create-pool">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Create First Pool
              </Button>
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
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pool</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">TVL</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">APY</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Volume (24h)</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Fees (24h)</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPools.map((pool, index) => (
                  <tr
                    key={pool.id}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4 text-muted-foreground">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleFavorite(pool.id)}
                        >
                          <Star className={`h-3 w-3 ${favorites.includes(pool.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>
                        <div className="flex -space-x-2">
                          <Link to={`/token/${pool.tokenA.address}`}>
                            <TokenLogo symbol={pool.tokenA.symbol} size="md" className="ring-2 ring-background hover:ring-primary transition-all" />
                          </Link>
                          <Link to={`/token/${pool.tokenB.address}`}>
                            <TokenLogo symbol={pool.tokenB.symbol} size="md" className="ring-2 ring-background hover:ring-primary transition-all" />
                          </Link>
                        </div>
                        <div>
                          <div className="flex gap-1 font-medium">
                            <Link to={`/token/${pool.tokenA.address}`} className="hover:text-primary transition-colors">
                              {pool.tokenA.symbol}
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            <Link to={`/token/${pool.tokenB.address}`} className="hover:text-primary transition-colors">
                              {pool.tokenB.symbol}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">0.3% fee</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">{formatCurrency(pool.tvl)}</td>
                    <td className="p-4 text-right">
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        {pool.apy.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-4 text-right">{formatCurrency(pool.volume24h)}</td>
                    <td className="p-4 text-right text-success">{formatCurrency(pool.fees24h)}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" className="border-border/50 hover:border-primary/50">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Link to="/liquidity">
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </Link>
                      </div>
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
