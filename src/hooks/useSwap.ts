import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/stores/useAppStore';
import { isNativeETH } from '@/constants/tokens';
import { useToast } from '@/hooks/use-toast';

export const useSwap = () => {
  const { address } = useAccount();
  const { swap, addRecentTx, updateTxStatus } = useAppStore();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const needsApproval = () => {
    if (!swap.tokenIn || !swap.amountIn || isNativeETH(swap.tokenIn.address)) {
      return false;
    }
    // For demo, assume approval is not needed
    return false;
  };

  const approve = async () => {
    if (!swap.tokenIn || !address) return;

    setIsApproving(true);
    try {
      // Simulate approval
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Approval Successful',
        description: `${swap.tokenIn.symbol} approved for trading`,
      });
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error?.message || 'Transaction rejected',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const executeSwap = async () => {
    if (!swap.tokenIn || !swap.tokenOut || !swap.amountIn || !swap.amountOut || !address) {
      return;
    }

    setIsSwapping(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}` as `0x${string}`;

      addRecentTx({
        hash: mockHash,
        type: 'swap',
        status: 'success',
        timestamp: Date.now(),
      });

      toast({
        title: 'Swap Successful!',
        description: `Swapped ${swap.amountIn} ${swap.tokenIn.symbol} for ${swap.amountOut} ${swap.tokenOut.symbol}`,
      });

    } catch (error: any) {
      toast({
        title: 'Swap Failed',
        description: error?.message || 'Transaction rejected',
        variant: 'destructive',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    needsApproval,
    approve,
    executeSwap,
    isApproving,
    isSwapping,
  };
};
