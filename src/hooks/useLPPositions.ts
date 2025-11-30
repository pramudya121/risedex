import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, createPublicClient, http } from 'viem';
import { riseTestnet } from '@/config/wagmi';
import { CONTRACTS, PAIR_ABI, FACTORY_ABI } from '@/constants/contracts';
import { TOKEN_LIST, NATIVE_ETH, getTokenByAddress } from '@/constants/tokens';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

export interface LPPosition {
  pairAddress: string;
  token0: typeof TOKEN_LIST[0];
  token1: typeof TOKEN_LIST[0];
  lpBalance: string;
  lpBalanceFormatted: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  poolShare: string;
  token0Amount: string;
  token1Amount: string;
}

// Common pairs to check for LP positions
const COMMON_PAIRS = [
  { tokenA: NATIVE_ETH, tokenB: TOKEN_LIST.find(t => t.symbol === 'PRMZ')! },
  { tokenA: NATIVE_ETH, tokenB: TOKEN_LIST.find(t => t.symbol === 'RISE')! },
  { tokenA: NATIVE_ETH, tokenB: TOKEN_LIST.find(t => t.symbol === 'SGN')! },
  { tokenA: NATIVE_ETH, tokenB: TOKEN_LIST.find(t => t.symbol === 'WBTC')! },
  { tokenA: NATIVE_ETH, tokenB: TOKEN_LIST.find(t => t.symbol === 'SOL')! },
  { tokenA: TOKEN_LIST.find(t => t.symbol === 'PRMZ')!, tokenB: TOKEN_LIST.find(t => t.symbol === 'RISE')! },
].filter(p => p.tokenA && p.tokenB);

export const useLPPositions = () => {
  const { address, isConnected } = useAccount();
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLPValue, setTotalLPValue] = useState('0');

  const fetchLPPositions = useCallback(async () => {
    if (!address || !isConnected) {
      setPositions([]);
      return;
    }

    setIsLoading(true);
    const foundPositions: LPPosition[] = [];

    try {
      for (const pair of COMMON_PAIRS) {
        try {
          // Get WETH address for native ETH
          const tokenAAddress = pair.tokenA.isNative 
            ? CONTRACTS[riseTestnet.id].WETH 
            : pair.tokenA.address;
          const tokenBAddress = pair.tokenB.isNative 
            ? CONTRACTS[riseTestnet.id].WETH 
            : pair.tokenB.address;

          // Get pair address from factory
          const pairAddress = await (publicClient.readContract as any)({
            address: CONTRACTS[riseTestnet.id].FACTORY as `0x${string}`,
            abi: FACTORY_ABI,
            functionName: 'getPair',
            args: [tokenAAddress, tokenBAddress],
          });

          if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
            continue;
          }

          // Get LP token balance
          const lpBalance = await (publicClient.readContract as any)({
            address: pairAddress,
            abi: PAIR_ABI,
            functionName: 'balanceOf',
            args: [address],
          });

          if (lpBalance && lpBalance > 0n) {
            // Get reserves and total supply
            const [reserves, totalSupply, token0, token1] = await Promise.all([
              (publicClient.readContract as any)({
                address: pairAddress,
                abi: PAIR_ABI,
                functionName: 'getReserves',
              }),
              (publicClient.readContract as any)({
                address: pairAddress,
                abi: PAIR_ABI,
                functionName: 'totalSupply',
              }),
              (publicClient.readContract as any)({
                address: pairAddress,
                abi: PAIR_ABI,
                functionName: 'token0',
              }),
              (publicClient.readContract as any)({
                address: pairAddress,
                abi: PAIR_ABI,
                functionName: 'token1',
              }),
            ]);

            const poolShare = totalSupply > 0n 
              ? (Number(lpBalance) / Number(totalSupply)) * 100 
              : 0;

            // Calculate user's share of tokens
            const token0Amount = totalSupply > 0n
              ? (BigInt(reserves[0]) * lpBalance) / totalSupply
              : 0n;
            const token1Amount = totalSupply > 0n
              ? (BigInt(reserves[1]) * lpBalance) / totalSupply
              : 0n;

            // Get token info
            const token0Info = getTokenByAddress(token0) || pair.tokenA;
            const token1Info = getTokenByAddress(token1) || pair.tokenB;

            foundPositions.push({
              pairAddress,
              token0: token0Info,
              token1: token1Info,
              lpBalance: lpBalance.toString(),
              lpBalanceFormatted: formatUnits(lpBalance, 18),
              reserve0: formatUnits(reserves[0], token0Info.decimals),
              reserve1: formatUnits(reserves[1], token1Info.decimals),
              totalSupply: formatUnits(totalSupply, 18),
              poolShare: poolShare.toFixed(4),
              token0Amount: formatUnits(token0Amount, token0Info.decimals),
              token1Amount: formatUnits(token1Amount, token1Info.decimals),
            });
          }
        } catch (err) {
          // Pair doesn't exist or error fetching
          continue;
        }
      }

      setPositions(foundPositions);
    } catch (error) {
      console.error('Error fetching LP positions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchLPPositions();
  }, [fetchLPPositions]);

  return {
    positions,
    isLoading,
    totalLPValue,
    refetch: fetchLPPositions,
  };
};
