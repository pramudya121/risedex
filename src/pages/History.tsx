import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  ArrowRightLeft, 
  Droplets, 
  Check,
  Clock,
  X,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  FileText
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchAddressTransactions, 
  fetchAddressTokenTransfers,
  formatAddress,
  formatTokenValue,
  formatRelativeTime,
  AddressTransaction,
  TokenTransfer
} from '@/services/explorerApi';
import { CONTRACTS, RISE_TESTNET } from '@/constants/contracts';
import { formatEther } from 'viem';

type CombinedTx = {
  hash: string;
  type: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'approve' | 'transfer' | 'deposit' | 'withdraw' | 'unknown';
  status: 'success' | 'failed';
  from: string;
  to: string;
  value: string;
  timestamp: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  functionName?: string;
  gasUsed?: string;
};

const EXPLORER_URL = RISE_TESTNET.blockExplorers.default.url;

const History = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'swaps' | 'liquidity' | 'transfers'>('all');
  const [transactions, setTransactions] = useState<CombinedTx[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadTransactions = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const [txList, tokenTxList] = await Promise.all([
        fetchAddressTransactions(address),
        fetchAddressTokenTransfers(address),
      ]);

      // Process regular transactions
      const processedTxs: CombinedTx[] = txList.map((tx: AddressTransaction) => {
        let type: CombinedTx['type'] = 'unknown';
        const funcName = tx.functionName?.toLowerCase() || '';
        const methodId = tx.methodId?.toLowerCase() || '';
        
        // Detect transaction type by function name or method ID
        if (funcName.includes('swap') || methodId === '0x7ff36ab5' || methodId === '0x38ed1739') {
          type = 'swap';
        } else if (funcName.includes('addliquidity') || methodId === '0xf305d719' || methodId === '0xe8e33700') {
          type = 'addLiquidity';
        } else if (funcName.includes('removeliquidity') || methodId === '0x02751cec' || methodId === '0xbaa2abde') {
          type = 'removeLiquidity';
        } else if (funcName.includes('approve') || methodId === '0x095ea7b3') {
          type = 'approve';
        } else if (funcName.includes('deposit') || methodId === '0xe2bbb158') {
          type = 'deposit';
        } else if (funcName.includes('withdraw') || methodId === '0x441a3e70') {
          type = 'withdraw';
        } else if (tx.value !== '0') {
          type = 'transfer';
        }

        return {
          hash: tx.hash,
          type,
          status: tx.isError === '0' ? 'success' : 'failed',
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: tx.timestamp,
          functionName: tx.functionName,
          gasUsed: tx.gasUsed,
        };
      });

      // Process token transfers (add ones not already in the list)
      const tokenTxHashes = new Set(processedTxs.map(tx => tx.hash));
      const additionalTokenTxs: CombinedTx[] = tokenTxList
        .filter((tx: TokenTransfer) => !tokenTxHashes.has(tx.hash))
        .map((tx: TokenTransfer) => ({
          hash: tx.hash,
          type: 'transfer' as const,
          status: 'success' as const,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: tx.timestamp,
          tokenSymbol: tx.tokenSymbol,
          tokenDecimal: tx.tokenDecimal,
        }));

      // Combine and sort by timestamp
      const allTxs = [...processedTxs, ...additionalTokenTxs]
        .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

      setTransactions(allTxs);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions();
    }
  }, [address, isConnected]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: 'Copied!', description: 'Transaction hash copied to clipboard' });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <Badge className="bg-success/20 text-success border-0 text-xs">Success</Badge>;
    }
    return <Badge className="bg-destructive/20 text-destructive border-0 text-xs">Failed</Badge>;
  };

  const getTypeIcon = (type: CombinedTx['type']) => {
    switch (type) {
      case 'swap': return <ArrowRightLeft className="h-4 w-4" />;
      case 'addLiquidity': return <Droplets className="h-4 w-4 text-primary" />;
      case 'removeLiquidity': return <Droplets className="h-4 w-4 text-warning" />;
      case 'approve': return <Check className="h-4 w-4 text-success" />;
      case 'deposit': return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'withdraw': return <ArrowUpRight className="h-4 w-4 text-warning" />;
      case 'transfer': return <Coins className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeName = (type: CombinedTx['type']) => {
    switch (type) {
      case 'swap': return 'Swap';
      case 'addLiquidity': return 'Add Liquidity';
      case 'removeLiquidity': return 'Remove Liquidity';
      case 'approve': return 'Token Approval';
      case 'deposit': return 'Stake/Deposit';
      case 'withdraw': return 'Unstake/Withdraw';
      case 'transfer': return 'Transfer';
      default: return 'Contract Call';
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    // Search filter
    if (search && !tx.hash.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Type filter
    if (filter === 'swaps') return tx.type === 'swap';
    if (filter === 'liquidity') return tx.type === 'addLiquidity' || tx.type === 'removeLiquidity';
    if (filter === 'transfers') return tx.type === 'transfer' || tx.type === 'deposit' || tx.type === 'withdraw';
    return true;
  });

  if (!isConnected) {
    return (
      <div className="container px-4 py-8">
        <Card className="gradient-card border-border/50 max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">On-chain transactions from RISE Testnet</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadTransactions}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="swaps">Swaps</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      {lastRefresh && (
        <div className="mb-4 text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Last updated: {lastRefresh.toLocaleTimeString()} • {filteredTxs.length} transactions
        </div>
      )}

      {/* Transactions List */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-0">
          {isLoading && transactions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTxs.length > 0 ? (
            <div className="divide-y divide-border/30">
              {filteredTxs.map((tx) => (
                <div key={tx.hash} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          {getTypeName(tx.type)}
                          {getStatusBadge(tx.status)}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {tx.tokenSymbol ? (
                            <span>{formatTokenValue(tx.value, parseInt(tx.tokenDecimal || '18'))} {tx.tokenSymbol}</span>
                          ) : tx.value !== '0' ? (
                            <span>{parseFloat(formatEther(BigInt(tx.value))).toFixed(6)} ETH</span>
                          ) : (
                            <span className="font-mono text-xs">{formatAddress(tx.to)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-muted-foreground">
                        {formatRelativeTime(tx.timestamp)}
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                          {formatAddress(tx.hash)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyHash(tx.hash)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <a href={`${EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
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
              <p className="text-muted-foreground">
                {search ? 'No transactions match your search' : 'No transactions found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View on Explorer */}
      <div className="mt-4 text-center">
        <a
          href={`${EXPLORER_URL}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          View all on Explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default History;
