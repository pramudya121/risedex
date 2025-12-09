import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { formatEther } from 'viem';
import { createPublicClient, http } from 'viem';
import { CONTRACTS, FARMING_ABI, ERC20_ABI, PAIR_ABI } from '@/constants/contracts';
import { riseTestnet } from '@/config/wagmi';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_LIST } from '@/constants/tokens';

export interface StakingPool {
  id: string;
  pid: number;
  lpToken: `0x${string}`;
  token0Symbol: string;
  token1Symbol: string;
  totalStaked: bigint;
  rewardRate: bigint;
  apy: number;
  userStaked: bigint;
  userPendingRewards: bigint;
  userLpBalance: bigint;
  allocPoint: bigint;
}

const FARMING_ADDRESS = CONTRACTS[riseTestnet.id].FARMING as `0x${string}`;

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

const getTokenSymbol = (address: string): string => {
  const token = TOKEN_LIST.find(t => t.address.toLowerCase() === address.toLowerCase());
  if (token) return token.symbol;
  if (address.toLowerCase() === CONTRACTS[riseTestnet.id].WETH.toLowerCase()) return 'ETH';
  return address.slice(0, 6);
};

export const useStaking = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchPools = useCallback(async (): Promise<StakingPool[]> => {
    try {
      setIsLoading(true);

      const poolLength = await (publicClient.readContract as any)({
        address: FARMING_ADDRESS,
        abi: FARMING_ABI,
        functionName: 'poolLength',
      }) as bigint;

      const [rewardPerBlock, totalAllocPoint] = await Promise.all([
        (publicClient.readContract as any)({ address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'rewardPerBlock' }) as Promise<bigint>,
        (publicClient.readContract as any)({ address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'totalAllocPoint' }) as Promise<bigint>,
      ]);

      const pools: StakingPool[] = [];

      for (let pid = 0; pid < Number(poolLength); pid++) {
        try {
          const poolInfo = await (publicClient.readContract as any)({
            address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'poolInfo', args: [BigInt(pid)],
          }) as [string, bigint, bigint, bigint];

          const lpTokenAddress = poolInfo[0] as `0x${string}`;
          const allocPoint = poolInfo[1];

          let token0Symbol = 'TOKEN0', token1Symbol = 'TOKEN1';
          try {
            const [token0, token1] = await Promise.all([
              (publicClient.readContract as any)({ address: lpTokenAddress, abi: PAIR_ABI, functionName: 'token0' }) as Promise<string>,
              (publicClient.readContract as any)({ address: lpTokenAddress, abi: PAIR_ABI, functionName: 'token1' }) as Promise<string>,
            ]);
            token0Symbol = getTokenSymbol(token0);
            token1Symbol = getTokenSymbol(token1);
          } catch {}

          const totalStaked = await (publicClient.readContract as any)({
            address: lpTokenAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [FARMING_ADDRESS],
          }) as bigint;

          let userStaked = BigInt(0), userPendingRewards = BigInt(0), userLpBalance = BigInt(0);

          if (address) {
            try {
              const [userInfo, pendingReward, lpBalance] = await Promise.all([
                (publicClient.readContract as any)({ address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'userInfo', args: [BigInt(pid), address] }) as Promise<[bigint, bigint]>,
                (publicClient.readContract as any)({ address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'pendingReward', args: [BigInt(pid), address] }) as Promise<bigint>,
                (publicClient.readContract as any)({ address: lpTokenAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }) as Promise<bigint>,
              ]);
              userStaked = userInfo[0];
              userPendingRewards = pendingReward;
              userLpBalance = lpBalance;
            } catch {}
          }

          const blocksPerYear = BigInt(365 * 24 * 60 * 60 / 2);
          let apy = 0;
          if (totalStaked > 0 && totalAllocPoint > 0) {
            const yearlyRewards = rewardPerBlock * blocksPerYear * allocPoint / totalAllocPoint;
            apy = Math.min(Number(yearlyRewards * BigInt(100)) / Number(totalStaked), 9999);
          }

          pools.push({ id: String(pid), pid, lpToken: lpTokenAddress, token0Symbol, token1Symbol, totalStaked, rewardRate: rewardPerBlock, apy, userStaked, userPendingRewards, userLpBalance, allocPoint });
        } catch (e) { console.error(`Error fetching pool ${pid}:`, e); }
      }
      return pools;
    } catch (error) { console.error('Error fetching pools:', error); return []; }
    finally { setIsLoading(false); }
  }, [address]);

  const approveLpToken = async (lpTokenAddress: `0x${string}`, amount: bigint): Promise<boolean> => {
    if (!walletClient || !address) return false;
    try {
      const allowance = await (publicClient.readContract as any)({ address: lpTokenAddress, abi: ERC20_ABI, functionName: 'allowance', args: [address, FARMING_ADDRESS] }) as bigint;
      if (allowance >= amount) return true;

      toast({ title: 'Approving LP Tokens...', description: 'Please confirm the approval transaction' });
      const hash = await (walletClient.writeContract as any)({ chain: riseTestnet, address: lpTokenAddress, abi: ERC20_ABI, functionName: 'approve', args: [FARMING_ADDRESS, amount] });
      await publicClient.waitForTransactionReceipt({ hash });
      toast({ title: 'Approved!', description: 'LP token approval successful' });
      return true;
    } catch (error: any) {
      toast({ title: 'Approval Failed', description: error?.message || 'Failed to approve LP tokens', variant: 'destructive' });
      return false;
    }
  };

  const stake = useCallback(async (poolId: string, amount: bigint) => {
    if (!walletClient || !address) { toast({ title: 'Error', description: 'Please connect your wallet', variant: 'destructive' }); return false; }
    try {
      setIsStaking(true);
      const pid = BigInt(poolId);
      const poolInfo = await (publicClient.readContract as any)({ address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'poolInfo', args: [pid] }) as [string, bigint, bigint, bigint];
      const lpTokenAddress = poolInfo[0] as `0x${string}`;

      const approved = await approveLpToken(lpTokenAddress, amount);
      if (!approved) return false;

      toast({ title: 'Staking...', description: `Staking ${formatEther(amount)} LP tokens` });
      const hash = await (walletClient.writeContract as any)({ chain: riseTestnet, address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'deposit', args: [pid, amount] });
      await publicClient.waitForTransactionReceipt({ hash });
      toast({ title: 'Success!', description: `Successfully staked ${formatEther(amount)} LP tokens` });
      return true;
    } catch (error: any) {
      toast({ title: 'Staking Failed', description: error?.message || 'Failed to stake LP tokens', variant: 'destructive' });
      return false;
    } finally { setIsStaking(false); }
  }, [walletClient, address, toast]);

  const unstake = useCallback(async (poolId: string, amount: bigint) => {
    if (!walletClient || !address) { toast({ title: 'Error', description: 'Please connect your wallet', variant: 'destructive' }); return false; }
    try {
      setIsUnstaking(true);
      toast({ title: 'Unstaking...', description: `Unstaking ${formatEther(amount)} LP tokens` });
      const hash = await (walletClient.writeContract as any)({ chain: riseTestnet, address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'withdraw', args: [BigInt(poolId), amount] });
      await publicClient.waitForTransactionReceipt({ hash });
      toast({ title: 'Success!', description: `Successfully unstaked ${formatEther(amount)} LP tokens` });
      return true;
    } catch (error: any) {
      toast({ title: 'Unstaking Failed', description: error?.message || 'Failed to unstake LP tokens', variant: 'destructive' });
      return false;
    } finally { setIsUnstaking(false); }
  }, [walletClient, address, toast]);

  const claimRewards = useCallback(async (poolId: string) => {
    if (!walletClient || !address) { toast({ title: 'Error', description: 'Please connect your wallet', variant: 'destructive' }); return false; }
    try {
      setIsClaiming(true);
      toast({ title: 'Claiming Rewards...', description: 'Processing your reward claim' });
      const hash = await (walletClient.writeContract as any)({ chain: riseTestnet, address: FARMING_ADDRESS, abi: FARMING_ABI, functionName: 'withdraw', args: [BigInt(poolId), BigInt(0)] });
      await publicClient.waitForTransactionReceipt({ hash });
      toast({ title: 'Rewards Claimed!', description: 'Your rewards have been sent to your wallet' });
      return true;
    } catch (error: any) {
      toast({ title: 'Claim Failed', description: error?.message || 'Failed to claim rewards', variant: 'destructive' });
      return false;
    } finally { setIsClaiming(false); }
  }, [walletClient, address, toast]);

  return { fetchPools, stake, unstake, claimRewards, isLoading, isStaking, isUnstaking, isClaiming };
};
