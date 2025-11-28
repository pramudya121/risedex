import { ReactNode, useEffect } from 'react';
import { useTokenBalances } from '@/hooks/useTokenBalances';

interface Web3ProviderProps {
  children: ReactNode;
}

// Component to initialize and refresh token balances
const BalanceUpdater = () => {
  const { refetchBalances, isConnected } = useTokenBalances();

  // Refetch balances periodically when connected
  useEffect(() => {
    if (!isConnected) return;

    // Initial fetch
    refetchBalances();

    // Refetch every 15 seconds
    const interval = setInterval(() => {
      refetchBalances();
    }, 15000);

    return () => clearInterval(interval);
  }, [isConnected, refetchBalances]);

  return null;
};

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <>
      <BalanceUpdater />
      {children}
    </>
  );
};
