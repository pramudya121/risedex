import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowDown, 
  Settings, 
  RefreshCw, 
  ChevronDown,
  AlertTriangle,
  Loader2,
  ArrowUpDown
} from 'lucide-react';
import { TokenSelector } from './TokenSelector';
import { SwapSettings } from './SwapSettings';
import { useAppStore } from '@/stores/useAppStore';
import { useAccount } from 'wagmi';
import { Token, getTokenLogoFallback } from '@/constants/tokens';
import { cn } from '@/lib/utils';

export const SwapCard = () => {
  const { address, isConnected } = useAccount();
  const {
    swap,
    setTokenIn,
    setTokenOut,
    setAmountIn,
    setAmountOut,
    swapTokens,
    balances,
  } = useAppStore();

  const [selectingToken, setSelectingToken] = useState<'in' | 'out' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [rate, setRate] = useState<string>('');

  // Simulate price fetch
  useEffect(() => {
    if (swap.amountIn && swap.tokenIn && swap.tokenOut) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        // Simulate exchange rate calculation
        const mockRate = 0.95 + Math.random() * 0.1;
        const amountOut = (parseFloat(swap.amountIn) * mockRate).toFixed(6);
        setAmountOut(amountOut);
        setRate(`1 ${swap.tokenIn.symbol} = ${mockRate.toFixed(4)} ${swap.tokenOut?.symbol}`);
        setPriceImpact(Math.random() * 2);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAmountOut('');
      setRate('');
      setPriceImpact(0);
    }
  }, [swap.amountIn, swap.tokenIn, swap.tokenOut]);

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'in') {
      setTokenIn(token);
    } else {
      setTokenOut(token);
    }
    setSelectingToken(null);
  };

  const handleSwap = async () => {
    // Swap implementation
  };

  const getBalance = (token: Token | null) => {
    if (!token) return '0';
    return balances[token.address.toLowerCase()] || '0';
  };

  const TokenButton = ({ 
    token, 
    onClick 
  }: { 
    token: Token | null; 
    onClick: () => void;
  }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <Button
        variant="outline"
        onClick={onClick}
        className="gap-2 min-w-[140px] justify-between border-border/50 hover:border-primary/50 bg-muted/30"
      >
        {token ? (
          <>
            <div className="flex items-center gap-2">
              <img
                src={imageError ? getTokenLogoFallback(token.address) : token.logoURI}
                alt={token.symbol}
                className="h-6 w-6 rounded-full"
                onError={() => setImageError(true)}
              />
              <span className="font-semibold">{token.symbol}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </>
        ) : (
          <>
            <span>Select token</span>
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
    );
  };

  return (
    <>
      <Card className="w-full max-w-md gradient-card border-border/50 glow-purple-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Swap</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                setAmountIn('');
                setAmountOut('');
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* From Token */}
          <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm text-muted-foreground">
                Balance: {parseFloat(getBalance(swap.tokenIn)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.0"
                value={swap.amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1 text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              />
              <TokenButton 
                token={swap.tokenIn} 
                onClick={() => setSelectingToken('in')} 
              />
            </div>
            {swap.tokenIn && (
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <Button
                    key={pct}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const bal = parseFloat(getBalance(swap.tokenIn));
                      setAmountIn(((bal * pct) / 100).toString());
                    }}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={swapTokens}
              className="rounded-full h-10 w-10 bg-card border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm text-muted-foreground">
                Balance: {parseFloat(getBalance(swap.tokenOut)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-8 flex-1" />
              ) : (
                <Input
                  type="number"
                  placeholder="0.0"
                  value={swap.amountOut}
                  readOnly
                  className="flex-1 text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                />
              )}
              <TokenButton 
                token={swap.tokenOut} 
                onClick={() => setSelectingToken('out')} 
              />
            </div>
          </div>

          {/* Price Info */}
          {rate && (
            <div className="rounded-lg bg-muted/20 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>{rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={cn(
                  priceImpact > 3 ? 'text-destructive' : 
                  priceImpact > 1 ? 'text-warning' : 'text-success'
                )}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage</span>
                <span>{swap.slippage}%</span>
              </div>
            </div>
          )}

          {/* Price Impact Warning */}
          {priceImpact > 3 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>High price impact! You may receive significantly less.</span>
            </div>
          )}

          {/* Swap Button */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 glow-purple"
            disabled={!isConnected || !swap.amountIn || !swap.tokenOut || isLoading}
            onClick={handleSwap}
          >
            {!isConnected ? (
              'Connect Wallet'
            ) : !swap.tokenOut ? (
              'Select Token'
            ) : !swap.amountIn ? (
              'Enter Amount'
            ) : isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Swap'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Token Selector Modal */}
      <TokenSelector
        open={selectingToken !== null}
        onClose={() => setSelectingToken(null)}
        onSelect={handleTokenSelect}
        selectedToken={selectingToken === 'in' ? swap.tokenIn : swap.tokenOut}
        otherToken={selectingToken === 'in' ? swap.tokenOut : swap.tokenIn}
      />

      {/* Settings Modal */}
      <SwapSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};
