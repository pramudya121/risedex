import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits, formatUnits, maxUint256, createPublicClient, http } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { useTokenBalances } from './useTokenBalances';
import { Token, isNativeETH } from '@/constants/tokens';
import { CONTRACTS, ROUTER_ABI, ERC20_ABI, FACTORY_ABI, PAIR_ABI, RISE_TESTNET } from '@/constants/contracts';
import { riseTestnet } from '@/config/wagmi';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

export interface PairInfo {
  pairAddress: `0x${string}` | null;
  reserve0: bigint;
  reserve1: bigint;
  token0: `0x${string}`;
  token1: `0x${string}`;
  totalSupply: bigint;
  userLpBalance: bigint;
}

export const useLiquidity = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  const { addRecentTx, updateTxStatus } = useAppStore();
  const { refetchBalances } = useTokenBalances();

  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [pairInfo, setPairInfo] = useState<PairInfo | null>(null);

  const chainId = RISE_TESTNET.id;
  const routerAddress = CONTRACTS[chainId].ROUTER as `0x${string}`;
  const factoryAddress = CONTRACTS[chainId].FACTORY as `0x${string}`;
  const wethAddress = CONTRACTS[chainId].WETH as `0x${string}`;

  const getPairAddress = useCallback(async (tokenA: Token, tokenB: Token): Promise<`0x${string}` | null> => {
    const addressA = isNativeETH(tokenA.address) ? wethAddress : tokenA.address as `0x${string}`;
    const addressB = isNativeETH(tokenB.address) ? wethAddress : tokenB.address as `0x${string}`;

    try {
      const pairAddress = await (publicClient.readContract as any)({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: 'getPair',
        args: [addressA, addressB],
      });
      if (pairAddress === '0x0000000000000000000000000000000000000000') return null;
      return pairAddress as `0x${string}`;
    } catch {
      return null;
    }
  }, [factoryAddress, wethAddress]);

  const fetchPairInfo = useCallback(async (tokenA: Token, tokenB: Token) => {
    if (!address) return;
    const pairAddress = await getPairAddress(tokenA, tokenB);
    if (!pairAddress) { setPairInfo(null); return; }

    try {
      const [reserves, token0, token1, totalSupply, userLpBalance] = await Promise.all([
        (publicClient.readContract as any)({ address: pairAddress, abi: PAIR_ABI, functionName: 'getReserves' }),
        (publicClient.readContract as any)({ address: pairAddress, abi: PAIR_ABI, functionName: 'token0' }),
        (publicClient.readContract as any)({ address: pairAddress, abi: PAIR_ABI, functionName: 'token1' }),
        (publicClient.readContract as any)({ address: pairAddress, abi: PAIR_ABI, functionName: 'totalSupply' }),
        (publicClient.readContract as any)({ address: pairAddress, abi: PAIR_ABI, functionName: 'balanceOf', args: [address] }),
      ]);
      setPairInfo({
        pairAddress, reserve0: reserves[0], reserve1: reserves[1],
        token0: token0 as `0x${string}`, token1: token1 as `0x${string}`,
        totalSupply: totalSupply as bigint, userLpBalance: userLpBalance as bigint,
      });
    } catch { setPairInfo(null); }
  }, [address, getPairAddress]);

  const checkAllowance = useCallback(async (token: Token, amount: string): Promise<boolean> => {
    if (!address || isNativeETH(token.address)) return true;
    try {
      const allowance = await (publicClient.readContract as any)({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, routerAddress],
      });
      return (allowance as bigint) >= parseUnits(amount || '0', token.decimals);
    } catch { return false; }
  }, [address, routerAddress]);

  const approveToken = useCallback(async (token: Token) => {
    if (!walletClient || !address || isNativeETH(token.address)) return;
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
      toast({ title: 'Approved', description: `${token.symbol} approved` });
    } catch (e: any) {
      toast({ title: 'Approval Failed', description: e.message, variant: 'destructive' });
    } finally { setIsApproving(false); }
  }, [walletClient, address, routerAddress, toast, addRecentTx, updateTxStatus]);

  const addLiquidity = useCallback(async (tokenA: Token, tokenB: Token, amountA: string, amountB: string) => {
    if (!walletClient || !address) return;
    setIsAddingLiquidity(true);
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
          address: routerAddress, abi: ROUTER_ABI, functionName: 'addLiquidityETH',
          args: [token.address as `0x${string}`, parseUnits(tokenAmt, token.decimals), 0n, 0n, address, deadline],
          value: parseUnits(ethAmt, 18), chain: riseTestnet,
        });
      } else {
        hash = await (walletClient.writeContract as any)({
          address: routerAddress, abi: ROUTER_ABI, functionName: 'addLiquidity',
          args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`,
            parseUnits(amountA, tokenA.decimals), parseUnits(amountB, tokenB.decimals), 0n, 0n, address, deadline],
          chain: riseTestnet,
        });
      }
      toast({ title: 'Adding Liquidity', description: 'Transaction submitted...' });
      addRecentTx({ hash, type: 'addLiquidity', status: 'pending', timestamp: Date.now() });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      updateTxStatus(hash, receipt.status === 'success' ? 'success' : 'failed');
      toast({ title: receipt.status === 'success' ? 'Liquidity Added!' : 'Transaction Failed' });
      refetchBalances();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setIsAddingLiquidity(false); }
  }, [walletClient, address, routerAddress, toast, addRecentTx, updateTxStatus, refetchBalances]);

  const approveLpToken = useCallback(async (pairAddress: `0x${string}`) => {
    if (!walletClient || !address) return;
    setIsApproving(true);
    try {
      const hash = await (walletClient.writeContract as any)({
        address: pairAddress, abi: PAIR_ABI, functionName: 'approve',
        args: [routerAddress, maxUint256], chain: riseTestnet,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast({ title: 'LP Token Approved' });
    } catch (e: any) {
      toast({ title: 'Approval Failed', description: e.message, variant: 'destructive' });
    } finally { setIsApproving(false); }
  }, [walletClient, address, routerAddress, toast]);

  const removeLiquidityETH = useCallback(async (token: Token, lpAmount: string) => {
    if (!walletClient || !address) return;
    setIsRemovingLiquidity(true);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const hash = await (walletClient.writeContract as any)({
        address: routerAddress, abi: ROUTER_ABI, functionName: 'removeLiquidityETH',
        args: [token.address as `0x${string}`, parseUnits(lpAmount, 18), 0n, 0n, address, deadline],
        chain: riseTestnet,
      });
      toast({ title: 'Removing Liquidity' });
      addRecentTx({ hash, type: 'removeLiquidity', status: 'pending', timestamp: Date.now() });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      updateTxStatus(hash, receipt.status === 'success' ? 'success' : 'failed');
      toast({ title: receipt.status === 'success' ? 'Liquidity Removed!' : 'Failed' });
      refetchBalances();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setIsRemovingLiquidity(false); }
  }, [walletClient, address, routerAddress, toast, addRecentTx, updateTxStatus, refetchBalances]);

  return {
    isAddingLiquidity, isRemovingLiquidity, isApproving, pairInfo,
    getPairAddress, fetchPairInfo, checkAllowance, approveToken,
    addLiquidity, approveLpToken, removeLiquidityETH,
  };
};
