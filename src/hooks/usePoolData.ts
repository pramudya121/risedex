import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { riseTestnet } from '@/config/wagmi';
import { CONTRACTS, FACTORY_ABI, PAIR_ABI } from '@/constants/contracts';
import { TOKEN_LIST, NATIVE_ETH, getTokenByAddress, Token } from '@/constants/tokens';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

export interface PoolData {
  id: string;
  pairAddress: string;
  tokenA: Token;
  tokenB: Token;
  reserve0: bigint;
  reserve1: bigint;
  reserve0Formatted: string;
  reserve1Formatted: string;
  totalSupply: bigint;
  totalSupplyFormatted: string;
  // Calculated values
  tvl: number;
  volume24h: number;
  apy: number;
  fees24h: number;
}

// Define common pairs to check
const POOL_PAIRS = [
  { tokenA: 'ETH', tokenB: 'PRMZ' },
  { tokenA: 'ETH', tokenB: 'RISE' },
  { tokenA: 'ETH', tokenB: 'SGN' },
  { tokenA: 'ETH', tokenB: 'WBTC' },
  { tokenA: 'ETH', tokenB: 'SOL' },
  { tokenA: 'PRMZ', tokenB: 'RISE' },
];

const getTokenBySymbol = (symbol: string): Token | undefined => {
  if (symbol === 'ETH') return NATIVE_ETH;
  return TOKEN_LIST.find(t => t.symbol === symbol);
};

export const usePoolData = () => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTVL, setTotalTVL] = useState(0);
  const [totalVolume24h, setTotalVolume24h] = useState(0);
  const [totalFees24h, setTotalFees24h] = useState(0);

  const fetchPools = useCallback(async () => {
    setIsLoading(true);
    const fetchedPools: PoolData[] = [];

    try {
      const wethAddress = CONTRACTS[riseTestnet.id].WETH as `0x${string}`;
      const factoryAddress = CONTRACTS[riseTestnet.id].FACTORY as `0x${string}`;

      for (let i = 0; i < POOL_PAIRS.length; i++) {
        const pair = POOL_PAIRS[i];
        const tokenA = getTokenBySymbol(pair.tokenA);
        const tokenB = getTokenBySymbol(pair.tokenB);

        if (!tokenA || !tokenB) continue;

        try {
          const addressA = tokenA.isNative ? wethAddress : tokenA.address as `0x${string}`;
          const addressB = tokenB.isNative ? wethAddress : tokenB.address as `0x${string}`;

          // Get pair address
          const pairAddress = await (publicClient.readContract as any)({
            address: factoryAddress,
            abi: FACTORY_ABI,
            functionName: 'getPair',
            args: [addressA, addressB],
          });

          if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
            continue;
          }

          // Get reserves and total supply
          const [reserves, totalSupply, token0Address] = await Promise.all([
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
          ]);

          // Determine which reserve corresponds to which token
          const isToken0First = (token0Address as string).toLowerCase() === addressA.toLowerCase();
          const reserve0 = isToken0First ? reserves[0] : reserves[1];
          const reserve1 = isToken0First ? reserves[1] : reserves[0];

          // Get token info for decimals
          const token0Info = tokenA;
          const token1Info = tokenB;

          const reserve0Formatted = formatUnits(reserve0, token0Info.decimals);
          const reserve1Formatted = formatUnits(reserve1, token1Info.decimals);

          // Calculate TVL (simplified - using ETH price as $3200)
          const ethPrice = 3200;
          const prmzPrice = 0.025;
          const risePrice = 0.16;
          const sgnPrice = 0.009;
          const wbtcPrice = 67000;
          const solPrice = 180;

          const getPriceUSD = (symbol: string) => {
            switch (symbol) {
              case 'ETH': case 'WETH': return ethPrice;
              case 'PRMZ': return prmzPrice;
              case 'RISE': return risePrice;
              case 'SGN': return sgnPrice;
              case 'WBTC': return wbtcPrice;
              case 'SOL': return solPrice;
              default: return 0;
            }
          };

          const value0 = parseFloat(reserve0Formatted) * getPriceUSD(token0Info.symbol);
          const value1 = parseFloat(reserve1Formatted) * getPriceUSD(token1Info.symbol);
          const tvl = value0 + value1;

          // Estimate volume and fees (based on TVL - typically 10-30% of TVL daily)
          const volumeRatio = 0.15 + Math.random() * 0.15; // 15-30%
          const volume24h = tvl * volumeRatio;
          const fees24h = volume24h * 0.003; // 0.3% fee

          // Calculate APY based on fees and TVL
          const apy = tvl > 0 ? ((fees24h * 365) / tvl) * 100 : 0;

          fetchedPools.push({
            id: String(i + 1),
            pairAddress,
            tokenA: token0Info,
            tokenB: token1Info,
            reserve0,
            reserve1,
            reserve0Formatted,
            reserve1Formatted,
            totalSupply,
            totalSupplyFormatted: formatUnits(totalSupply, 18),
            tvl,
            volume24h,
            apy: Math.min(apy, 100), // Cap at 100%
            fees24h,
          });
        } catch (err) {
          console.error(`Error fetching pool ${pair.tokenA}/${pair.tokenB}:`, err);
        }
      }

      // Calculate totals
      const totalTVLValue = fetchedPools.reduce((acc, pool) => acc + pool.tvl, 0);
      const totalVolumeValue = fetchedPools.reduce((acc, pool) => acc + pool.volume24h, 0);
      const totalFeesValue = fetchedPools.reduce((acc, pool) => acc + pool.fees24h, 0);

      setPools(fetchedPools);
      setTotalTVL(totalTVLValue);
      setTotalVolume24h(totalVolumeValue);
      setTotalFees24h(totalFeesValue);
    } catch (error) {
      console.error('Error fetching pools:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPools, 30000);
    return () => clearInterval(interval);
  }, [fetchPools]);

  return {
    pools,
    isLoading,
    totalTVL,
    totalVolume24h,
    totalFees24h,
    totalPools: pools.length,
    refetch: fetchPools,
  };
};
