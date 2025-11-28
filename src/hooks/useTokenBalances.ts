import { useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { TOKEN_LIST, NATIVE_ETH } from '@/constants/tokens';
import { useAppStore } from '@/stores/useAppStore';

export const useTokenBalances = () => {
  const { address, isConnected } = useAccount();
  const { setBalance } = useAppStore();

  // Fetch native ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  useEffect(() => {
    if (!isConnected || !address) return;

    // Set ETH balance
    if (ethBalance) {
      setBalance(NATIVE_ETH.address, formatUnits(ethBalance.value, 18));
    }
  }, [ethBalance, isConnected, address, setBalance]);

  return { isConnected };
};
