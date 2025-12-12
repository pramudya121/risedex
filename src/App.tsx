import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/config/wagmi';
import { Layout } from '@/components/layout/Layout';
import { Web3Provider } from '@/providers/Web3Provider';

// Pages
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import Pools from "./pages/Pools";
import Analytics from "./pages/Analytics";
import Portfolio from "./pages/Portfolio";
import History from "./pages/History";
import Token from "./pages/Token";
import Docs from "./pages/Docs";
import Staking from "./pages/Staking";
import Watchlist from "./pages/Watchlist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Swap />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/pools" element={<Pools />} />
                <Route path="/staking" element={<Staking />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/history" element={<History />} />
                <Route path="/token/:address" element={<Token />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </Web3Provider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
