import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  Droplets, 
  TrendingUp, 
  History, 
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { useLPPositions } from '@/hooks/useLPPositions';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { TOKEN_LIST, NATIVE_ETH } from '@/constants/tokens';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { formatDistanceToNow } from 'date-fns';

const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { balances, recentTxs } = useAppStore();
  const { positions, isLoading: lpLoading, refetch: refetchLP } = useLPPositions();
  const { refetchBalances, isFetching } = useTokenBalances();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Copied!',
        description: 'Address copied to clipboard',
      });
    }
  };

  const handleRefresh = () => {
    refetchBalances();
    refetchLP();
    toast({
      title: 'Refreshing...',
      description: 'Fetching latest balances',
    });
  };

  // Get token balances from store
  const tokenBalances = TOKEN_LIST.map(token => {
    const balance = balances[token.address.toLowerCase()] || '0';
    const balanceNum = parseFloat(balance);
    return {
      ...token,
      balance: balanceNum > 0 ? balanceNum.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0',
      balanceRaw: balanceNum,
    };
  }).filter(t => t.balanceRaw > 0 || t.isNative);

  // Calculate total token value (mock prices for now)
  const mockPrices: Record<string, number> = {
    ETH: 3200,
    WETH: 3200,
    PRMZ: 0.0234,
    RISE: 0.156,
    SGN: 0.0089,
    WBTC: 67000,
    SOL: 180,
  };

  const totalTokenValue = tokenBalances.reduce((acc, token) => {
    const price = mockPrices[token.symbol] || 0;
    return acc + (token.balanceRaw * price);
  }, 0);

  const totalLPValue = positions.reduce((acc, pos) => {
    const price0 = mockPrices[pos.token0.symbol] || 0;
    const price1 = mockPrices[pos.token1.symbol] || 0;
    return acc + (parseFloat(pos.token0Amount) * price0) + (parseFloat(pos.token1Amount) * price1);
  }, 0);

  const totalValue = totalTokenValue + totalLPValue;

  if (!isConnected) {
    return (
      <div className="container px-4 py-8">
        <Card className="gradient-card border-border/50 max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your portfolio
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isFetching || lpLoading}
            >
              <RefreshCw className={`h-4 w-4 ${(isFetching || lpLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
              <Copy className="h-3 w-3" />
            </Button>
            <a
              href={`https://explorer.testnet.riselabs.xyz/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total Value</div>
          <div className="text-3xl font-bold text-primary text-glow">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Token Value', value: `$${totalTokenValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Wallet },
          { label: 'LP Value', value: `$${totalLPValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Droplets },
          { label: 'LP Positions', value: positions.length.toString(), icon: TrendingUp },
          { label: 'Transactions', value: recentTxs.length.toString(), icon: History },
        ].map((stat) => (
          <Card key={stat.label} className="gradient-card border-border/50">
            <CardContent className="pt-6">
              <stat.icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tokens" className="gap-2">
            <Wallet className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="gap-2">
            <Droplets className="h-4 w-4" />
            Liquidity ({positions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Token Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {tokenBalances.map((token) => {
                    const price = mockPrices[token.symbol] || 0;
                    const value = token.balanceRaw * price;
                    return (
                      <div
                        key={token.address}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <TokenLogo symbol={token.symbol} size="lg" />
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-sm text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{token.balance}</div>
                          <div className="text-sm text-muted-foreground">
                            ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {tokenBalances.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tokens found in wallet
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity">
          <Card className="gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Liquidity Positions</CardTitle>
              <Link to="/liquidity">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Add Liquidity
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {lpLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : positions.length > 0 ? (
                <div className="space-y-3">
                  {positions.map((position) => {
                    const price0 = mockPrices[position.token0.symbol] || 0;
                    const price1 = mockPrices[position.token1.symbol] || 0;
                    const posValue = (parseFloat(position.token0Amount) * price0) + (parseFloat(position.token1Amount) * price1);
                    
                    return (
                      <div
                        key={position.pairAddress}
                        className="p-4 rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              <TokenLogo symbol={position.token0.symbol} size="md" className="ring-2 ring-background" />
                              <TokenLogo symbol={position.token1.symbol} size="md" className="ring-2 ring-background" />
                            </div>
                            <div className="font-medium">
                              {position.token0.symbol}/{position.token1.symbol}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-primary">
                              ${posValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pool Share: {position.poolShare}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">LP Tokens:</span>{' '}
                            <span className="font-mono">{parseFloat(position.lpBalanceFormatted).toFixed(6)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground">{position.token0.symbol}:</span>{' '}
                            <span className="font-mono">{parseFloat(position.token0Amount).toFixed(6)}</span>
                          </div>
                          <div>
                            <a
                              href={`https://explorer.testnet.riselabs.xyz/address/${position.pairAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-xs hover:underline flex items-center gap-1"
                            >
                              View Contract <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground">{position.token1.symbol}:</span>{' '}
                            <span className="font-mono">{parseFloat(position.token1Amount).toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No liquidity positions found</p>
                  <Link to="/liquidity">
                    <Button className="bg-primary hover:bg-primary/90">
                      Add Your First Position
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTxs.length > 0 ? (
                <div className="space-y-3">
                  {recentTxs.map((tx, i) => (
                    <div
                      key={tx.hash + i}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
                    >
                      <div>
                        <div className="font-medium capitalize">{tx.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          tx.status === 'success' ? 'text-success' : 
                          tx.status === 'failed' ? 'text-destructive' : 
                          'text-warning'
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </div>
                        <a
                          href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                        >
                          {tx.hash.slice(0, 8)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
