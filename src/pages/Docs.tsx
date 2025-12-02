import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Github, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const Docs = () => {
  const handleDownload = () => {
    const docContent = `
# RISEDEX Documentation

## What is RISEDEX?

RISEDEX is a production-ready decentralized exchange (DEX) built on RISE Testnet. It provides a professional, secure, and user-friendly platform for swapping tokens, managing liquidity, and tracking portfolio performance.

## Key Features

### Core Trading Features
- **Token Swapping**: Real-time token swaps with live pricing and slippage protection
- **Multi-hop Routing**: Intelligent routing through WETH for optimal swap paths
- **Price Charts**: Interactive candlestick and area charts with volume data
- **Price Impact Calculator**: Real-time calculation of price impact for informed trading

### Liquidity Management
- **Add Liquidity**: Provide liquidity to pools and earn LP tokens
- **Remove Liquidity**: Withdraw liquidity with flexible percentage controls
- **LP Token Management**: Track and manage liquidity provider positions
- **Pool Analytics**: Detailed statistics for each liquidity pool

### Portfolio & Analytics
- **Portfolio Dashboard**: Track token balances and LP positions in real-time
- **Transaction History**: Complete on-chain transaction tracking
- **Token Detail Pages**: Comprehensive token information with holders and transfers
- **Analytics Dashboard**: Platform-wide statistics including volume, TVL, and trends

## Technology Stack

### Frontend
- **React 18.3**: Modern UI library with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn-ui**: Beautiful, accessible UI components

### Blockchain Integration
- **wagmi v2**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **Web3Modal**: Multi-wallet connection support
- **ethers.js**: Ethereum contract interactions

### State Management & Data
- **TanStack React Query**: Server state management with caching
- **Zustand**: Lightweight client state management
- **Recharts**: Data visualization and charting

### Supported Wallets
- MetaMask
- Bitget Wallet
- OKX Wallet

## Architecture & Design

### Design System
- **Theme**: Abstract black and purple gradient aesthetic
- **Background**: #0B0B0D transitioning to dark purple (#3A0066)
- **Primary Accent**: Neon purple (#9B4DFF) with glow effects
- **Typography**: Modern geometric sans-serif (Inter/Poppins)
- **Responsive**: Mobile-first design with touch-friendly interfaces

### Smart Contract Integration
RISEDEX integrates with battle-tested Uniswap V2 protocol contracts deployed on RISE Testnet:

- **UniswapV2Factory**: 0x9231FbE631ee6012A3421C84a58cAAA063931F36
- **UniswapV2Router02**: 0x7A811DE10B63861EE7dCE73c95bd4255Df7bA380
- **WETH9**: 0xfD290E1e7DAc27EcaaA4A93fbB66cD0f00b2e073
- **Multicall**: 0x555E7C02AF2948f2290B023900e9b16C0D581222

### Supported Tokens
- **PRMZ**: 0x7E76eB292BDF45aE633d0Ff9E641B6C9f6254419
- **RISE**: 0x5Fa86c5e03eDc6F894826c84ace1ef704a891322
- **SGN/SANGEN**: 0x7115e9e830bf16D7629FfbE60B4D6B0920A5E369
- **WBTC**: 0x1855C26D2540264A42e3F5Aa03EDbeEbDB598818
- **SOL**: 0xD15b8348135BB498B5A4a05BBE008596a8BcaEc5

## Blockchain Network

**RISE Testnet**
- Chain ID: 11155931
- RPC: testnet.riselabs.xyz
- Explorer: explorer.testnet.riselabs.xyz

## Security & Performance

### Security Features
- Input sanitization on all user inputs
- No private key handling in frontend
- Token list validation with verification badges
- Minimal approval allowances with clear UI prompts
- Suspicious token warnings

### Performance Optimizations
- Lighthouse score target: >= 85 (mobile & desktop)
- Non-blocking chart rendering
- Rate-limiting on RPC calls
- Token metadata caching
- Lazy loading for improved initial load

### Quality Standards
- TypeScript strict mode enabled
- Zero console errors/warnings in production
- ESLint enforcement in CI/CD
- Comprehensive error handling with user-friendly messages

## Code Quality

- **TypeScript Strict Mode**: Enforced for type safety
- **Testing**: 80% minimum coverage with Jest & React Testing Library
- **E2E Tests**: Critical user flows tested with Playwright/Cypress
- **CI/CD**: GitHub Actions pipeline with automated checks
- **Code Standards**: Strict linting and formatting rules

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- RISE Testnet test tokens

### Installation
\`\`\`bash
# Clone the repository
git clone https://github.com/pramudya121/risedex

# Navigate to project directory
cd risedex

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

### Building for Production
\`\`\`bash
npm run build
\`\`\`

## Contributing

Contributions are welcome! Please follow the established code standards and submit pull requests for review.

## License

This project is open source and available under the MIT License.

## Links

- GitHub Repository: https://github.com/pramudya121/risedex
- RISE Testnet Explorer: https://explorer.testnet.riselabs.xyz

---

Built with ❤️ for the RISE ecosystem
`;

    const blob = new Blob([docContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RISEDEX-Documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Documentation downloaded successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            RISEDEX Documentation
          </h1>
          <p className="text-muted-foreground">
            Complete technical documentation and architecture guide
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download Docs
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://github.com/pramudya121/risedex" 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">What is RISEDEX?</CardTitle>
            <CardDescription>
              A production-ready decentralized exchange for RISE Testnet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/90">
              RISEDEX is a professional-grade decentralized exchange (DEX) built on RISE Testnet. 
              It provides a secure, user-friendly platform for swapping tokens, managing liquidity pools, 
              and tracking portfolio performance with real-time blockchain integration.
            </p>
            <p className="text-foreground/90">
              Leveraging the battle-tested Uniswap V2 protocol, RISEDEX combines robust smart contract 
              architecture with a modern, responsive user interface designed for both novice and experienced 
              DeFi users.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Core Trading Features</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Token Swapping:</strong> Real-time token swaps with live pricing and slippage protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Multi-hop Routing:</strong> Intelligent routing through WETH for optimal swap paths</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Price Charts:</strong> Interactive candlestick and area charts with volume data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Price Impact Calculator:</strong> Real-time calculation for informed trading decisions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Liquidity Management</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Add Liquidity:</strong> Provide liquidity to pools and earn LP tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Remove Liquidity:</strong> Withdraw liquidity with flexible percentage controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>LP Token Management:</strong> Track and manage liquidity provider positions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Pool Analytics:</strong> Detailed statistics for each liquidity pool</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Portfolio & Analytics</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Portfolio Dashboard:</strong> Track token balances and LP positions in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Transaction History:</strong> Complete on-chain transaction tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Token Detail Pages:</strong> Comprehensive token information with holders and transfers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Analytics Dashboard:</strong> Platform-wide statistics including volume, TVL, and trends</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Frontend Technologies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">React 18.3</span>
                  <p className="text-sm text-muted-foreground">Modern UI library with hooks</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">TypeScript</span>
                  <p className="text-sm text-muted-foreground">Type-safe development</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">Vite</span>
                  <p className="text-sm text-muted-foreground">Lightning-fast build tool</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">Tailwind CSS</span>
                  <p className="text-sm text-muted-foreground">Utility-first styling</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">shadcn-ui</span>
                  <p className="text-sm text-muted-foreground">Accessible UI components</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">Recharts</span>
                  <p className="text-sm text-muted-foreground">Data visualization</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Blockchain Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">wagmi v2</span>
                  <p className="text-sm text-muted-foreground">React hooks for Ethereum</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">viem</span>
                  <p className="text-sm text-muted-foreground">TypeScript Ethereum library</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">Web3Modal</span>
                  <p className="text-sm text-muted-foreground">Multi-wallet connection</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">ethers.js</span>
                  <p className="text-sm text-muted-foreground">Contract interactions</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">State Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">TanStack React Query</span>
                  <p className="text-sm text-muted-foreground">Server state with caching</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <span className="font-medium text-foreground">Zustand</span>
                  <p className="text-sm text-muted-foreground">Lightweight client state</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Supported Wallets</h3>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/30 font-medium">
                  MetaMask
                </div>
                <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/30 font-medium">
                  Bitget Wallet
                </div>
                <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/30 font-medium">
                  OKX Wallet
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Architecture & Design</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Design System</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Theme:</strong> Abstract black and purple gradient aesthetic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Background:</strong> #0B0B0D transitioning to dark purple (#3A0066)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Primary Accent:</strong> Neon purple (#9B4DFF) with glow effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Typography:</strong> Modern geometric sans-serif (Inter/Poppins)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Responsive:</strong> Mobile-first design with touch-friendly interfaces</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Smart Contracts (RISE Testnet)</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-medium text-foreground">UniswapV2Factory</span>
                    <code className="text-xs text-muted-foreground break-all">0x9231FbE631ee6012A3421C84a58cAAA063931F36</code>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-medium text-foreground">UniswapV2Router02</span>
                    <code className="text-xs text-muted-foreground break-all">0x7A811DE10B63861EE7dCE73c95bd4255Df7bA380</code>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-medium text-foreground">WETH9</span>
                    <code className="text-xs text-muted-foreground break-all">0xfD290E1e7DAc27EcaaA4A93fbB66cD0f00b2e073</code>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-medium text-foreground">Multicall</span>
                    <code className="text-xs text-muted-foreground break-all">0x555E7C02AF2948f2290B023900e9b16C0D581222</code>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Supported Tokens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="font-medium text-foreground mb-1">PRMZ</div>
                  <code className="text-xs text-muted-foreground break-all">0x7E76eB292BDF45aE633d0Ff9E641B6C9f6254419</code>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="font-medium text-foreground mb-1">RISE</div>
                  <code className="text-xs text-muted-foreground break-all">0x5Fa86c5e03eDc6F894826c84ace1ef704a891322</code>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="font-medium text-foreground mb-1">SGN/SANGEN</div>
                  <code className="text-xs text-muted-foreground break-all">0x7115e9e830bf16D7629FfbE60B4D6B0920A5E369</code>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="font-medium text-foreground mb-1">WBTC</div>
                  <code className="text-xs text-muted-foreground break-all">0x1855C26D2540264A42e3F5Aa03EDbeEbDB598818</code>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="font-medium text-foreground mb-1">SOL</div>
                  <code className="text-xs text-muted-foreground break-all">0xD15b8348135BB498B5A4a05BBE008596a8BcaEc5</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Info */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Blockchain Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                <span className="font-medium text-foreground">Network</span>
                <span className="text-muted-foreground">RISE Testnet</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                <span className="font-medium text-foreground">Chain ID</span>
                <code className="text-muted-foreground">11155931</code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                <span className="font-medium text-foreground">RPC</span>
                <code className="text-muted-foreground">testnet.riselabs.xyz</code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                <span className="font-medium text-foreground">Explorer</span>
                <a 
                  href="https://explorer.testnet.riselabs.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  explorer.testnet.riselabs.xyz
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Performance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Security & Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Security Features</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Input sanitization on all user inputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>No private key handling in frontend</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Token list validation with verification badges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Minimal approval allowances with clear UI prompts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Suspicious token warnings</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Performance Optimizations</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Lighthouse score target: ≥ 85 (mobile & desktop)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Non-blocking chart rendering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Rate-limiting on RPC calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Token metadata caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Lazy loading for improved initial load</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Code Quality Standards</h3>
              <ul className="space-y-2 text-foreground/90 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>TypeScript strict mode enforced</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Zero console errors/warnings in production</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>80% minimum test coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Comprehensive error handling with user-friendly messages</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Links & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://github.com/pramudya121/risedex" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">GitHub Repository</div>
                  <div className="text-sm text-muted-foreground">View source code and contribute</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
            
            <a 
              href="https://explorer.testnet.riselabs.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">RISE Testnet Explorer</div>
                  <div className="text-sm text-muted-foreground">View blockchain transactions</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
        <p className="text-muted-foreground">
          Built with ❤️ for the RISE ecosystem
        </p>
      </div>
    </div>
  );
};

export default Docs;