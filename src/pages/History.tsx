import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  ArrowRightLeft, 
  Droplets, 
  Check,
  Clock,
  X
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'approve';
  status: 'pending' | 'success' | 'failed';
  hash: string;
  from?: string;
  to?: string;
  amountIn?: string;
  amountOut?: string;
  timestamp: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'swap', status: 'success', hash: '0x1234...5678', from: 'ETH', to: 'PRMZ', amountIn: '0.5', amountOut: '21,367.89', timestamp: '2024-01-15 14:30:00' },
  { id: '2', type: 'addLiquidity', status: 'success', hash: '0x2345...6789', from: 'ETH', to: 'RISE', amountIn: '1.0', amountOut: '567.89', timestamp: '2024-01-14 10:15:00' },
  { id: '3', type: 'swap', status: 'pending', hash: '0x3456...7890', from: 'PRMZ', to: 'SGN', amountIn: '1000', amountOut: '2,345.67', timestamp: '2024-01-14 09:00:00' },
  { id: '4', type: 'approve', status: 'success', hash: '0x4567...8901', from: 'PRMZ', timestamp: '2024-01-13 16:45:00' },
  { id: '5', type: 'swap', status: 'failed', hash: '0x5678...9012', from: 'ETH', to: 'WBTC', amountIn: '2.0', timestamp: '2024-01-13 12:30:00' },
];

const History = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'swap' | 'liquidity'>('all');

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: 'Copied!',
      description: 'Transaction hash copied to clipboard',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-0">Success</Badge>;
      case 'pending':
        return <Badge className="bg-warning/20 text-warning border-0">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-0">Failed</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowRightLeft className="h-4 w-4" />;
      case 'addLiquidity':
      case 'removeLiquidity':
        return <Droplets className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const filteredTxs = mockTransactions.filter((tx) => {
    if (filter === 'swap') return tx.type === 'swap';
    if (filter === 'liquidity') return tx.type === 'addLiquidity' || tx.type === 'removeLiquidity';
    return true;
  });

  if (!isConnected) {
    return (
      <div className="container px-4 py-8">
        <Card className="gradient-card border-border/50 max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to view transaction history
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">
          View your past transactions and their status
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'swap', 'liquidity'] as const).map((option) => (
            <Button
              key={option}
              variant={filter === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option)}
              className={filter === option ? 'bg-primary' : 'border-border/50'}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-0">
          {filteredTxs.length > 0 ? (
            <div className="divide-y divide-border/30">
              {filteredTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {tx.type === 'swap' && 'Swap'}
                          {tx.type === 'addLiquidity' && 'Add Liquidity'}
                          {tx.type === 'removeLiquidity' && 'Remove Liquidity'}
                          {tx.type === 'approve' && 'Token Approval'}
                          {getStatusBadge(tx.status)}
                        </div>
                        {tx.from && tx.to && (
                          <div className="text-sm text-muted-foreground">
                            {tx.amountIn} {tx.from} → {tx.amountOut} {tx.to}
                          </div>
                        )}
                        {tx.type === 'approve' && tx.from && (
                          <div className="text-sm text-muted-foreground">
                            Approved {tx.from} for trading
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{tx.timestamp}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">{tx.hash}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyHash(tx.hash)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <a
                          href={`https://explorer.testnet.riselabs.xyz/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
