import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ChevronDown, 
  Loader2, 
  AlertTriangle, 
  Check,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { Token, TOKEN_LIST, NATIVE_ETH, getTokenLogoFallback, isNativeETH } from '@/constants/tokens';
import { useAccount, useWalletClient } from 'wagmi';
import { useAppStore } from '@/stores/useAppStore';
import { parseUnits, maxUint256, createPublicClient, http } from 'viem';
import { CONTRACTS, ROUTER_ABI, ERC20_ABI, FACTORY_ABI } from '@/constants/contracts';
import { riseTestnet } from '@/config/wagmi';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

const CreatePool = () => {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { balances, addRecentTx, updateTxStatus } = useAppStore();

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [selectingToken, setSelectingToken] = useState<'A' | 'B' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [needsApprovalA, setNeedsApprovalA] = useState(false);
  const [needsApprovalB, setNeedsApprovalB] = useState(false);
  const [existingPair, setExistingPair] = useState<string | null>(null);
  const [isCheckingPair, setIsCheckingPair] = useState(false);

  const routerAddress = CONTRACTS[riseTestnet.id].ROUTER as `0x${string}`;
  const factoryAddress = CONTRACTS[riseTestnet.id].FACTORY as `0x${string}`;
  const wethAddress = CONTRACTS[riseTestnet.id].WETH as `0x${string}`;

  // Get balance for a token
  const getBalance = (token: Token | null) => {
    if (!token) return '0';
    return balances[token.address.toLowerCase()] || '0';
  };

  // Set max amount
  const setMaxAmount = (type: 'A' | 'B') => {
    const token = type === 'A' ? tokenA : tokenB;
    if (!token) return;
    const balance = getBalance(token);
    const amount = isNativeETH(token.address) 
      ? Math.max(0, parseFloat(balance) - 0.01).toString()
      : balance;
    if (type === 'A') {
      setAmountA(amount);
    } else {
      setAmountB(amount);
    }
  };

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'A') {
      if (tokenB && token.address.toLowerCase() === tokenB.address.toLowerCase()) {
        setTokenB(null);
      }
      setTokenA(token);
    } else {
      if (tokenA && token.address.toLowerCase() === tokenA.address.toLowerCase()) {
        setTokenA(null);
      }
      setTokenB(token);
    }
    setSelectingToken(null);
  };

  // Check if pair already exists
  useEffect(() => {
    const checkPair = async () => {
      if (!tokenA || !tokenB) {
        setExistingPair(null);
        return;
      }
      
      setIsCheckingPair(true);
      try {
        const addressA = isNativeETH(tokenA.address) ? wethAddress : tokenA.address as `0x${string}`;
        const addressB = isNativeETH(tokenB.address) ? wethAddress : tokenB.address as `0x${string}`;

        const pairAddress = await (publicClient.readContract as any)({
          address: factoryAddress,
          abi: FACTORY_ABI,
          functionName: 'getPair',
          args: [addressA, addressB],
        });

        if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
          setExistingPair(pairAddress);
        } else {
          setExistingPair(null);
        }
      } catch (error) {
        setExistingPair(null);
      } finally {
        setIsCheckingPair(false);
      }
    };

    checkPair();
  }, [tokenA, tokenB, factoryAddress, wethAddress]);

  // Check approvals
  useEffect(() => {
    const checkApprovals = async () => {
      if (!address) return;

      if (amountA && tokenA && !isNativeETH(tokenA.address)) {
        try {
          const allowance = await (publicClient.readContract as any)({
            address: tokenA.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [address, routerAddress],
          });
          setNeedsApprovalA((allowance as bigint) < parseUnits(amountA || '0', tokenA.decimals));
        } catch {
          setNeedsApprovalA(true);
        }
      } else {
        setNeedsApprovalA(false);
      }

      if (amountB && tokenB && !isNativeETH(tokenB.address)) {
        try {
          const allowance = await (publicClient.readContract as any)({
            address: tokenB.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [address, routerAddress],
          });
          setNeedsApprovalB((allowance as bigint) < parseUnits(amountB || '0', tokenB.decimals));
        } catch {
          setNeedsApprovalB(true);
        }
      } else {
        setNeedsApprovalB(false);
      }
    };

    checkApprovals();
  }, [amountA, amountB, tokenA, tokenB, address, routerAddress]);

  // Approve token
  const approveToken = async (token: Token) => {
    if (!walletClient || !address) return;
    setIsApproving(true);
    
    try {
      const hash = await (walletClient.writeContract as any)({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [routerAddress, maxUint256],
        chain: riseTestnet,
      });
      
      toast({ title: 'Approval Submitted', description: `Approving ${token.symbol}...` });
      addRecentTx({ hash, type: 'approve', status: 'pending', timestamp: Date.now() });
      
      await publicClient.waitForTransactionReceipt({ hash });
      updateTxStatus(hash, 'success');
      toast({ title: 'Approved', description: `${token.symbol} approved successfully` });
      
      // Recheck approvals
      if (token.address.toLowerCase() === tokenA?.address.toLowerCase()) {
        setNeedsApprovalA(false);
      } else {
        setNeedsApprovalB(false);
      }
    } catch (e: any) {
      toast({ title: 'Approval Failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsApproving(false);
    }
  };

  // Create pool
  const handleCreatePool = async () => {
    if (!walletClient || !address || !tokenA || !tokenB || !amountA || !amountB) return;

    // Check approvals first
    if (needsApprovalA && !isNativeETH(tokenA.address)) {
      await approveToken(tokenA);
      return;
    }
    if (needsApprovalB && !isNativeETH(tokenB.address)) {
      await approveToken(tokenB);
      return;
    }

    setIsCreating(true);
    try {
      const isETHA = isNativeETH(tokenA.address);
      const isETHB = isNativeETH(tokenB.address);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      let hash;
      if (isETHA || isETHB) {
        const token = isETHA ? tokenB : tokenA;
        const tokenAmt = isETHA ? amountB : amountA;
        const ethAmt = isETHA ? amountA : amountB;

        hash = await (walletClient.writeContract as any)({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'addLiquidityETH',
          args: [
            token.address as `0x${string}`,
            parseUnits(tokenAmt, token.decimals),
            0n,
            0n,
            address,
            deadline,
          ],
          value: parseUnits(ethAmt, 18),
          chain: riseTestnet,
        });
      } else {
        hash = await (walletClient.writeContract as any)({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'addLiquidity',
          args: [
            tokenA.address as `0x${string}`,
            tokenB.address as `0x${string}`,
            parseUnits(amountA, tokenA.decimals),
            parseUnits(amountB, tokenB.decimals),
            0n,
            0n,
            address,
            deadline,
          ],
          chain: riseTestnet,
        });
      }

      toast({ title: 'Creating Pool', description: 'Transaction submitted...' });
      addRecentTx({ hash, type: 'addLiquidity', status: 'pending', timestamp: Date.now() });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      updateTxStatus(hash, receipt.status === 'success' ? 'success' : 'failed');

      if (receipt.status === 'success') {
        toast({ 
          title: 'Pool Created!', 
          description: `${tokenA.symbol}/${tokenB.symbol} pool created successfully` 
        });
        // Navigate to pools page
        setTimeout(() => navigate('/pools'), 2000);
      } else {
        toast({ title: 'Transaction Failed', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!tokenA || !tokenB) return 'Select Tokens';
    if (!amountA || !amountB) return 'Enter Amounts';
    if (isCheckingPair) return 'Checking...';
    if (isApproving) return 'Approving...';
    if (isCreating) return 'Creating Pool...';
    if (needsApprovalA) return `Approve ${tokenA.symbol}`;
    if (needsApprovalB) return `Approve ${tokenB.symbol}`;
    if (existingPair) return 'Add to Existing Pool';
    return 'Create Pool';
  };

  const canSubmit = isConnected && tokenA && tokenB && amountA && amountB && 
                   parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && 
                   !isCreating && !isApproving && !isCheckingPair;

  return (
    <div className="container px-4 py-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">Create New Pool</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Liquidity Pool
          </span>
        </h1>
        <p className="text-muted-foreground">
          Create a new trading pair and earn 0.3% fees on all trades
        </p>
      </div>

      <Card className="gradient-card border-border/50 glow-purple-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Pool Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token A */}
          <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">First Token</span>
              {tokenA && (
                <button 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMaxAmount('A')}
                >
                  Balance: {parseFloat(getBalance(tokenA)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.0"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="flex-1 text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              />
              {tokenA && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaxAmount('A')}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  MAX
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectingToken('A')}
                className="gap-2 min-w-[140px] border-border/50"
              >
                {tokenA ? (
                  <>
                    <TokenLogo symbol={tokenA.symbol} size="sm" />
                    <span className="font-semibold">{tokenA.symbol}</span>
                  </>
                ) : (
                  <span>Select Token</span>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Plus Icon */}
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Token B */}
          <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Second Token</span>
              {tokenB && (
                <button 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMaxAmount('B')}
                >
                  Balance: {parseFloat(getBalance(tokenB)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.0"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="flex-1 text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              />
              {tokenB && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaxAmount('B')}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  MAX
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectingToken('B')}
                className="gap-2 min-w-[140px] border-border/50"
              >
                {tokenB ? (
                  <>
                    <TokenLogo symbol={tokenB.symbol} size="sm" />
                    <span className="font-semibold">{tokenB.symbol}</span>
                  </>
                ) : (
                  <span>Select Token</span>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Pool Preview */}
          {tokenA && tokenB && (
            <div className="rounded-lg bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pool</span>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <TokenLogo symbol={tokenA.symbol} size="sm" className="ring-2 ring-background" />
                    <TokenLogo symbol={tokenB.symbol} size="sm" className="ring-2 ring-background" />
                  </div>
                  <span className="font-medium">{tokenA.symbol}/{tokenB.symbol}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fee Tier</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary">0.3%</Badge>
              </div>
              {amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Initial Price</span>
                  <span className="text-sm">
                    1 {tokenA.symbol} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB.symbol}
                  </span>
                </div>
              )}
              {existingPair && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <Info className="h-4 w-4" />
                  <span>Pool already exists. You will add liquidity to it.</span>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          {tokenA && tokenB && !existingPair && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">First Liquidity Provider</div>
                <div className="text-xs opacity-80 mt-1">
                  The ratio of tokens you add will set the initial price. Make sure you're comfortable with this ratio.
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 glow-purple"
            disabled={!canSubmit}
            onClick={handleCreatePool}
          >
            {(isApproving || isCreating || isCheckingPair) && (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            )}
            {getButtonText()}
          </Button>

          {/* Navigation */}
          <div className="text-center">
            <Link to="/pools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              View existing pools →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Token Selector */}
      <TokenSelector
        open={selectingToken !== null}
        onClose={() => setSelectingToken(null)}
        onSelect={handleTokenSelect}
        selectedToken={selectingToken === 'A' ? tokenA : tokenB}
        otherToken={selectingToken === 'A' ? tokenB : tokenA}
      />
    </div>
  );
};

export default CreatePool;
