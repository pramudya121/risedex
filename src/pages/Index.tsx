 import { useNavigate } from 'react-router-dom';
 import { Spotlight } from '@/components/magicui/spotlight';
 import { Marquee } from '@/components/magicui/marquee';
 import { ShimmerButton } from '@/components/magicui/shimmer-button';
 import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect';
 import { TokenOrbit } from '@/components/shared/TokenOrbit';
 import { motion } from 'framer-motion';
 import { TOKEN_LIST } from '@/constants/tokens';
 import { usePriceData } from '@/hooks/usePriceData';
 import { TokenLogo } from '@/components/shared/TokenLogo';
 import { TrendingUp, TrendingDown, ArrowLeftRight, Droplets, BarChart3, Shield, Zap, Globe } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
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
     { icon: <ArrowLeftRight className="h-6 w-6" />, title: 'Instant Swaps', desc: 'Trade tokens with minimal slippage and MEV protection' },
     { icon: <Droplets className="h-6 w-6" />, title: 'Earn Fees', desc: 'Provide liquidity and earn passive income from trading fees' },
     { icon: <BarChart3 className="h-6 w-6" />, title: 'Analytics', desc: 'Real-time on-chain data insights and portfolio tracking' },
     { icon: <Shield className="h-6 w-6" />, title: 'Secure', desc: 'Battle-tested Uniswap V2 smart contracts' },
     { icon: <Zap className="h-6 w-6" />, title: 'Fast', desc: 'Sub-second transaction finality on RISE network' },
     { icon: <Globe className="h-6 w-6" />, title: 'Decentralized', desc: 'Non-custodial trading with full asset control' },
   ];
 
   return (
     <div className="min-h-screen overflow-hidden">
       {/* Hero Section with Spotlight */}
       <section className="relative min-h-[90vh] flex items-center justify-center">
         <Spotlight className="top-0 left-0" fill="hsl(var(--primary))" />
         
         {/* Background Effects */}
         <div className="absolute inset-0 overflow-hidden">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
         </div>
         
         <div className="container px-4 relative z-10">
           <div className="grid lg:grid-cols-2 gap-12 items-center">
             {/* Left Content */}
             <div className="text-center lg:text-left">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
               >
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                 </span>
                 Live on RISE Testnet
               </motion.div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                 <TextGenerateEffect
                   words="Trade on RISE Network"
                   className="text-glow"
                 />
               </h1>
               
               <motion.p
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0"
               >
                 The premier decentralized exchange for swapping tokens, providing liquidity, and earning rewards on the fastest Layer 2 network
               </motion.p>
               
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.7 }}
                 className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
               >
                 <ShimmerButton
                   shimmerColor="hsl(var(--primary))"
                   background="hsl(var(--primary))"
                   onClick={() => navigate('/swap')}
                   className="font-semibold text-lg px-8 py-3"
                 >
                   Start Trading
                 </ShimmerButton>
                 <Button
                   variant="outline"
                   size="lg"
                   onClick={() => navigate('/pools')}
                   className="border-primary/30 hover:bg-primary/10"
                 >
                   Explore Pools
                 </Button>
               </motion.div>
               
               {/* Stats */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1 }}
                 className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/30"
               >
                 {[
                   { label: 'Total Volume', value: '$1.2M+' },
                   { label: 'Total Pools', value: '15+' },
                   { label: 'Active Users', value: '500+' },
                 ].map((stat) => (
                   <div key={stat.label} className="text-center lg:text-left">
                     <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                     <div className="text-sm text-muted-foreground">{stat.label}</div>
                   </div>
                 ))}
               </motion.div>
             </div>
             
             {/* Right Content - Token Orbit */}
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               className="hidden lg:flex justify-center"
             >
               <TokenOrbit />
             </motion.div>
           </div>
         </div>
       </section>
 
       {/* Live Price Ticker */}
       <div className="border-y border-border/30 bg-muted/10 backdrop-blur-sm">
         <Marquee speed="normal" pauseOnHover className="py-4">
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
       <section className="container px-4 py-20">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
         >
           <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RISEDEX?</h2>
           <p className="text-muted-foreground max-w-2xl mx-auto">
             Built for traders who demand speed, security, and simplicity
           </p>
         </motion.div>
         
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {features.map((feature, i) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all group cursor-pointer"
             >
               <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/30 transition-all">
                 {feature.icon}
               </div>
               <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
               <p className="text-sm text-muted-foreground">{feature.desc}</p>
             </motion.div>
           ))}
         </div>
       </section>
       
       {/* CTA Section */}
       <section className="container px-4 py-20">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 p-12 text-center overflow-hidden"
         >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
           <div className="relative z-10">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Trading?</h2>
             <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
               Connect your wallet and experience the future of decentralized trading on RISE Network
             </p>
             <ShimmerButton
               shimmerColor="hsl(var(--primary))"
               background="hsl(var(--primary))"
               onClick={() => navigate('/swap')}
               className="font-semibold text-lg px-10 py-4"
             >
               Launch App
             </ShimmerButton>
           </div>
         </motion.div>
       </section>
     </div>
   );
 };
 
 export default Index;
