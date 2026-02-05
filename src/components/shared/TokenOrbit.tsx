 import { motion } from 'framer-motion';
 import { TOKEN_LIST } from '@/constants/tokens';
 import { TokenLogo } from './TokenLogo';
 
 interface TokenOrbitProps {
   className?: string;
 }
 
 export const TokenOrbit = ({ className = '' }: TokenOrbitProps) => {
   // Use verified tokens for orbit
   const orbitTokens = TOKEN_LIST.filter(t => t.isVerified && !t.isNative).slice(0, 6);
   
   return (
     <div className={`relative w-[400px] h-[400px] mx-auto ${className}`}>
       {/* Central Glow */}
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="absolute w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-pulse" />
         <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
       </div>
       
       {/* Central Logo/Globe */}
       <div className="absolute inset-0 flex items-center justify-center z-10">
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
           className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center shadow-lg shadow-primary/50"
         >
           <span className="text-3xl font-bold text-primary-foreground">R</span>
         </motion.div>
       </div>
       
       {/* Orbit Ring 1 - Inner */}
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-56 h-56 rounded-full border border-primary/20" />
       </div>
       
       {/* Orbit Ring 2 - Middle */}
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-72 h-72 rounded-full border border-primary/15" />
       </div>
       
       {/* Orbit Ring 3 - Outer */}
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-[350px] h-[350px] rounded-full border border-primary/10" />
       </div>
       
       {/* Orbiting Tokens */}
       {orbitTokens.map((token, index) => {
         const orbitRadius = index % 2 === 0 ? 140 : 175; // Alternate between orbits
         const duration = 15 + index * 3; // Different speeds
         const delay = index * -2.5; // Staggered start
         const direction = index % 2 === 0 ? 1 : -1; // Alternate direction
         
         return (
           <motion.div
             key={token.symbol}
             className="absolute left-1/2 top-1/2 -ml-5 -mt-5"
             animate={{
               rotate: direction * 360,
             }}
             transition={{
               duration,
               repeat: Infinity,
               ease: 'linear',
               delay,
             }}
             style={{
               transformOrigin: `calc(${orbitRadius}px * -1 + 20px) 20px`,
             }}
           >
             <motion.div
               animate={{
                 rotate: direction * -360,
               }}
               transition={{
                 duration,
                 repeat: Infinity,
                 ease: 'linear',
                 delay,
               }}
               className="relative"
             >
               {/* Token glow */}
               <div className="absolute inset-0 bg-primary/40 rounded-full blur-md scale-150" />
               
               {/* Token */}
               <div className="relative w-10 h-10 rounded-full bg-background/90 border border-primary/30 flex items-center justify-center shadow-lg hover:scale-125 transition-transform cursor-pointer group">
                 <TokenLogo symbol={token.symbol} size="sm" />
                 
                 {/* Tooltip */}
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <span className="text-xs font-semibold bg-background/90 px-2 py-1 rounded border border-border/50 whitespace-nowrap">
                     {token.symbol}
                   </span>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         );
       })}
       
       {/* Particle Effects */}
       {[...Array(8)].map((_, i) => (
         <motion.div
           key={i}
           className="absolute w-1 h-1 bg-primary/60 rounded-full"
           style={{
             left: '50%',
             top: '50%',
           }}
           animate={{
             x: [0, Math.cos((i * Math.PI) / 4) * 200, 0],
             y: [0, Math.sin((i * Math.PI) / 4) * 200, 0],
             opacity: [0, 1, 0],
             scale: [0, 1.5, 0],
           }}
           transition={{
             duration: 4,
             repeat: Infinity,
             delay: i * 0.5,
             ease: 'easeInOut',
           }}
         />
       ))}
     </div>
   );
 };