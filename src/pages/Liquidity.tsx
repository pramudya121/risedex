import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, ChevronDown, Droplets, ArrowRight } from 'lucide-react';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { Token, TOKEN_LIST, NATIVE_ETH, getTokenLogoFallback } from '@/constants/tokens';
import { useAccount } from 'wagmi';

const Liquidity = () => {
  const { isConnected } = useAccount();
  const [tokenA, setTokenA] = useState<Token>(NATIVE_ETH);
  const [tokenB, setTokenB] = useState<Token | null>(TOKEN_LIST[2]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [selectingToken, setSelectingToken] = useState<'A' | 'B' | null>(null);

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'A') {
      setTokenA(token);
    } else {
      setTokenB(token);
    }
    setSelectingToken(null);
  };

  // Mock user positions
  const userPositions = [
    {
      id: 1,
      tokenA: 'ETH',
      tokenB: 'PRMZ',
      liquidity: '1,234.56',
      share: '0.12%',
      valueUSD: '$4,567.89',
    },
    {
      id: 2,
      tokenA: 'ETH',
      tokenB: 'RISE',
      liquidity: '567.89',
      share: '0.05%',
      valueUSD: '$2,345.67',
    },
  ];

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Liquidity</h1>
        <p className="text-muted-foreground">
          Add or remove liquidity to earn trading fees
        </p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Liquidity
          </TabsTrigger>
          <TabsTrigger value="remove" className="gap-2">
            <Minus className="h-4 w-4" />
            Remove
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="gradient-card border-border/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Add Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token A */}
              <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Token A</span>
                  <span className="text-sm text-muted-foreground">Balance: 0.00</span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    className="flex-1 text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setSelectingToken('A')}
                    className="gap-2 min-w-[130px] border-border/50"
                  >
                    {tokenA && (
                      <img
                        src={tokenA.logoURI || getTokenLogoFallback(tokenA.address)}
                        alt={tokenA.symbol}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    {tokenA?.symbol || 'Select'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Token B */}
              <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Token B</span>
                  <span className="text-sm text-muted-foreground">Balance: 0.00</span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    className="flex-1 text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setSelectingToken('B')}
                    className="gap-2 min-w-[130px] border-border/50"
                  >
                    {tokenB && (
                      <img
                        src={tokenB.logoURI || getTokenLogoFallback(tokenB.address)}
                        alt={tokenB.symbol}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    {tokenB?.symbol || 'Select'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Pool Info */}
              {tokenA && tokenB && (
                <div className="rounded-lg bg-muted/20 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool Share</span>
                    <span>0.00%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LP Tokens</span>
                    <span>0.00</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 glow-purple"
                disabled={!isConnected || !amountA || !amountB}
              >
                {!isConnected ? 'Connect Wallet' : 'Add Liquidity'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remove">
          <Card className="gradient-card border-border/50 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Select a position from below to remove liquidity
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Positions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Positions</h2>
        {userPositions.length > 0 ? (
          <div className="grid gap-4">
            {userPositions.map((position) => (
              <Card key={position.id} className="gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                          <span className="text-xs font-bold">{position.tokenA.slice(0, 2)}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-background">
                          <span className="text-xs font-bold">{position.tokenB.slice(0, 2)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">
                          {position.tokenA} / {position.tokenB}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pool Share: {position.share}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">{position.valueUSD}</div>
                      <div className="text-sm text-muted-foreground">
                        {position.liquidity} LP
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Minus className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="gradient-card border-border/50">
            <CardContent className="py-12 text-center">
              <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No liquidity positions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add liquidity to start earning fees
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Token Selector */}
      <TokenSelector
        open={selectingToken !== null}
        onClose={() => setSelectingToken(null)}
        onSelect={handleTokenSelect}
        selectedToken={selectingToken === 'A' ? tokenA : tokenB}
        otherToken={selectingToken === 'A' ? tokenB : tokenA}
      />
    </div>
  );
};

export default Liquidity;
