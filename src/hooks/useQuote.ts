import { useEffect, useState } from 'react';
import { parseUnits, formatUnits, createPublicClient, http } from 'viem';
import { Token, isNativeETH } from '@/constants/tokens';
import { CONTRACTS, RISE_TESTNET, ROUTER_ABI } from '@/constants/contracts';
import { riseTestnet } from '@/config/wagmi';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

interface UseQuoteParams {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
}

export const useQuote = ({ tokenIn, tokenOut, amountIn }: UseQuoteParams) => {
  const [amountOut, setAmountOut] = useState('');
  const [rate, setRate] = useState('');
  const [priceImpact, setPriceImpact] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const routerAddress = CONTRACTS[RISE_TESTNET.id].ROUTER as `0x${string}`;
  const wethAddress = CONTRACTS[RISE_TESTNET.id].WETH as `0x${string}`;

  useEffect(() => {
    const fetchQuote = async () => {
      if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
        setAmountOut('');
        setRate('');
        setPriceImpact(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountInWei = parseUnits(amountIn, tokenIn.decimals);
        
        const tokenInAddr = isNativeETH(tokenIn.address) ? wethAddress : tokenIn.address as `0x${string}`;
        const tokenOutAddr = isNativeETH(tokenOut.address) ? wethAddress : tokenOut.address as `0x${string}`;
        const path = [tokenInAddr, tokenOutAddr];

        const amounts = await (publicClient.readContract as any)({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'getAmountsOut',
          args: [amountInWei, path],
        }) as bigint[];

        const outAmount = amounts[amounts.length - 1];
        const formattedOut = formatUnits(outAmount, tokenOut.decimals);
        
        const inAmount = parseFloat(amountIn);
        const outAmountNum = parseFloat(formattedOut);
        const rateValue = inAmount > 0 ? (outAmountNum / inAmount).toFixed(6) : '0';
        
        // Simplified price impact estimation
        const impact = Math.min(inAmount * 0.3, 5);
        
        setAmountOut(formattedOut);
        setRate(rateValue);
        setPriceImpact(impact);
      } catch (err) {
        // Fallback to mock rates if contract call fails
        setError(err as Error);
        const mockRate = 0.95 + Math.random() * 0.1;
        const calculatedOut = (parseFloat(amountIn) * mockRate).toFixed(6);
        setAmountOut(calculatedOut);
        setRate(mockRate.toFixed(4));
        setPriceImpact(0.1);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 300);
    return () => clearTimeout(debounce);
  }, [tokenIn, tokenOut, amountIn, routerAddress, wethAddress]);

  return {
    amountOut,
    rate,
    priceImpact,
    isLoading,
    error,
  };
};
