import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Token, TOKEN_LIST, NATIVE_ETH } from '@/constants/tokens';

interface SwapState {
  tokenIn: Token;
  tokenOut: Token | null;
  amountIn: string;
  amountOut: string;
  slippage: number;
  deadline: number;
}

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  // Swap state
  swap: SwapState;
  setTokenIn: (token: Token) => void;
  setTokenOut: (token: Token | null) => void;
  setAmountIn: (amount: string) => void;
  setAmountOut: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  setDeadline: (deadline: number) => void;
  swapTokens: () => void;
  
  // Token balances cache
  balances: Record<string, string>;
  setBalance: (address: string, balance: string) => void;
  
  // Recent transactions
  recentTxs: Array<{
    hash: string;
    type: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'approve';
    status: 'pending' | 'success' | 'failed';
    timestamp: number;
  }>;
  addRecentTx: (tx: AppState['recentTxs'][0]) => void;
  updateTxStatus: (hash: string, status: 'pending' | 'success' | 'failed') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('light', theme === 'light');
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },
      
      // Swap state
      swap: {
        tokenIn: NATIVE_ETH,
        tokenOut: TOKEN_LIST[2], // PRMZ
        amountIn: '',
        amountOut: '',
        slippage: 0.5,
        deadline: 20,
      },
      setTokenIn: (token) => set((state) => ({ 
        swap: { ...state.swap, tokenIn: token } 
      })),
      setTokenOut: (token) => set((state) => ({ 
        swap: { ...state.swap, tokenOut: token } 
      })),
      setAmountIn: (amount) => set((state) => ({ 
        swap: { ...state.swap, amountIn: amount } 
      })),
      setAmountOut: (amount) => set((state) => ({ 
        swap: { ...state.swap, amountOut: amount } 
      })),
      setSlippage: (slippage) => set((state) => ({ 
        swap: { ...state.swap, slippage } 
      })),
      setDeadline: (deadline) => set((state) => ({ 
        swap: { ...state.swap, deadline } 
      })),
      swapTokens: () => set((state) => ({
        swap: {
          ...state.swap,
          tokenIn: state.swap.tokenOut || NATIVE_ETH,
          tokenOut: state.swap.tokenIn,
          amountIn: state.swap.amountOut,
          amountOut: state.swap.amountIn,
        }
      })),
      
      // Balances
      balances: {},
      setBalance: (address, balance) => set((state) => ({
        balances: { ...state.balances, [address.toLowerCase()]: balance }
      })),
      
      // Recent transactions
      recentTxs: [],
      addRecentTx: (tx) => set((state) => ({
        recentTxs: [tx, ...state.recentTxs].slice(0, 20)
      })),
      updateTxStatus: (hash, status) => set((state) => ({
        recentTxs: state.recentTxs.map((tx) =>
          tx.hash === hash ? { ...tx, status } : tx
        )
      })),
    }),
    {
      name: 'risedex-storage',
      partialize: (state) => ({
        theme: state.theme,
        swap: {
          slippage: state.swap.slippage,
          deadline: state.swap.deadline,
        },
        recentTxs: state.recentTxs,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('risedex-storage');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }
}
