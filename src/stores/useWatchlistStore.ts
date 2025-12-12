import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  watchlist: string[]; // Token addresses
  addToWatchlist: (address: string) => void;
  removeFromWatchlist: (address: string) => void;
  isInWatchlist: (address: string) => boolean;
  toggleWatchlist: (address: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      
      addToWatchlist: (address) => {
        const normalized = address.toLowerCase();
        set((state) => ({
          watchlist: state.watchlist.includes(normalized) 
            ? state.watchlist 
            : [...state.watchlist, normalized]
        }));
      },
      
      removeFromWatchlist: (address) => {
        const normalized = address.toLowerCase();
        set((state) => ({
          watchlist: state.watchlist.filter((a) => a !== normalized)
        }));
      },
      
      isInWatchlist: (address) => {
        return get().watchlist.includes(address.toLowerCase());
      },
      
      toggleWatchlist: (address) => {
        const normalized = address.toLowerCase();
        const isIn = get().watchlist.includes(normalized);
        if (isIn) {
          get().removeFromWatchlist(address);
        } else {
          get().addToWatchlist(address);
        }
      },
    }),
    {
      name: 'risedex-watchlist',
    }
  )
);
