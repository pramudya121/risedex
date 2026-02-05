 import { SwapCard } from '@/components/swap/SwapCard';
 import { MovingBorder } from '@/components/aceternity/moving-border';
 import { Spotlight } from '@/components/magicui/spotlight';
 import { Marquee } from '@/components/magicui/marquee';
 import { motion } from 'framer-motion';
 import { TOKEN_LIST } from '@/constants/tokens';
 import { usePriceData } from '@/hooks/usePriceData';
 import { TokenLogo } from '@/components/shared/TokenLogo';
 import { TrendingUp, TrendingDown } from 'lucide-react';
 
 const Swap = () => {
   const { prices } = usePriceData();
 
   const priceItems = TOKEN_LIST.filter(t => !t.isNative).map(token => {
     const priceData = prices[token.symbol];
     return {
       symbol: token.symbol,
       price: priceData?.priceUSD || 0,
       change: priceData?.change24h || 0,
     };
   });
 
   return (
     <div className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
       <Spotlight className="top-0 left-1/4" fill="hsl(var(--primary))" />
      {/* Price Ticker Marquee */}
      <div className="border-b border-border/30 bg-muted/20 backdrop-blur-sm">
        <Marquee speed="slow" pauseOnHover className="py-2">
          {priceItems.map((item) => (
            <div key={item.symbol} className="flex items-center gap-3 mx-6">
              <TokenLogo symbol={item.symbol} size="sm" />
              <span className="font-medium">{item.symbol}</span>
              <span className="text-muted-foreground">${item.price < 1 ? item.price.toFixed(4) : item.price.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 text-xs ${item.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {item.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(item.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MovingBorder duration={3000} containerClassName="rounded-2xl">
            <SwapCard />
          </MovingBorder>
        </motion.div>
      </div>
     </div>
   );
 };

export default Swap;
