import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Define RISE Testnet chain
export const riseTestnet = defineChain({
  id: 11155931,
  name: 'RISE Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet.riselabs.xyz'] },
  },
  blockExplorers: {
    default: { name: 'RISE Explorer', url: 'https://explorer.testnet.riselabs.xyz' },
  },
  testnet: true,
});

// WalletConnect project ID (you should replace this with your own)
const projectId = 'a4f57d5c7a2da89fb8c5a5e8dc3af03f';

export const wagmiConfig = createConfig({
  chains: [riseTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'RISEDEX',
        description: 'Professional Decentralized Exchange',
        url: 'https://risedex.io',
        icons: ['https://risedex.io/logo.png'],
      },
    }),
  ],
  transports: {
    [riseTestnet.id]: http('https://testnet.riselabs.xyz'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
