import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { getTokenByAddress, TOKEN_LIST, type Token as TokenType } from '@/constants/tokens';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Users, Activity, BarChart3, Copy, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Generate mock price history data
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

// Mock holders data
const generateHolders = (token: TokenType) => [
  { address: '0x1234...5678', balance: '1,250,000', percentage: 12.5, rank: 1 },
  { address: '0x2345...6789', balance: '890,000', percentage: 8.9, rank: 2 },
  { address: '0x3456...7890', balance: '650,000', percentage: 6.5, rank: 3 },
  { address: '0x4567...8901', balance: '420,000', percentage: 4.2, rank: 4 },
  { address: '0x5678...9012', balance: '380,000', percentage: 3.8, rank: 5 },
  { address: '0x6789...0123', balance: '290,000', percentage: 2.9, rank: 6 },
  { address: '0x7890...1234', balance: '215,000', percentage: 2.15, rank: 7 },
  { address: '0x8901...2345', balance: '180,000', percentage: 1.8, rank: 8 },
];

// Mock transaction history
const generateTransactions = (token: TokenType) => [
  { hash: '0xabc...123', type: 'Swap', from: token.symbol, to: 'WETH', amount: '1,500', value: '$2,340', time: '2 mins ago' },
  { hash: '0xdef...456', type: 'Transfer', from: '0x123...', to: '0x456...', amount: '5,000', value: '$7,800', time: '5 mins ago' },
  { hash: '0xghi...789', type: 'Swap', from: 'ETH', to: token.symbol, amount: '2,300', value: '$3,588', time: '12 mins ago' },
  { hash: '0xjkl...012', type: 'Add Liquidity', from: '-', to: '-', amount: '10,000', value: '$15,600', time: '28 mins ago' },
  { hash: '0xmno...345', type: 'Swap', from: token.symbol, to: 'SOL', amount: '800', value: '$1,248', time: '45 mins ago' },
  { hash: '0xpqr...678', type: 'Transfer', from: '0x789...', to: '0xabc...', amount: '3,200', value: '$4,992', time: '1 hour ago' },
  { hash: '0xstu...901', type: 'Remove Liquidity', from: '-', to: '-', amount: '4,500', value: '$7,020', time: '2 hours ago' },
  { hash: '0xvwx...234', type: 'Swap', from: 'WBTC', to: token.symbol, amount: '6,100', value: '$9,516', time: '3 hours ago' },
];

type TimeFrame = '7D' | '30D' | '90D' | '1Y';

const TokenPage = () => {
  const { address } = useParams<{ address: string }>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30D');
  const [copied, setCopied] = useState(false);
  
  const token = useMemo(() => {
    if (!address) return null;
    return getTokenByAddress(address) || TOKEN_LIST[0];
  }, [address]);

  const priceData = useMemo(() => {
    if (!token) return [];
    const days = timeFrame === '7D' ? 7 : timeFrame === '30D' ? 30 : timeFrame === '90D' ? 90 : 365;
    const basePrice = token.symbol === 'ETH' ? 2100 : token.symbol === 'WBTC' ? 42000 : Math.random() * 10 + 0.5;
    return generatePriceHistory(days, basePrice, 0.03);
  }, [token, timeFrame]);

  const holders = useMemo(() => token ? generateHolders(token) : [], [token]);
  const transactions = useMemo(() => token ? generateTransactions(token) : [], [token]);

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
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-xl font-bold">${(currentPrice * 10000000).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Holders
            </p>
            <p className="text-xl font-bold">1,247</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> 24h Volume
            </p>
            <p className="text-xl font-bold">${(Math.random() * 500000 + 100000).toLocaleString()}</p>
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
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tx Hash</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">From</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">To</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Value</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <a 
                            href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-primary hover:underline"
                          >
                            {tx.hash}
                          </a>
                        </td>
                        <td className="p-4">
                          <Badge variant={tx.type === 'Swap' ? 'default' : tx.type === 'Transfer' ? 'secondary' : 'outline'}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono text-sm">{tx.from}</td>
                        <td className="p-4 font-mono text-sm">{tx.to}</td>
                        <td className="p-4 text-right font-medium">{tx.amount}</td>
                        <td className="p-4 text-right text-muted-foreground">{tx.value}</td>
                        <td className="p-4 text-right text-sm text-muted-foreground">{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holders">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="p-0">
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
                    {holders.map((holder) => (
                      <tr key={holder.rank} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <Badge variant={holder.rank <= 3 ? 'default' : 'outline'}>#{holder.rank}</Badge>
                        </td>
                        <td className="p-4">
                          <a 
                            href={`https://explorer.testnet.riselabs.xyz/address/${holder.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-primary hover:underline"
                          >
                            {holder.address}
                          </a>
                        </td>
                        <td className="p-4 text-right font-medium">{holder.balance} {token.symbol}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${holder.percentage * 8}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{holder.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
