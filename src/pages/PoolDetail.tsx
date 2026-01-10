import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Droplets, 
  TrendingUp, 
  Clock, 
  Users, 
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Percent,
  Activity
} from 'lucide-react';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { createPublicClient, http, formatUnits } from 'viem';
import { riseTestnet } from '@/config/wagmi';
import { CONTRACTS, FACTORY_ABI, PAIR_ABI } from '@/constants/contracts';
import { TOKEN_LIST, NATIVE_ETH, Token, getTokenByAddress } from '@/constants/tokens';
import { useAccount } from 'wagmi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { fetchTokenTransfers, formatAddress, formatRelativeTime } from '@/services/explorerApi';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(4);
};

interface PoolDetails {
  pairAddress: string;
  tokenA: Token;
  tokenB: Token;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  userLpBalance: bigint;
  userShare: number;
  tvl: number;
  volume24h: number;
  fees24h: number;
  apy: number;
}

interface Transaction {
  hash: string;
  type: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
}

// Generate mock historical data
const generateHistoricalData = (days: number) => {
  const data = [];
  const now = Date.now();
  let price = 0.5 + Math.random() * 0.5;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    price = price * (1 + (Math.random() - 0.48) * 0.08);
    const volume = 50000 + Math.random() * 100000;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.max(0.1, price),
      volume,
      tvl: price * 1000000 + Math.random() * 500000,
    });
  }
  return data;
};

