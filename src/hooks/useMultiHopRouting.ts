import { createPublicClient, http } from 'viem';
import { riseTestnet } from '@/config/wagmi';
import { CONTRACTS, RISE_TESTNET, FACTORY_ABI, ROUTER_ABI } from '@/constants/contracts';
import { Token, isNativeETH, TOKEN_LIST } from '@/constants/tokens';

const publicClient = createPublicClient({
  chain: riseTestnet,
  transport: http(),
});

const routerAddress = CONTRACTS[RISE_TESTNET.id].ROUTER as `0x${string}`;
const factoryAddress = CONTRACTS[RISE_TESTNET.id].FACTORY as `0x${string}`;
const wethAddress = CONTRACTS[RISE_TESTNET.id].WETH as `0x${string}`;

// Common base tokens for routing (WETH is primary)
const BASE_TOKENS = [
  wethAddress,
  // Add more base tokens if available
];

export interface RouteResult {
  path: `0x${string}`[];
  pathSymbols: string[];
  amountOut: bigint;
  priceImpact: number;
  isMultiHop: boolean;
}

// Check if a pair exists
export const pairExists = async (
  tokenA: `0x${string}`,
  tokenB: `0x${string}`
): Promise<boolean> => {
  try {
    const pairAddress = await (publicClient.readContract as any)({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: 'getPair',
      args: [tokenA, tokenB],
    });
    return pairAddress !== '0x0000000000000000000000000000000000000000';
  } catch {
    return false;
  }
};

// Get quote for a specific path
export const getQuoteForPath = async (
  amountIn: bigint,
  path: `0x${string}`[]
): Promise<bigint | null> => {
  try {
    const amounts = await (publicClient.readContract as any)({
      address: routerAddress,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn, path],
    }) as bigint[];
    return amounts[amounts.length - 1];
  } catch {
    return null;
  }
};

// Find the best route between two tokens
export const findBestRoute = async (
  tokenIn: Token,
  tokenOut: Token,
  amountIn: bigint
): Promise<RouteResult | null> => {
  const tokenInAddr = isNativeETH(tokenIn.address) 
    ? wethAddress 
    : tokenIn.address as `0x${string}`;
  const tokenOutAddr = isNativeETH(tokenOut.address) 
    ? wethAddress 
    : tokenOut.address as `0x${string}`;

  // If same token (including ETH/WETH), no swap needed
  if (tokenInAddr.toLowerCase() === tokenOutAddr.toLowerCase()) {
    return null;
  }

  const routes: RouteResult[] = [];

  // 1. Try direct path first
  const directPath: `0x${string}`[] = [tokenInAddr, tokenOutAddr];
  const directQuote = await getQuoteForPath(amountIn, directPath);
  
  if (directQuote !== null && directQuote > 0n) {
    routes.push({
      path: directPath,
      pathSymbols: [tokenIn.symbol, tokenOut.symbol],
      amountOut: directQuote,
      priceImpact: calculatePriceImpact(amountIn, directQuote, tokenIn.decimals, tokenOut.decimals),
      isMultiHop: false,
    });
  }

  // 2. Try multi-hop routes through base tokens
  for (const baseToken of BASE_TOKENS) {
    // Skip if base token is same as input or output
    if (
      baseToken.toLowerCase() === tokenInAddr.toLowerCase() ||
      baseToken.toLowerCase() === tokenOutAddr.toLowerCase()
    ) {
      continue;
    }

    const multiHopPath: `0x${string}`[] = [tokenInAddr, baseToken, tokenOutAddr];
    const multiHopQuote = await getQuoteForPath(amountIn, multiHopPath);

    if (multiHopQuote !== null && multiHopQuote > 0n) {
      // Find base token symbol
      const baseTokenInfo = TOKEN_LIST.find(
        t => t.address.toLowerCase() === baseToken.toLowerCase()
      );
      const baseSymbol = baseTokenInfo?.symbol || 'WETH';

      routes.push({
        path: multiHopPath,
        pathSymbols: [tokenIn.symbol, baseSymbol, tokenOut.symbol],
        amountOut: multiHopQuote,
        priceImpact: calculatePriceImpact(amountIn, multiHopQuote, tokenIn.decimals, tokenOut.decimals),
        isMultiHop: true,
      });
    }
  }

  // 3. Return the best route (highest output)
  if (routes.length === 0) {
    return null;
  }

  return routes.reduce((best, current) => 
    current.amountOut > best.amountOut ? current : best
  );
};

// Calculate approximate price impact
const calculatePriceImpact = (
  amountIn: bigint,
  amountOut: bigint,
  decimalsIn: number,
  decimalsOut: number
): number => {
  // Simple estimation based on input size
  const normalizedIn = Number(amountIn) / Math.pow(10, decimalsIn);
  // Estimate ~0.3% impact per unit traded, capped at 15%
  return Math.min(normalizedIn * 0.3, 15);
};

// Get all possible routes (for display purposes)
export const getAllRoutes = async (
  tokenIn: Token,
  tokenOut: Token,
  amountIn: bigint
): Promise<RouteResult[]> => {
  const tokenInAddr = isNativeETH(tokenIn.address) 
    ? wethAddress 
    : tokenIn.address as `0x${string}`;
  const tokenOutAddr = isNativeETH(tokenOut.address) 
    ? wethAddress 
    : tokenOut.address as `0x${string}`;

  if (tokenInAddr.toLowerCase() === tokenOutAddr.toLowerCase()) {
    return [];
  }

  const routes: RouteResult[] = [];

  // Direct path
  const directPath: `0x${string}`[] = [tokenInAddr, tokenOutAddr];
  const directQuote = await getQuoteForPath(amountIn, directPath);
  
  if (directQuote !== null && directQuote > 0n) {
    routes.push({
      path: directPath,
      pathSymbols: [tokenIn.symbol, tokenOut.symbol],
      amountOut: directQuote,
      priceImpact: calculatePriceImpact(amountIn, directQuote, tokenIn.decimals, tokenOut.decimals),
      isMultiHop: false,
    });
  }

  // Multi-hop through WETH
  for (const baseToken of BASE_TOKENS) {
    if (
      baseToken.toLowerCase() === tokenInAddr.toLowerCase() ||
      baseToken.toLowerCase() === tokenOutAddr.toLowerCase()
    ) {
      continue;
    }

    const multiHopPath: `0x${string}`[] = [tokenInAddr, baseToken, tokenOutAddr];
    const multiHopQuote = await getQuoteForPath(amountIn, multiHopPath);

    if (multiHopQuote !== null && multiHopQuote > 0n) {
      const baseTokenInfo = TOKEN_LIST.find(
        t => t.address.toLowerCase() === baseToken.toLowerCase()
      );
      
      routes.push({
        path: multiHopPath,
        pathSymbols: [tokenIn.symbol, baseTokenInfo?.symbol || 'WETH', tokenOut.symbol],
        amountOut: multiHopQuote,
        priceImpact: calculatePriceImpact(amountIn, multiHopQuote, tokenIn.decimals, tokenOut.decimals),
        isMultiHop: true,
      });
    }
  }

  return routes.sort((a, b) => (b.amountOut > a.amountOut ? 1 : -1));
};
