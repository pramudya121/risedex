import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, maxUint256, createPublicClient, http, createWalletClient, custom } from 'viem';
import { useAppStore } from '@/stores/useAppStore';
import { isNativeETH } from '@/constants/tokens';
import { CONTRACTS, RISE_TESTNET, ROUTER_ABI, ERC20_ABI } from '@/constants/contracts';
import { useToast } from '@/hooks/use-toast';
import { riseTestnet } from '@/config/wagmi';
import { RouteResult } from './useMultiHopRouting';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

export const useSwap = () => {
  const { address, connector } = useAccount();
  const { swap, addRecentTx, updateTxStatus } = useAppStore();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [allowance, setAllowance] = useState<bigint>(0n);

  const routerAddress = CONTRACTS[RISE_TESTNET.id].ROUTER as `0x${string}`;
  const wethAddress = CONTRACTS[RISE_TESTNET.id].WETH as `0x${string}`;

  // Check allowance on mount and when tokenIn changes
  useEffect(() => {
    const checkAllowance = async () => {
      if (!address || !swap.tokenIn || isNativeETH(swap.tokenIn.address)) {
        setAllowance(maxUint256);
        return;
      }

      try {
        const result = await (publicClient.readContract as any)({
          address: swap.tokenIn.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, routerAddress],
        });
        setAllowance(result as bigint);
      } catch {
        setAllowance(0n);
      }
    };

    checkAllowance();
  }, [address, swap.tokenIn, routerAddress]);

  const needsApproval = useCallback(() => {
    if (!swap.tokenIn || !swap.amountIn || isNativeETH(swap.tokenIn.address)) {
      return false;
    }
    
    try {
      const amountInWei = parseUnits(swap.amountIn, swap.tokenIn.decimals);
      return allowance < amountInWei;
    } catch {
      return false;
    }
  }, [swap.tokenIn, swap.amountIn, allowance]);

  const approve = async () => {
    if (!swap.tokenIn || !address || !connector) return;

    setIsApproving(true);
    try {
      const provider = await connector.getProvider();
      const walletClient = createWalletClient({
        chain: riseTestnet,
        transport: custom(provider as any),
        account: address,
      });

      const hash = await (walletClient.writeContract as any)({
        address: swap.tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [routerAddress, maxUint256],
      });

      addRecentTx({
        hash,
        type: 'approve',
        status: 'pending',
        timestamp: Date.now(),
      });

      toast({
        title: 'Approval Submitted',
        description: 'Waiting for confirmation...',
      });

      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh allowance
      const newAllowance = await (publicClient.readContract as any)({
        address: swap.tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, routerAddress],
      });
      setAllowance(newAllowance as bigint);
      
      updateTxStatus(hash, 'success');
      toast({
        title: 'Approval Successful',
        description: `${swap.tokenIn?.symbol} approved for trading`,
      });
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error?.shortMessage || error?.message || 'Transaction rejected',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const executeSwap = async (route?: RouteResult | null) => {
    if (!swap.tokenIn || !swap.tokenOut || !swap.amountIn || !swap.amountOut || !address || !connector) {
      return;
    }

    setIsSwapping(true);
    try {
      const provider = await connector.getProvider();
      const walletClient = createWalletClient({
        chain: riseTestnet,
        transport: custom(provider as any),
        account: address,
      });

      const amountIn = parseUnits(swap.amountIn, swap.tokenIn.decimals);
      const amountOutMin = parseUnits(
        (parseFloat(swap.amountOut) * (1 - swap.slippage / 100)).toFixed(swap.tokenOut.decimals),
        swap.tokenOut.decimals
      );
      const deadline = BigInt(Math.floor(Date.now() / 1000) + swap.deadline * 60);
      
      // Use the route path if provided, otherwise default to direct path
      let path: `0x${string}`[];
      if (route?.path) {
        path = route.path;
      } else {
        const tokenInAddress = isNativeETH(swap.tokenIn.address) ? wethAddress : swap.tokenIn.address as `0x${string}`;
        const tokenOutAddress = isNativeETH(swap.tokenOut.address) ? wethAddress : swap.tokenOut.address as `0x${string}`;
        path = [tokenInAddress, tokenOutAddress];
      }

      let hash: `0x${string}`;

      // Determine which swap function to use based on input/output tokens
      const isETHIn = isNativeETH(swap.tokenIn.address);
      const isETHOut = isNativeETH(swap.tokenOut.address);

      if (isETHIn) {
        // ETH -> Token (possibly multi-hop)
        hash = await (walletClient.writeContract as any)({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, path, address, deadline],
          value: amountIn,
        });
      } else if (isETHOut) {
        // Token -> ETH (possibly multi-hop)
        hash = await (walletClient.writeContract as any)({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, path, address, deadline],
        });
      } else {
        // Token -> Token (possibly multi-hop)
        hash = await (walletClient.writeContract as any)({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, amountOutMin, path, address, deadline],
        });
      }

      addRecentTx({
        hash,
        type: 'swap',
        status: 'pending',
        timestamp: Date.now(),
      });

      const routeInfo = route?.isMultiHop 
        ? ` via ${route.pathSymbols.join(' → ')}`
        : '';

      toast({
        title: 'Swap Submitted',
        description: `Swapping${routeInfo}...`,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      updateTxStatus(hash, 'success');
      
      toast({
        title: 'Swap Successful!',
        description: `Swapped ${swap.amountIn} ${swap.tokenIn?.symbol} for ${swap.amountOut} ${swap.tokenOut?.symbol}${routeInfo}`,
      });
    } catch (error: any) {
      toast({
        title: 'Swap Failed',
        description: error?.shortMessage || error?.message || 'Transaction rejected',
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
    allowance,
  };
};
