import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/shared/HeroSection';
import { RotatingTokenLogo } from '@/components/shared/RotatingTokenLogo';
import { Marquee } from '@/components/magicui/marquee';
import { motion } from 'framer-motion';
import { TOKEN_LIST } from '@/constants/tokens';
import { usePriceData } from '@/hooks/usePriceData';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { TrendingUp, TrendingDown, ArrowLeftRight, Droplets, BarChart3, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { prices } = usePriceData();

  const priceItems = TOKEN_LIST.filter(t => !t.isNative).map(token => {
    const priceData = prices[token.symbol];
    return {
      symbol: token.symbol,
      price: priceData?.priceUSD || 0,
      change: priceData?.change24h || 0,
    };
  });

  const features = [
    { icon: <ArrowLeftRight className="h-6 w-6" />, title: 'Instant Swaps', desc: 'Trade tokens with minimal slippage' },
    { icon: <Droplets className="h-6 w-6" />, title: 'Earn Fees', desc: 'Provide liquidity and earn rewards' },
    { icon: <BarChart3 className="h-6 w-6" />, title: 'Analytics', desc: 'Real-time on-chain data insights' },
    { icon: <Shield className="h-6 w-6" />, title: 'Secure', desc: 'Battle-tested smart contracts' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Trade on RISE Network"
        subtitle="Decentralized Exchange"
        description="Swap tokens, provide liquidity, and earn rewards on the fastest growing Layer 2 network"
        primaryAction={{
          label: 'Start Trading',
          onClick: () => navigate('/'),
        }}
        secondaryAction={{
          label: 'View Pools',
          onClick: () => navigate('/pools'),
        }}
      >
        {/* Rotating Token Logos */}
        <div className="flex justify-center gap-8 mb-8">
          {['PRMZ', 'RISE', 'SGN'].map((symbol, i) => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
            >
              <RotatingTokenLogo
                src={`/tokens/${symbol.toLowerCase()}.svg`}
                alt={symbol}
                size="lg"
              />
            </motion.div>
          ))}
        </div>
      </HeroSection>

      {/* Live Price Ticker */}
      <div className="border-y border-border/30 bg-muted/10 backdrop-blur-sm">
        <Marquee speed="normal" pauseOnHover className="py-3">
          {priceItems.map((item) => (
            <div key={item.symbol} className="flex items-center gap-3 mx-8">
              <TokenLogo symbol={item.symbol} size="sm" />
              <span className="font-semibold">{item.symbol}</span>
              <span className="text-muted-foreground">${item.price < 1 ? item.price.toFixed(4) : item.price.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 text-sm ${item.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {item.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(item.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Features Grid */}
      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all group"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
