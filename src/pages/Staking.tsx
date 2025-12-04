import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Coins, 
  TrendingUp, 
  Wallet, 
  Gift, 
  Loader2, 
  Info,
  ArrowUpRight,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useStaking, StakingPool } from '@/hooks/useStaking';
import { TokenLogo } from '@/components/shared/TokenLogo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Staking = () => {
  const { address, isConnected } = useAccount();
  const { fetchPools, stake, unstake, claimRewards, isLoading, isStaking, isUnstaking, isClaiming } = useStaking();
  
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [actionType, setActionType] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState([0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch pools on mount and when address changes
  useEffect(() => {
    const loadPools = async () => {
      const data = await fetchPools();
      setPools(data);
    };
    loadPools();
  }, [fetchPools, address]);

  // Calculate total stats
  const totalStakedValue = pools.reduce((sum, p) => sum + Number(formatEther(p.userStaked)), 0);
  const totalPendingRewards = pools.reduce((sum, p) => sum + Number(formatEther(p.userPendingRewards)), 0);
  const avgApy = pools.length > 0 ? pools.reduce((sum, p) => sum + p.apy, 0) / pools.length : 0;

  const handleOpenStakeDialog = (pool: StakingPool, type: 'stake' | 'unstake') => {
    setSelectedPool(pool);
    setActionType(type);
    setAmount('');
    setPercentage([0]);
    setDialogOpen(true);
  };

  const handlePercentageChange = (value: number[]) => {
    setPercentage(value);
    if (selectedPool) {
      const maxBalance = actionType === 'stake' 
        ? selectedPool.userLpBalance 
        : selectedPool.userStaked;
      const newAmount = (Number(formatEther(maxBalance)) * value[0]) / 100;
      setAmount(newAmount.toFixed(6));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (selectedPool && value) {
      const maxBalance = actionType === 'stake' 
        ? selectedPool.userLpBalance 
        : selectedPool.userStaked;
      const pct = (parseFloat(value) / Number(formatEther(maxBalance))) * 100;
      setPercentage([Math.min(100, Math.max(0, pct))]);
    }
  };

  const handleAction = async () => {
    if (!selectedPool || !amount) return;
    
    const amountWei = parseEther(amount);
    let success = false;
    
    if (actionType === 'stake') {
      success = await stake(selectedPool.id, amountWei);
    } else {
      success = await unstake(selectedPool.id, amountWei);
    }
    
    if (success) {
      setDialogOpen(false);
      const data = await fetchPools();
      setPools(data);
    }
  };

  const handleClaimRewards = async (pool: StakingPool) => {
    const success = await claimRewards(pool.id);
    if (success) {
      const data = await fetchPools();
      setPools(data);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  if (!isConnected) {
    return (
      <div className="container px-4 py-8">
        <Card className="gradient-card border-border/50 max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to start staking LP tokens and earn rewards
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Staking & Farming
          </h1>
          <p className="text-muted-foreground">
            Stake your LP tokens to earn rewards and boost your yield
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="gradient-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Your Staked</span>
              </div>
              <div className="text-xl font-bold text-glow">
                {formatNumber(totalStakedValue)} LP
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Pending Rewards</span>
              </div>
              <div className="text-xl font-bold text-success">
                {formatNumber(totalPendingRewards)} RISE
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Avg APY</span>
              </div>
              <div className="text-xl font-bold text-glow">
                {avgApy.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Active Pools</span>
              </div>
              <div className="text-xl font-bold text-glow">
                {pools.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staking Pools */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Staking Pools</span>
              <Badge variant="outline" className="text-primary border-primary/50">
                Earn RISE Rewards
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border/30">
                  <span>Pool</span>
                  <span className="text-right w-24">APY</span>
                  <span className="text-right w-28">Total Staked</span>
                  <span className="text-right w-28">Your Stake</span>
                  <span className="text-right w-28">Rewards</span>
                  <span className="text-right w-40">Actions</span>
                </div>

                {pools.map((pool) => (
                  <div
                    key={pool.id}
                    className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center">
                      {/* Pool Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <TokenLogo symbol={pool.token0Symbol} size="md" className="ring-2 ring-background" />
                          <TokenLogo symbol={pool.token1Symbol} size="md" className="ring-2 ring-background" />
                        </div>
                        <div>
                          <div className="font-semibold">{pool.token0Symbol}/{pool.token1Symbol}</div>
                          <div className="text-xs text-muted-foreground">LP Token</div>
                        </div>
                      </div>

                      {/* APY */}
                      <div className="text-right w-24">
                        <div className="text-lg font-bold text-success">{pool.apy}%</div>
                        <div className="text-xs text-muted-foreground md:hidden">APY</div>
                      </div>

                      {/* Total Staked */}
                      <div className="text-right w-28">
                        <div className="font-medium">{formatNumber(Number(formatEther(pool.totalStaked)))}</div>
                        <div className="text-xs text-muted-foreground">Total Staked</div>
                      </div>

                      {/* Your Stake */}
                      <div className="text-right w-28">
                        <div className="font-medium">
                          {Number(formatEther(pool.userStaked)).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">Your Stake</div>
                      </div>

                      {/* Pending Rewards */}
                      <div className="text-right w-28">
                        <div className="font-medium text-success">
                          {Number(formatEther(pool.userPendingRewards)).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">RISE</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end w-40">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenStakeDialog(pool, 'stake')}
                          disabled={pool.userLpBalance === BigInt(0)}
                          className="gap-1"
                        >
                          <Lock className="h-3 w-3" />
                          Stake
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenStakeDialog(pool, 'unstake')}
                          disabled={pool.userStaked === BigInt(0)}
                          className="gap-1"
                        >
                          <Unlock className="h-3 w-3" />
                          Unstake
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => handleClaimRewards(pool)}
                              disabled={pool.userPendingRewards === BigInt(0) || isClaiming}
                              className="gap-1 bg-success/20 text-success hover:bg-success/30 border-0"
                            >
                              {isClaiming ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Gift className="h-3 w-3" />
                              )}
                              Claim
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Claim {Number(formatEther(pool.userPendingRewards)).toFixed(4)} RISE</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="gradient-card border-border/50 mt-6">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How Staking Works</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide liquidity to earn LP tokens</li>
                  <li>Stake LP tokens here to earn RISE rewards</li>
                  <li>Rewards accumulate every block</li>
                  <li>Claim rewards anytime - no lock period</li>
                  <li>Unstake LP tokens to withdraw your liquidity position</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stake/Unstake Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === 'stake' ? (
                  <>
                    <Lock className="h-5 w-5 text-primary" />
                    Stake LP Tokens
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-primary" />
                    Unstake LP Tokens
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedPool && (
                  <span className="flex items-center gap-2 mt-2">
                    <TokenLogo symbol={selectedPool.token0Symbol} size="sm" />
                    <TokenLogo symbol={selectedPool.token1Symbol} size="sm" className="-ml-3" />
                    {selectedPool.token0Symbol}/{selectedPool.token1Symbol} Pool
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedPool && (
              <div className="space-y-4 py-4">
                {/* Balance Info */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {actionType === 'stake' ? 'Available LP Balance' : 'Staked Balance'}
                  </span>
                  <span className="font-medium">
                    {Number(formatEther(
                      actionType === 'stake' ? selectedPool.userLpBalance : selectedPool.userStaked
                    )).toFixed(6)} LP
                  </span>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pr-16 text-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary"
                      onClick={() => handlePercentageChange([100])}
                    >
                      MAX
                    </Button>
                  </div>

                  {/* Percentage Slider */}
                  <Slider
                    value={percentage}
                    onValueChange={handlePercentageChange}
                    max={100}
                    step={1}
                    className="mt-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{percentage[0].toFixed(0)}%</span>
                    <span>100%</span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePercentageChange([pct])}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isStaking || isUnstaking}
                >
                  {(isStaking || isUnstaking) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {actionType === 'stake' ? 'Staking...' : 'Unstaking...'}
                    </>
                  ) : (
                    <>
                      {actionType === 'stake' ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Stake LP Tokens
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Unstake LP Tokens
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Staking;
