import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Plus, Minus, ChevronDown, Droplets, Loader2, CheckCircle } from 'lucide-react';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { Token, TOKEN_LIST, NATIVE_ETH, getTokenLogoFallback, isNativeETH } from '@/constants/tokens';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/stores/useAppStore';
import { useLiquidity } from '@/hooks/useLiquidity';
import { formatUnits } from 'viem';

const Liquidity = () => {
  const { isConnected, address } = useAccount();
  const { balances } = useAppStore();
  const {
    isAddingLiquidity,
    isRemovingLiquidity,
    isApproving,
    isApprovingLp,
    pairInfo,
    fetchPairInfo,
    checkAllowance,
    checkLpAllowance,
    approveToken,
    addLiquidity,
    approveLpToken,
    removeLiquidityETH,
  } = useLiquidity();

  const [tokenA, setTokenA] = useState<Token>(NATIVE_ETH);
  const [tokenB, setTokenB] = useState<Token | null>(TOKEN_LIST[2]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [selectingToken, setSelectingToken] = useState<'A' | 'B' | null>(null);
  const [needsApprovalA, setNeedsApprovalA] = useState(false);
  const [needsApprovalB, setNeedsApprovalB] = useState(false);
  const [removePercent, setRemovePercent] = useState([50]);

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
    // Leave some ETH for gas if native
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
      setTokenA(token);
    } else {
      setTokenB(token);
    }
    setSelectingToken(null);
  };

  // Fetch pair info when tokens change
  useEffect(() => {
    if (tokenA && tokenB) {
      fetchPairInfo(tokenA, tokenB);
    }
  }, [tokenA, tokenB, fetchPairInfo]);

  // Check approvals when amounts change
  useEffect(() => {
    const checkApprovals = async () => {
      if (amountA && tokenA) {
        const hasAllowance = await checkAllowance(tokenA, amountA);
        setNeedsApprovalA(!hasAllowance);
      }
      if (amountB && tokenB) {
        const hasAllowance = await checkAllowance(tokenB, amountB);
        setNeedsApprovalB(!hasAllowance);
      }
    };
    checkApprovals();
  }, [amountA, amountB, tokenA, tokenB, checkAllowance]);

  // Handle add liquidity
  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !amountA || !amountB) return;

    // Check if approvals needed
    if (needsApprovalA && !isNativeETH(tokenA.address)) {
      await approveToken(tokenA);
      return;
    }
    if (needsApprovalB && tokenB && !isNativeETH(tokenB.address)) {
      await approveToken(tokenB);
      return;
    }

    await addLiquidity(tokenA, tokenB, amountA, amountB);
    setAmountA('');
    setAmountB('');
  };

  // Calculate LP amount to remove
  const lpAmountToRemove = pairInfo 
    ? formatUnits((pairInfo.userLpBalance * BigInt(removePercent[0])) / 100n, 18)
    : '0';

  // Check if LP needs approval
  const needsLpApproval = pairInfo && pairInfo.userLpBalance > 0n 
    ? !checkLpAllowance(lpAmountToRemove)
    : false;

  // Handle approve LP token
  const handleApproveLp = async () => {
    if (!pairInfo?.pairAddress) return;
    await approveLpToken(pairInfo.pairAddress);
  };

  // Handle remove liquidity
  const handleRemoveLiquidity = async () => {
    if (!pairInfo || !tokenB) return;

    // If LP needs approval, approve first
    if (needsLpApproval && pairInfo.pairAddress) {
      const approved = await approveLpToken(pairInfo.pairAddress);
      if (!approved) return;
    }

    // Remove liquidity
    await removeLiquidityETH(tokenB, lpAmountToRemove);
    
    // Refetch pair info to update allowance
    if (tokenA && tokenB) {
      fetchPairInfo(tokenA, tokenB);
    }
  };

  // Calculate pool share and LP tokens
  const poolShare = pairInfo && pairInfo.totalSupply > 0n
    ? ((pairInfo.userLpBalance * 10000n) / pairInfo.totalSupply)
    : 0n;

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isApproving) return 'Approving...';
    if (isAddingLiquidity) return 'Adding Liquidity...';
    if (needsApprovalA && !isNativeETH(tokenA.address)) return `Approve ${tokenA.symbol}`;
    if (needsApprovalB && tokenB && !isNativeETH(tokenB.address)) return `Approve ${tokenB.symbol}`;
    if (!amountA || !amountB) return 'Enter Amounts';
    return 'Add Liquidity';
  };

  const getRemoveButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isApprovingLp) return 'Approving LP...';
    if (isRemovingLiquidity) return 'Removing...';
    if (needsLpApproval) return 'Approve & Remove';
    return 'Remove Liquidity';
  };

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Liquidity</h1>
        <p className="text-muted-foreground">
          Add or remove liquidity to earn trading fees
        </p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Liquidity
          </TabsTrigger>
          <TabsTrigger value="remove" className="gap-2">
            <Minus className="h-4 w-4" />
            Remove
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="gradient-card border-border/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Add Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token A */}
              <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Token A</span>
                  <button 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setMaxAmount('A')}
                  >
                    Balance: {parseFloat(getBalance(tokenA)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    className="flex-1 text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMaxAmount('A')}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    MAX
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectingToken('A')}
                    className="gap-2 min-w-[130px] border-border/50"
                  >
                    {tokenA && (
                      <img
                        src={tokenA.logoURI || getTokenLogoFallback(tokenA.address)}
                        alt={tokenA.symbol}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    {tokenA?.symbol || 'Select'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Token B */}
              <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Token B</span>
                  <button 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setMaxAmount('B')}
                  >
                    Balance: {tokenB ? parseFloat(getBalance(tokenB)).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    className="flex-1 text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMaxAmount('B')}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    MAX
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectingToken('B')}
                    className="gap-2 min-w-[130px] border-border/50"
                  >
                    {tokenB && (
                      <img
                        src={tokenB.logoURI || getTokenLogoFallback(tokenB.address)}
                        alt={tokenB.symbol}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    {tokenB?.symbol || 'Select'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Pool Info */}
              {tokenA && tokenB && (
                <div className="rounded-lg bg-muted/20 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool Share</span>
                    <span>{(Number(poolShare) / 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your LP Tokens</span>
                    <span>{pairInfo ? parseFloat(formatUnits(pairInfo.userLpBalance, 18)).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'}</span>
                  </div>
                  {pairInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pool Reserves</span>
                        <span className="text-xs">
                          {parseFloat(formatUnits(pairInfo.reserve0, 18)).toFixed(4)} / {parseFloat(formatUnits(pairInfo.reserve1, tokenB?.decimals || 18)).toFixed(4)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Button
                className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 glow-purple"
                disabled={!isConnected || !amountA || !amountB || isAddingLiquidity || isApproving}
                onClick={handleAddLiquidity}
              >
                {(isAddingLiquidity || isApproving) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {getButtonText()}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remove">
          <Card className="gradient-card border-border/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-primary" />
                Remove Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pairInfo && pairInfo.userLpBalance > 0n ? (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {removePercent[0]}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(lpAmountToRemove).toFixed(6)} LP tokens
                    </p>
                  </div>

                  <Slider
                    value={removePercent}
                    onValueChange={setRemovePercent}
                    max={100}
                    min={1}
                    step={1}
                    className="my-6"
                  />

                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border/50"
                        onClick={() => setRemovePercent([pct])}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>

                  <div className="rounded-lg bg-muted/20 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your LP Balance</span>
                      <span>{parseFloat(formatUnits(pairInfo.userLpBalance, 18)).toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LP Approval Status</span>
                      <span className="flex items-center gap-1">
                        {needsLpApproval ? (
                          <span className="text-warning">Needs Approval</span>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-success">Approved</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 font-semibold bg-destructive hover:bg-destructive/90"
                    disabled={!isConnected || isRemovingLiquidity || isApprovingLp}
                    onClick={handleRemoveLiquidity}
                  >
                    {(isRemovingLiquidity || isApprovingLp) && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {getRemoveButtonText()}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No LP tokens to remove</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add liquidity first to get LP tokens
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Positions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Positions</h2>
        {pairInfo && pairInfo.userLpBalance > 0n ? (
          <Card className="gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                      <span className="text-xs font-bold">{tokenA.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                      <span className="text-xs font-bold">{tokenB?.symbol.slice(0, 2)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {tokenA.symbol} / {tokenB?.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pool Share: {(Number(poolShare) / 100).toFixed(4)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">
                    {parseFloat(formatUnits(pairInfo.userLpBalance, 18)).toFixed(6)} LP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="gradient-card border-border/50">
            <CardContent className="py-12 text-center">
              <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No liquidity positions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add liquidity to start earning fees
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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

export default Liquidity;
