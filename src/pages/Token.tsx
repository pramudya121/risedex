import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { getTokenByAddress, TOKEN_LIST, type Token as TokenType } from '@/constants/tokens';
import { useTokenHolders, useTokenTransfers, useTokenInfo } from '@/hooks/useTokenData';
import { formatAddress, formatTokenValue, formatRelativeTime } from '@/services/explorerApi';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Users, Activity, BarChart3, Copy, Check, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Generate mock price history data (real price data requires oracle/DEX APIs)
const generatePriceHistory = (days: number, basePrice: number, volatility: number) => {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.5) * volatility * price;
    price = Math.max(0.001, price + change);
    const volume = Math.random() * 500000 + 100000;
    
    data.push({
      time: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      timestamp: now - i * 24 * 60 * 60 * 1000,
      price: price,
      volume: volume,
    });
  }
  return data;
};

type TimeFrame = '7D' | '30D' | '90D' | '1Y';

const TokenPage = () => {
  const { address } = useParams<{ address: string }>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30D');
  const [copied, setCopied] = useState(false);
  
  const token = useMemo(() => {
    if (!address) return null;
    return getTokenByAddress(address) || TOKEN_LIST[0];
  }, [address]);

  // Fetch real blockchain data
  const { data: holders, isLoading: holdersLoading, refetch: refetchHolders } = useTokenHolders(token?.address);
  const { data: transfers, isLoading: transfersLoading, refetch: refetchTransfers } = useTokenTransfers(token?.address);
  const { data: tokenInfo, isLoading: infoLoading } = useTokenInfo(token?.address);

  const priceData = useMemo(() => {
    if (!token) return [];
    const days = timeFrame === '7D' ? 7 : timeFrame === '30D' ? 30 : timeFrame === '90D' ? 90 : 365;
    const basePrice = token.symbol === 'ETH' ? 2100 : token.symbol === 'WBTC' ? 42000 : Math.random() * 10 + 0.5;
    return generatePriceHistory(days, basePrice, 0.03);
  }, [token, timeFrame]);

  const priceChange = useMemo(() => {
    if (priceData.length < 2) return 0;
    const first = priceData[0].price;
    const last = priceData[priceData.length - 1].price;
    return ((last - first) / first) * 100;
  }, [priceData]);

  const currentPrice = priceData[priceData.length - 1]?.price || 0;
  const isPositive = priceChange >= 0;

  const copyAddress = () => {
    if (token?.address) {
      navigator.clipboard.writeText(token.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Token not found</p>
            <Link to="/pools">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/pools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <TokenLogo symbol={token.symbol} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{token.name}</h1>
              <Badge variant="secondary">{token.symbol}</Badge>
              {token.isVerified && (
                <Badge className="bg-primary/20 text-primary">Verified</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{token.address.slice(0, 10)}...{token.address.slice(-8)}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
              <a 
                href={`https://explorer.testnet.riselabs.xyz/address/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-xl font-bold">${currentPrice.toFixed(4)}</p>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Supply</p>
            {infoLoading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <p className="text-xl font-bold">
                {tokenInfo?.totalSupply 
                  ? formatTokenValue(tokenInfo.totalSupply, token.decimals)
                  : 'N/A'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Holders
            </p>
            {infoLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-xl font-bold">
                {tokenInfo?.holders ? parseInt(tokenInfo.holders).toLocaleString() : holders?.length || 'N/A'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Transfers
            </p>
            {infoLoading ? (
              <Skeleton className="h-7 w-20 mt-1" />
            ) : (
              <p className="text-xl font-bold">
                {tokenInfo?.transferCount ? parseInt(tokenInfo.transferCount).toLocaleString() : transfers?.length || 'N/A'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price Chart */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Price History
            </CardTitle>
            <div className="flex gap-1">
              {(['7D', '30D', '90D', '1Y'] as TimeFrame[]).map((tf) => (
                <Button
                  key={tf}
                  variant={timeFrame === tf ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeFrame(tf)}
                  className="h-7 px-3 text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 11 }}
                  tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 11 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Volume Chart */}
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" opacity={0.5} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Holders and Transactions */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-card/50 border border-border">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-primary/20">
            <Activity className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="holders" className="data-[state=active]:bg-primary/20">
            <Users className="h-4 w-4 mr-2" />
            Top Holders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Transfers</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchTransfers()}
                  className="h-8"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transfersLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : transfers && transfers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tx Hash</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">From</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">To</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.map((tx, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <a 
                              href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm text-primary hover:underline"
                            >
                              {formatAddress(tx.hash)}
                            </a>
                          </td>
                          <td className="p-4">
                            <a 
                              href={`https://explorer.testnet.riselabs.xyz/address/${tx.from}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm hover:text-primary transition-colors"
                            >
                              {formatAddress(tx.from)}
                            </a>
                          </td>
                          <td className="p-4">
                            <a 
                              href={`https://explorer.testnet.riselabs.xyz/address/${tx.to}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm hover:text-primary transition-colors"
                            >
                              {formatAddress(tx.to)}
                            </a>
                          </td>
                          <td className="p-4 text-right font-medium">
                            {formatTokenValue(tx.value, parseInt(tx.tokenDecimal) || token.decimals)} {token.symbol}
                          </td>
                          <td className="p-4 text-right text-sm text-muted-foreground">
                            {formatRelativeTime(tx.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions found</p>
                  <p className="text-sm">Transactions will appear here once available from the explorer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holders">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Top Token Holders</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchHolders()}
                  className="h-8"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {holdersLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : holders && holders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rank</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Address</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Balance</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">% of Supply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holders.map((holder, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <Badge variant={index < 3 ? 'default' : 'outline'}>#{index + 1}</Badge>
                          </td>
                          <td className="p-4">
                            <a 
                              href={`https://explorer.testnet.riselabs.xyz/address/${holder.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm text-primary hover:underline"
                            >
                              {formatAddress(holder.address)}
                            </a>
                          </td>
                          <td className="p-4 text-right font-medium">
                            {formatTokenValue(holder.value, token.decimals)} {token.symbol}
                          </td>
                          <td className="p-4 text-right">
                            {holder.percentage !== undefined ? (
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${Math.min(holder.percentage * 2, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{holder.percentage.toFixed(2)}%</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No holder data available</p>
                  <p className="text-sm">Holder information will appear here once available from the explorer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Link to={`/?token=${token.address}`}>
              <Button className="bg-primary hover:bg-primary/90">
                Swap {token.symbol}
              </Button>
            </Link>
            <Link to="/liquidity">
              <Button variant="outline">
                Add Liquidity
              </Button>
            </Link>
            <a 
              href={`https://explorer.testnet.riselabs.xyz/token/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenPage;
