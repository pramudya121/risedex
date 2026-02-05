import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Droplets, 
  TrendingUp, 
  TrendingDown,
  History, 
  ExternalLink,
  Copy,
  RefreshCw,
  PieChart as PieChartIcon,
  Coins,
  Sparkles,
  Bell,
  Plus
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { useLPPositions } from '@/hooks/useLPPositions';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { usePriceData } from '@/hooks/usePriceData';
import { TOKEN_LIST } from '@/constants/tokens';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PriceAlertModal } from '@/components/alerts/PriceAlertModal';
import { PriceAlertsList } from '@/components/alerts/PriceAlertsList';
import { usePriceAlertStore } from '@/stores/usePriceAlertStore';
 import { BorderBeam } from '@/components/magicui/border-beam';
 import { NumberTicker } from '@/components/magicui/number-ticker';

const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { balances, recentTxs } = useAppStore();
  const { positions, isLoading: lpLoading, refetch: refetchLP } = useLPPositions();
  const { refetchBalances, isFetching } = useTokenBalances();
  const { prices, getPrice, isLoading: pricesLoading, refetch: refetchPrices } = usePriceData();
  const { alerts } = usePriceAlertStore();
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: 'Copied!', description: 'Address copied to clipboard' });
    }
  };

  const handleRefresh = () => {
    refetchBalances();
    refetchLP();
    refetchPrices();
    toast({ title: 'Refreshing...', description: 'Fetching latest data from blockchain' });
  };

  // Chart colors
  const CHART_COLORS = [
    'hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 
    'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--success))'
  ];

  // Get token balances from store with real prices
  const tokenBalances = useMemo(() => {
    return TOKEN_LIST.map(token => {
      const balance = balances[token.address.toLowerCase()] || '0';
      const balanceNum = parseFloat(balance);
      const price = getPrice(token.symbol);
      const priceData = prices[token.symbol];
      return {
        ...token,
        balance: balanceNum > 0 ? balanceNum.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0',
        balanceRaw: balanceNum,
        value: balanceNum * price,
        price,
        change24h: priceData?.change24h || 0,
      };
    }).filter(t => t.balanceRaw > 0 || t.isNative);
  }, [balances, prices, getPrice]);

  const totalTokenValue = tokenBalances.reduce((acc, token) => acc + token.value, 0);
  
  const totalLPValue = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const price0 = getPrice(pos.token0.symbol);
      const price1 = getPrice(pos.token1.symbol);
      return acc + (parseFloat(pos.token0Amount) * price0) + (parseFloat(pos.token1Amount) * price1);
    }, 0);
  }, [positions, getPrice]);

  const totalValue = totalTokenValue + totalLPValue;

  // Pie chart data for token distribution
  const pieData = useMemo(() => {
    const data = tokenBalances
      .filter(t => t.value > 0)
      .map((token, i) => ({
        name: token.symbol,
        value: token.value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    if (totalLPValue > 0) {
      data.push({ name: 'LP Positions', value: totalLPValue, color: 'hsl(var(--success))' });
    }
    return data;
  }, [tokenBalances, totalLPValue]);

  // Calculate 24h change based on weighted average of token changes
  const portfolioChange24h = useMemo(() => {
    if (totalValue === 0) return 0;
    const weightedChange = tokenBalances.reduce((acc, token) => {
      if (token.value > 0) {
        const weight = token.value / totalValue;
        return acc + (token.change24h * weight);
      }
      return acc;
    }, 0);
    return weightedChange;
  }, [tokenBalances, totalValue]);

  const valueChange = totalValue * (portfolioChange24h / 100);
  const isLoading = isFetching || pricesLoading;

  if (!isConnected) {
    return (
      <div className="container px-4 py-8">
        <Card className="gradient-card border-border/50 max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">Connect your wallet to view your portfolio</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left: Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={isFetching || lpLoading}>
              <RefreshCw className={`h-4 w-4 ${(isFetching || lpLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-muted-foreground font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}><Copy className="h-3 w-3" /></Button>
            <a href={`https://explorer.testnet.riselabs.xyz/address/${address}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-6 w-6"><ExternalLink className="h-3 w-3" /></Button>
            </a>
          </div>
          
          {/* Total Value Card */}
           <Card className="gradient-card border-border/50 relative overflow-hidden">
             <BorderBeam size={200} duration={12} delay={0} />
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
              </div>
              <div className="text-4xl font-bold text-glow mb-2">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-sm ${portfolioChange24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolioChange24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{portfolioChange24h >= 0 ? '+' : ''}{portfolioChange24h.toFixed(2)}%</span>
                <span className="text-muted-foreground ml-1">
                  ({portfolioChange24h >= 0 ? '+' : ''}${valueChange.toFixed(2)}) 24h
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Pie Chart */}
        <Card className="gradient-card border-border/50 lg:w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Asset Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {pieData.slice(0, 5).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">No assets</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
           { label: 'Token Value', value: totalTokenValue, isCurrency: true, icon: Coins, color: 'text-primary' },
           { label: 'LP Value', value: totalLPValue, isCurrency: true, icon: Droplets, color: 'text-chart-2' },
           { label: 'LP Positions', value: positions.length, isCurrency: false, icon: TrendingUp, color: 'text-chart-3' },
           { label: 'Transactions', value: recentTxs.length, isCurrency: false, icon: History, color: 'text-chart-4' },
        ].map((stat) => (
           <Card key={stat.label} className="gradient-card border-border/50 relative overflow-hidden group hover:border-primary/30 transition-colors">
             <BorderBeam size={100} duration={10} delay={0} />
            <CardContent className="pt-4 pb-4">
               <stat.icon className={`h-4 w-4 ${stat.color} mb-1 group-hover:scale-110 transition-transform`} />
               <div className="text-xl font-bold">
                 {stat.isCurrency && '$'}
                 <NumberTicker value={stat.value} />
               </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="mb-6 bg-muted/30">
          <TabsTrigger value="tokens" className="gap-2"><Wallet className="h-4 w-4" />Tokens</TabsTrigger>
          <TabsTrigger value="liquidity" className="gap-2"><Droplets className="h-4 w-4" />LP ({positions.length})</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2"><Bell className="h-4 w-4" />Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <Card className="gradient-card border-border/50">
            <CardHeader><CardTitle>Token Balances</CardTitle></CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="space-y-3">{[1, 2, 3].map(i => (<Skeleton key={i} className="h-16 w-full" />))}</div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border/30">
                    <span>Asset</span>
                    <span className="text-right w-24">Balance</span>
                    <span className="text-right w-24">Value</span>
                  </div>
                  {tokenBalances.map((token) => (
                    <div key={token.address} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <TokenLogo symbol={token.symbol} size="md" />
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">${token.price < 1 ? token.price.toFixed(4) : token.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right w-24 font-mono text-sm">{token.balance}</div>
                      <div className="text-right w-24">
                        <div className="font-medium">${token.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-muted-foreground">{totalValue > 0 ? ((token.value / totalValue) * 100).toFixed(1) : 0}%</div>
                      </div>
                    </div>
                  ))}
                  {tokenBalances.length === 0 && <div className="text-center py-8 text-muted-foreground">No tokens found</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity">
          <Card className="gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Liquidity Positions</CardTitle>
              <Link to="/liquidity"><Button size="sm">Add Liquidity</Button></Link>
            </CardHeader>
            <CardContent>
              {lpLoading ? (
                <div className="space-y-3">{[1, 2].map(i => (<Skeleton key={i} className="h-24 w-full" />))}</div>
              ) : positions.length > 0 ? (
                <div className="space-y-3">
                  {positions.map((position) => {
                    const price0 = getPrice(position.token0.symbol);
                    const price1 = getPrice(position.token1.symbol);
                    const posValue = (parseFloat(position.token0Amount) * price0) + (parseFloat(position.token1Amount) * price1);
                    return (
                      <div key={position.pairAddress} className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              <TokenLogo symbol={position.token0.symbol} size="md" className="ring-2 ring-background" />
                              <TokenLogo symbol={position.token1.symbol} size="md" className="ring-2 ring-background" />
                            </div>
                            <div>
                              <div className="font-semibold">{position.token0.symbol}/{position.token1.symbol}</div>
                              <Badge variant="outline" className="text-xs">Pool Share: {position.poolShare}%</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-primary">${posValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm bg-background/30 rounded-lg p-3">
                          <div>
                            <div className="text-xs text-muted-foreground">LP Tokens</div>
                            <div className="font-mono">{parseFloat(position.lpBalanceFormatted).toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{position.token0.symbol}</div>
                            <div className="font-mono">{parseFloat(position.token0Amount).toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{position.token1.symbol}</div>
                            <div className="font-mono">{parseFloat(position.token1Amount).toFixed(4)}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link to="/liquidity" className="flex-1"><Button variant="outline" size="sm" className="w-full">Manage</Button></Link>
                          <a href={`https://explorer.testnet.riselabs.xyz/address/${position.pairAddress}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No liquidity positions found</p>
                  <Link to="/liquidity"><Button>Add Your First Position</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setAlertModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Alert
              </Button>
            </div>
            <PriceAlertsList />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link to="/history"><Button variant="outline" size="sm">View All</Button></Link>
            </CardHeader>
            <CardContent>
              {recentTxs.length > 0 ? (
                <div className="space-y-2">
                  {recentTxs.slice(0, 5).map((tx, i) => (
                    <div key={tx.hash + i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-medium capitalize">{tx.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-xs text-muted-foreground">{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={tx.status === 'success' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                          {tx.status}
                        </Badge>
                        <a href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 justify-end mt-1">
                          {tx.hash.slice(0, 8)}...<ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Price Alert Modal */}
      <PriceAlertModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} />
    </div>
  );
};

export default Portfolio;
