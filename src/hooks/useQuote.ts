import { useEffect, useState } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { Token } from '@/constants/tokens';
import { findBestRoute, RouteResult } from './useMultiHopRouting';

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
  const [route, setRoute] = useState<RouteResult | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
        setAmountOut('');
        setRate('');
        setPriceImpact(0);
        setRoute(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountInWei = parseUnits(amountIn, tokenIn.decimals);
        
        // Find best route using multi-hop routing
        const bestRoute = await findBestRoute(tokenIn, tokenOut, amountInWei);

        if (bestRoute) {
          const formattedOut = formatUnits(bestRoute.amountOut, tokenOut.decimals);
          const inAmount = parseFloat(amountIn);
          const outAmountNum = parseFloat(formattedOut);
          const rateValue = inAmount > 0 ? (outAmountNum / inAmount).toFixed(6) : '0';
          
          setAmountOut(formattedOut);
          setRate(rateValue);
          setPriceImpact(bestRoute.priceImpact);
          setRoute(bestRoute);
        } else {
          // No route found
          setError(new Error('No liquidity available for this pair'));
          setAmountOut('');
          setRate('');
          setPriceImpact(0);
          setRoute(null);
        }
      } catch (err) {
        setError(err as Error);
        setAmountOut('');
        setRate('');
        setPriceImpact(0);
        setRoute(null);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 300);
    return () => clearTimeout(debounce);
  }, [tokenIn, tokenOut, amountIn]);

  return {
    amountOut,
    rate,
    priceImpact,
    isLoading,
    error,
    route,
  };
};