const PoolDetail = () => {
  const { pairAddress } = useParams<{ pairAddress: string }>();
  const { address, isConnected } = useAccount();
  const [poolDetails, setPoolDetails] = useState<PoolDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const wethAddress = CONTRACTS[riseTestnet.id].WETH as `0x${string}`;

  // Fetch pool details
  useEffect(() => {
    const fetchPoolDetails = async () => {
      if (!pairAddress) return;
      setIsLoading(true);

      try {
        const [reserves, token0Address, token1Address, totalSupply] = await Promise.all([
          (publicClient.readContract as any)({
            address: pairAddress as `0x${string}`,
            abi: PAIR_ABI,
            functionName: 'getReserves',
          }),
          (publicClient.readContract as any)({
            address: pairAddress as `0x${string}`,
            abi: PAIR_ABI,
            functionName: 'token0',
          }),
          (publicClient.readContract as any)({
            address: pairAddress as `0x${string}`,
            abi: PAIR_ABI,
            functionName: 'token1',
          }),
          (publicClient.readContract as any)({
            address: pairAddress as `0x${string}`,
            abi: PAIR_ABI,
            functionName: 'totalSupply',
          }),
        ]);

        // Get user LP balance if connected
        let userLpBalance = 0n;
        if (address) {
          userLpBalance = await (publicClient.readContract as any)({
            address: pairAddress as `0x${string}`,
            abi: PAIR_ABI,
            functionName: 'balanceOf',
            args: [address],
          });
        }

        // Find tokens
        let tokenA = getTokenByAddress(token0Address);
        let tokenB = getTokenByAddress(token1Address);

        // Handle WETH as ETH
        if (!tokenA && token0Address.toLowerCase() === wethAddress.toLowerCase()) {
          tokenA = NATIVE_ETH;
        }
        if (!tokenB && token1Address.toLowerCase() === wethAddress.toLowerCase()) {
          tokenB = NATIVE_ETH;
        }

        if (!tokenA || !tokenB) {
          tokenA = tokenA || { address: token0Address, symbol: 'Unknown', name: 'Unknown Token', decimals: 18, chainId: riseTestnet.id };
          tokenB = tokenB || { address: token1Address, symbol: 'Unknown', name: 'Unknown Token', decimals: 18, chainId: riseTestnet.id };
        }

        // Calculate metrics
        const ethPrice = 3200;
        const getPriceUSD = (symbol: string) => {
          switch (symbol) {
            case 'ETH': case 'WETH': return ethPrice;
            case 'PRMZ': return 0.025;
            case 'RISE': return 0.16;
            case 'SGN': return 0.009;
            case 'WBTC': return 67000;
            case 'SOL': return 180;
            default: return 1;
          }
        };

        const reserve0Formatted = parseFloat(formatUnits(reserves[0], tokenA.decimals));
        const reserve1Formatted = parseFloat(formatUnits(reserves[1], tokenB.decimals));
        const value0 = reserve0Formatted * getPriceUSD(tokenA.symbol);
        const value1 = reserve1Formatted * getPriceUSD(tokenB.symbol);
        const tvl = value0 + value1;
        const volume24h = tvl * (0.15 + Math.random() * 0.15);
        const fees24h = volume24h * 0.003;
        const apy = tvl > 0 ? Math.min(((fees24h * 365) / tvl) * 100, 100) : 0;

        const userShare = totalSupply > 0n 
          ? (Number(userLpBalance) / Number(totalSupply)) * 100 
          : 0;

        setPoolDetails({
          pairAddress,
          tokenA,
          tokenB,
          reserve0: reserves[0],
          reserve1: reserves[1],
          totalSupply,
          userLpBalance,
          userShare,
          tvl,
          volume24h,
          fees24h,
          apy,
        });

        // Fetch transactions
        const txs = await fetchTokenTransfers(pairAddress);
        setTransactions(txs.slice(0, 10).map(tx => ({
          hash: tx.hash,
          type: 'Transfer',
          timestamp: tx.timestamp,
          from: tx.from,
          to: tx.to,
          value: tx.value,
        })));

      } catch (error) {
        console.error('Error fetching pool details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolDetails();
  }, [pairAddress, address, wethAddress]);

  // Generate chart data based on timeframe
  useEffect(() => {
    const days = chartTimeframe === '7D' ? 7 : chartTimeframe === '30D' ? 30 : 90;
    setChartData(generateHistoricalData(days));
  }, [chartTimeframe]);

  const copyAddress = () => {
    if (pairAddress) {
      navigator.clipboard.writeText(pairAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!poolDetails) {
    return (
      <div className="container px-4 py-8 max-w-6xl mx-auto text-center">
        <Droplets className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Pool Not Found</h1>
        <p className="text-muted-foreground mb-6">This liquidity pool does not exist or could not be loaded.</p>
        <Link to="/pools">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pools
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Link to="/pools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Pools
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="h-12 w-12 rounded-full overflow-hidden ring-4 ring-background">
                <TokenLogo symbol={poolDetails.tokenA.symbol} size="lg" />
              </div>
              <div className="h-12 w-12 rounded-full overflow-hidden ring-4 ring-background">
                <TokenLogo symbol={poolDetails.tokenB.symbol} size="lg" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {poolDetails.tokenA.symbol} / {poolDetails.tokenB.symbol}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-success/30 text-success">0.3% Fee</Badge>
                <button 
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formatAddress(pairAddress || '')}
                  {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </button>
                <a 
                  href={`https://explorer.testnet.riselabs.xyz/address/${pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/liquidity">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Liquidity
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">TVL</div>
                <div className="text-xl font-bold text-primary">{formatCurrency(poolDetails.tvl)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/30">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Volume (24h)</div>
                <div className="text-xl font-bold text-blue-400">{formatCurrency(poolDetails.volume24h)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/20 to-transparent border-success/30">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">APY</div>
                <div className="text-xl font-bold text-success">{poolDetails.apy.toFixed(2)}%</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/30">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Fees (24h)</div>
                <div className="text-xl font-bold text-orange-400">{formatCurrency(poolDetails.fees24h)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Pool Analytics</CardTitle>
              <div className="flex gap-1">
                {(['7D', '30D', '90D'] as const).map((tf) => (
                  <Button
                    key={tf}
                    variant={chartTimeframe === tf ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartTimeframe(tf)}
                    className={chartTimeframe === tf ? 'bg-primary' : ''}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tvl">
                <TabsList className="grid grid-cols-3 w-full max-w-xs mb-4">
                  <TabsTrigger value="tvl">TVL</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                  <TabsTrigger value="price">Price</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tvl">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [formatCurrency(value), 'TVL']}
                        />
                        <Area type="monotone" dataKey="tvl" stroke="hsl(var(--primary))" fill="url(#tvlGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="volume">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [formatCurrency(value), 'Volume']}
                        />
                        <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="price">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [value.toFixed(4), 'Price Ratio']}
                        />
                        <Area type="monotone" dataKey="price" stroke="#22c55e" fill="url(#priceGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Droplets className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{tx.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatAddress(tx.from)} → {formatAddress(tx.to)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{formatRelativeTime(tx.timestamp)}</div>
                        <a 
                          href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pool Composition */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="h-5 w-5 text-primary" />
                Pool Composition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <TokenLogo symbol={poolDetails.tokenA.symbol} size="md" />
                  <div>
                    <div className="font-medium">{poolDetails.tokenA.symbol}</div>
                    <div className="text-xs text-muted-foreground">{poolDetails.tokenA.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{formatNumber(parseFloat(formatUnits(poolDetails.reserve0, poolDetails.tokenA.decimals)))}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <TokenLogo symbol={poolDetails.tokenB.symbol} size="md" />
                  <div>
                    <div className="font-medium">{poolDetails.tokenB.symbol}</div>
                    <div className="text-xs text-muted-foreground">{poolDetails.tokenB.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{formatNumber(parseFloat(formatUnits(poolDetails.reserve1, poolDetails.tokenB.decimals)))}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total LP Tokens</span>
                  <span className="font-mono">{formatNumber(parseFloat(formatUnits(poolDetails.totalSupply, 18)))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Position */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Your Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isConnected && poolDetails.userLpBalance > 0n ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
                    <div className="text-sm text-muted-foreground mb-1">Your LP Tokens</div>
                    <div className="text-2xl font-bold text-primary">
                      {formatNumber(parseFloat(formatUnits(poolDetails.userLpBalance, 18)))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {poolDetails.userShare.toFixed(4)}% of pool
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your {poolDetails.tokenA.symbol}</span>
                      <span className="font-mono">
                        {formatNumber(parseFloat(formatUnits(poolDetails.reserve0, poolDetails.tokenA.decimals)) * poolDetails.userShare / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your {poolDetails.tokenB.symbol}</span>
                      <span className="font-mono">
                        {formatNumber(parseFloat(formatUnits(poolDetails.reserve1, poolDetails.tokenB.decimals)) * poolDetails.userShare / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Position Value</span>
                      <span className="font-semibold text-success">
                        {formatCurrency(poolDetails.tvl * poolDetails.userShare / 100)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link to="/liquidity" className="flex-1">
                      <Button className="w-full gap-1" size="sm">
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </Link>
                    <Link to="/liquidity" className="flex-1">
                      <Button variant="outline" className="w-full gap-1 border-border/50" size="sm">
                        <Minus className="h-4 w-4" />
                        Remove
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Droplets className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {isConnected ? 'You have no position in this pool' : 'Connect wallet to view your position'}
                  </p>
                  <Link to="/liquidity">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Liquidity
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pool Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Pool Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pool Created</span>
                <span>-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee Tier</span>
                <span>0.3%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contract</span>
                <a 
                  href={`https://explorer.testnet.riselabs.xyz/address/${pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {formatAddress(pairAddress || '')}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PoolDetail;
