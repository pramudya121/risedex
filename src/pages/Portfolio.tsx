import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Droplets, 
  TrendingUp, 
  History, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Copied!',
        description: 'Address copied to clipboard',
      });
    }
  };

  // Mock data
  const tokenBalances = [
    { symbol: 'ETH', name: 'Ethereum', balance: '2.5432', value: '$8,234.56', change: '+2.45%' },
    { symbol: 'PRMZ', name: 'PRMZ Token', balance: '15,000', value: '$351.00', change: '-1.23%' },
    { symbol: 'RISE', name: 'RiseBullish', balance: '5,000', value: '$780.00', change: '+5.67%' },
    { symbol: 'SGN', name: 'SANGEN', balance: '10,000', value: '$89.00', change: '+0.34%' },
  ];

  const lpPositions = [
    { pair: 'ETH/PRMZ', lpTokens: '1,234.56', value: '$4,567.89', share: '0.12%', earned: '$23.45' },
    { pair: 'ETH/RISE', lpTokens: '567.89', value: '$2,345.67', share: '0.05%', earned: '$12.34' },
  ];

  const recentTxs = [
    { type: 'Swap', from: 'ETH', to: 'PRMZ', amount: '0.5 ETH', time: '2 hours ago', hash: '0x123...' },
    { type: 'Add Liquidity', from: 'ETH', to: 'RISE', amount: '1.0 ETH', time: '1 day ago', hash: '0x456...' },
    { type: 'Swap', from: 'PRMZ', to: 'SGN', amount: '1000 PRMZ', time: '2 days ago', hash: '0x789...' },
  ];

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
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
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
          <div className="text-3xl font-bold text-primary text-glow">$16,367.12</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Token Value', value: '$9,454.56', icon: Wallet },
          { label: 'LP Value', value: '$6,913.56', icon: Droplets },
          { label: 'Earned Fees', value: '$35.79', icon: TrendingUp },
          { label: 'Transactions', value: '47', icon: History },
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
            Liquidity
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
              <div className="space-y-3">
                {tokenBalances.map((token) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{token.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{token.balance}</div>
                      <div className="text-sm text-muted-foreground">{token.value}</div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {lpPositions.map((position) => (
                  <div
                    key={position.pair}
                    className="p-4 rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                            <span className="text-xs font-bold">{position.pair.split('/')[0].slice(0, 2)}</span>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                            <span className="text-xs font-bold">{position.pair.split('/')[1].slice(0, 2)}</span>
                          </div>
                        </div>
                        <div className="font-medium">{position.pair}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">{position.value}</div>
                        <div className="text-xs text-muted-foreground">Pool Share: {position.share}</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LP Tokens: {position.lpTokens}</span>
                      <span className="text-success">Earned: {position.earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTxs.map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
                  >
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.from} → {tx.to} • {tx.amount}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{tx.time}</div>
                      <a
                        href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {tx.hash}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
