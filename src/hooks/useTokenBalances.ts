import { useEffect, useCallback, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, createPublicClient, http } from 'viem';
import { TOKEN_LIST, NATIVE_ETH } from '@/constants/tokens';
import { ERC20_ABI } from '@/constants/contracts';
import { useAppStore } from '@/stores/useAppStore';
import { riseTestnet } from '@/config/wagmi';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

export const useTokenBalances = () => {
  const { address, isConnected } = useAccount();
  const { setBalance } = useAppStore();
  const [isFetching, setIsFetching] = useState(false);

  // Fetch native ETH balance
  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Fetch ERC20 balances
  const fetchERC20Balances = useCallback(async () => {
    if (!address || !isConnected) return;
    setIsFetching(true);

    const erc20Tokens = TOKEN_LIST.filter(t => !t.isNative);
    
    for (const token of erc20Tokens) {
      try {
        // Use type assertion to bypass strict typing
        const balance = await (publicClient.readContract as any)({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        });
        
        const formatted = formatUnits(balance as bigint, token.decimals);
        setBalance(token.address, formatted);
      } catch {
        setBalance(token.address, '0');
      }
    }
    setIsFetching(false);
  }, [address, isConnected, setBalance]);

  // Update ETH balance in store
  useEffect(() => {
    if (ethBalance && isConnected) {
      setBalance(NATIVE_ETH.address, formatUnits(ethBalance.value, 18));
    }
  }, [ethBalance, isConnected, setBalance]);

  // Fetch ERC20 balances on mount and when address changes
  useEffect(() => {
    if (isConnected && address) {
      fetchERC20Balances();
    }
  }, [isConnected, address, fetchERC20Balances]);

  const refetchBalances = useCallback(() => {
    refetchEth();
    fetchERC20Balances();
  }, [refetchEth, fetchERC20Balances]);

  return { 
    isConnected, 
    refetchBalances,
    isFetching,
  };
};
