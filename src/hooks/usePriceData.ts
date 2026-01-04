import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { riseTestnet } from '@/config/wagmi';
import { CONTRACTS, ROUTER_ABI, FACTORY_ABI, PAIR_ABI } from '@/constants/contracts';
import { TOKEN_LIST, NATIVE_ETH, Token } from '@/constants/tokens';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

export interface TokenPrice {
  symbol: string;
  address: string;
  priceUSD: number;
  priceETH: number;
  change24h: number;
  volume24h: number;
}

// Base ETH price (in production this would come from an oracle or external API)
const BASE_ETH_PRICE_USD = 3200;

export const usePriceData = () => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    const priceData: Record<string, TokenPrice> = {};

    try {
      const wethAddress = CONTRACTS[riseTestnet.id].WETH as `0x${string}`;
      const factoryAddress = CONTRACTS[riseTestnet.id].FACTORY as `0x${string}`;
      const routerAddress = CONTRACTS[riseTestnet.id].ROUTER as `0x${string}`;

      // ETH price is our base
      priceData['ETH'] = {
        symbol: 'ETH',
        address: NATIVE_ETH.address,
        priceUSD: BASE_ETH_PRICE_USD,
        priceETH: 1,
        change24h: 2.5 + (Math.random() - 0.5) * 2, // Simulated change
        volume24h: 8500000,
      };

      priceData['WETH'] = {
        symbol: 'WETH',
        address: wethAddress,
        priceUSD: BASE_ETH_PRICE_USD,
        priceETH: 1,
        change24h: 2.5 + (Math.random() - 0.5) * 2,
        volume24h: 8500000,
      };

      // Fetch prices for other tokens by getting quote from router
      const tokensToPrice = TOKEN_LIST.filter(t => !t.isNative && t.symbol !== 'WETH');

      for (const token of tokensToPrice) {
        try {
          // Check if pair exists
          const pairAddress = await (publicClient.readContract as any)({
            address: factoryAddress,
            abi: FACTORY_ABI,
            functionName: 'getPair',
            args: [wethAddress, token.address as `0x${string}`],
          });

          if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
            continue;
          }

          // Get reserves to calculate price
          const [reserves, token0] = await Promise.all([
            (publicClient.readContract as any)({
              address: pairAddress,
              abi: PAIR_ABI,
              functionName: 'getReserves',
            }),
            (publicClient.readContract as any)({
              address: pairAddress,
              abi: PAIR_ABI,
              functionName: 'token0',
            }),
          ]);

          // Determine which reserve is WETH
          const isToken0Weth = (token0 as string).toLowerCase() === wethAddress.toLowerCase();
          const wethReserve = isToken0Weth ? reserves[0] : reserves[1];
          const tokenReserve = isToken0Weth ? reserves[1] : reserves[0];

          // Calculate price in ETH
          const wethReserveFormatted = parseFloat(formatUnits(wethReserve, 18));
          const tokenReserveFormatted = parseFloat(formatUnits(tokenReserve, token.decimals));

          const priceETH = tokenReserveFormatted > 0 
            ? wethReserveFormatted / tokenReserveFormatted 
            : 0;
          const priceUSD = priceETH * BASE_ETH_PRICE_USD;

          // Estimate volume based on reserves
          const poolTVL = wethReserveFormatted * BASE_ETH_PRICE_USD * 2;
          const volume24h = poolTVL * (0.15 + Math.random() * 0.1);

          priceData[token.symbol] = {
            symbol: token.symbol,
            address: token.address,
            priceUSD,
            priceETH,
            change24h: (Math.random() - 0.5) * 10, // Simulated -5% to +5%
            volume24h,
          };
        } catch (err) {
          console.error(`Error fetching price for ${token.symbol}:`, err);
        }
      }

      setPrices(priceData);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // Refresh every 15 seconds
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getPrice = useCallback((symbol: string): number => {
    return prices[symbol]?.priceUSD || 0;
  }, [prices]);

  const getPriceETH = useCallback((symbol: string): number => {
    return prices[symbol]?.priceETH || 0;
  }, [prices]);

  return {
    prices,
    isLoading,
    getPrice,
    getPriceETH,
    refetch: fetchPrices,
  };
};
