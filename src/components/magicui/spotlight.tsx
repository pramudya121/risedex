 import React from 'react';
 import { cn } from '@/lib/utils';
 import { motion } from 'framer-motion';
 
 interface SpotlightProps {
   className?: string;
   fill?: string;
 }
 
 export const Spotlight = ({
   className,
   fill = 'white',
 }: SpotlightProps) => {
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.5 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 1.5, ease: 'easeOut' }}
       className={cn(
         'pointer-events-none absolute z-0',
         className
       )}
     >
       <svg
         className="w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-30"
         viewBox="0 0 800 800"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
       >
         <defs>
           <radialGradient
             id="spotlight-gradient"
             cx="50%"
             cy="50%"
             r="50%"
             fx="50%"
             fy="50%"
           >
             <stop offset="0%" stopColor={fill} stopOpacity="0.4" />
             <stop offset="50%" stopColor={fill} stopOpacity="0.1" />
             <stop offset="100%" stopColor={fill} stopOpacity="0" />
           </radialGradient>
         </defs>
         <ellipse
           cx="400"
           cy="400"
           rx="400"
           ry="300"
           fill="url(#spotlight-gradient)"
         />
       </svg>
     </motion.div>
   );
 };
