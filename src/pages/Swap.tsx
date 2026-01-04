import { SwapCard } from '@/components/swap/SwapCard';
import { PriceChart } from '@/components/swap/PriceChart';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, Clock, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useQuote } from '@/hooks/useQuote';

const Swap = () => {
  const { swap } = useAppStore();
  const { rate } = useQuote({
    tokenIn: swap.tokenIn,
    tokenOut: swap.tokenOut,
    amountIn: '1',
  });

  return (
    <div className="container px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">Instant Token Swaps</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Swap Tokens Instantly
          </span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Trade tokens with the best rates, minimal slippage, and lightning-fast execution on RISE Network
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Swap Card */}
        <div className="w-full lg:w-auto">
          <SwapCard />
        </div>

        {/* Price Chart */}
        <div className="w-full lg:w-[420px]">
          <PriceChart 
            tokenIn={swap.tokenIn} 
            tokenOut={swap.tokenOut} 
            currentRate={rate}
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
        {[
          { 
            icon: Zap, 
            label: 'Lightning Fast', 
            value: '<1s',
            description: 'Average swap time'
          },
          { 
            icon: Shield, 
            label: 'Secure', 
            value: '100%',
            description: 'Non-custodial trades'
          },
          { 
            icon: Clock, 
            label: '24h Volume', 
            value: '$12.5M',
            description: 'Total traded'
          },
          { 
            icon: Sparkles, 
            label: 'Total Pools', 
            value: '156',
            description: 'Active pairs'
          },
        ].map((stat) => (
          <Card 
            key={stat.label} 
            className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/30 border-border/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Network Status: Operational</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>Smart Contract Audited</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span>Multi-hop Routing Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default Swap;
