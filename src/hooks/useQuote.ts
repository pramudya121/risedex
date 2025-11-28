import { useState, useEffect } from 'react';
import { Token } from '@/constants/tokens';

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

  useEffect(() => {
    if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
      setAmountOut('');
      setRate('');
      setPriceImpact(0);
      return;
    }

    setIsLoading(true);

    // Simulate quote fetching with mock rates
    const timer = setTimeout(() => {
      // Mock exchange rates based on token pairs
      const mockRates: Record<string, number> = {
        'ETH-PRMZ': 42735.5,
        'ETH-RISE': 6410.25,
        'ETH-SGN': 364420.8,
        'ETH-WBTC': 0.0483,
        'ETH-SOL': 18.2,
        'ETH-WETH': 1,
        'PRMZ-ETH': 0.0000234,
        'RISE-ETH': 0.000156,
        'SGN-ETH': 0.00000274,
        'WBTC-ETH': 20.7,
        'SOL-ETH': 0.055,
        'WETH-ETH': 1,
      };

      const pairKey = `${tokenIn.symbol}-${tokenOut.symbol}`;
      const reversePairKey = `${tokenOut.symbol}-${tokenIn.symbol}`;
      
      let mockRate = mockRates[pairKey];
      if (!mockRate && mockRates[reversePairKey]) {
        mockRate = 1 / mockRates[reversePairKey];
      }
      if (!mockRate) {
        // Default rate with some variance
        mockRate = 0.95 + Math.random() * 0.1;
      }

      const calculatedOut = (parseFloat(amountIn) * mockRate).toFixed(6);
      const impact = Math.min(parseFloat(amountIn) * 0.001, 5);

      setAmountOut(calculatedOut);
      setRate(mockRate.toFixed(6));
      setPriceImpact(impact);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [tokenIn, tokenOut, amountIn]);

  return {
    amountOut,
    rate,
    priceImpact,
    isLoading,
    error: null,
  };
};
