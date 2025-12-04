import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS } from '@/constants/contracts';
import { riseTestnet } from '@/config/wagmi';
import { useToast } from '@/hooks/use-toast';

export interface StakingPool {
  id: string;
  lpToken: `0x${string}`;
  token0Symbol: string;
  token1Symbol: string;
  totalStaked: bigint;
  rewardRate: bigint;
  apy: number;
  userStaked: bigint;
  userPendingRewards: bigint;
  userLpBalance: bigint;
}

// Mock staking pools data - in production this would come from smart contracts
const STAKING_POOLS: Omit<StakingPool, 'totalStaked' | 'userStaked' | 'userPendingRewards' | 'userLpBalance' | 'rewardRate'>[] = [
  {
    id: '1',
    lpToken: CONTRACTS[riseTestnet.id].PAIR_ETH_PRMZ as `0x${string}`,
    token0Symbol: 'ETH',
    token1Symbol: 'PRMZ',
    apy: 45.2,
  },
  {
    id: '2',
    lpToken: '0x0000000000000000000000000000000000000002' as `0x${string}`,
    token0Symbol: 'ETH',
    token1Symbol: 'RISE',
    apy: 32.8,
  },
  {
    id: '3',
    lpToken: '0x0000000000000000000000000000000000000003' as `0x${string}`,
    token0Symbol: 'ETH',
    token1Symbol: 'WBTC',
    apy: 18.5,
  },
];

export const useStaking = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch staking pools with user data
  const fetchPools = useCallback(async (): Promise<StakingPool[]> => {
    try {
      setIsLoading(true);
      
      const pools: StakingPool[] = STAKING_POOLS.map((pool) => {
        // Simulated data for demo - in production would come from contracts
        const totalStaked = parseEther(String(Math.random() * 100000 + 50000));
        const userLpBalance = address ? parseEther(String(Math.random() * 100 + 10)) : BigInt(0);
        const userStaked = address ? userLpBalance / BigInt(2) : BigInt(0);
        const userPendingRewards = address ? parseEther(String(Math.random() * 50 + 5)) : BigInt(0);
        const rewardRate = parseEther(String(pool.apy / 365 / 100));

        return {
          ...pool,
          totalStaked,
          rewardRate,
          userStaked,
          userPendingRewards,
          userLpBalance,
        };
      });

      return pools;
    } catch (error) {
      console.error('Error fetching pools:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Stake LP tokens
  const stake = useCallback(async (poolId: string, amount: bigint) => {
    if (!walletClient || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsStaking(true);
      
      // In production, this would call the staking contract
      // For now, simulate the transaction
      toast({
        title: 'Staking...',
        description: `Staking ${formatEther(amount)} LP tokens`,
      });

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Success!',
        description: `Successfully staked ${formatEther(amount)} LP tokens`,
      });

      return true;
    } catch (error: any) {
      console.error('Stake error:', error);
      toast({
        title: 'Staking Failed',
        description: error?.message || 'Failed to stake LP tokens',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsStaking(false);
    }
  }, [walletClient, address, toast]);

  // Unstake LP tokens
  const unstake = useCallback(async (poolId: string, amount: bigint) => {
    if (!walletClient || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsUnstaking(true);
      
      toast({
        title: 'Unstaking...',
        description: `Unstaking ${formatEther(amount)} LP tokens`,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Success!',
        description: `Successfully unstaked ${formatEther(amount)} LP tokens`,
      });

      return true;
    } catch (error: any) {
      console.error('Unstake error:', error);
      toast({
        title: 'Unstaking Failed',
        description: error?.message || 'Failed to unstake LP tokens',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUnstaking(false);
    }
  }, [walletClient, address, toast]);

  // Claim rewards
  const claimRewards = useCallback(async (poolId: string) => {
    if (!walletClient || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsClaiming(true);
      
      toast({
        title: 'Claiming Rewards...',
        description: 'Processing your reward claim',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Rewards Claimed!',
        description: 'Your rewards have been sent to your wallet',
      });

      return true;
    } catch (error: any) {
      console.error('Claim error:', error);
      toast({
        title: 'Claim Failed',
        description: error?.message || 'Failed to claim rewards',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsClaiming(false);
    }
  }, [walletClient, address, toast]);

  return {
    fetchPools,
    stake,
    unstake,
    claimRewards,
    isLoading,
    isStaking,
    isUnstaking,
    isClaiming,
  };
};
