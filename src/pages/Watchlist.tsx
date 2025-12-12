import { Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WatchlistCard } from '@/components/watchlist/WatchlistCard';
import { WatchlistButton } from '@/components/watchlist/WatchlistButton';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { TOKEN_LIST } from '@/constants/tokens';

const Watchlist = () => {
  const { watchlist } = useWatchlistStore();
  
  // Get tokens not in watchlist for suggestions
  const suggestedTokens = TOKEN_LIST.filter(
    (token) => !watchlist.includes(token.address.toLowerCase())
  ).slice(0, 4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-yellow-500/20">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Token Watchlist</h1>
            <p className="text-muted-foreground">
              Monitor your favorite tokens in one place
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{watchlist.length}</p>
              <p className="text-sm text-muted-foreground">Watching</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">3</p>
              <p className="text-sm text-muted-foreground">Gainers</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">2</p>
              <p className="text-sm text-muted-foreground">Losers</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{TOKEN_LIST.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Watchlist */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Watchlist</h2>
          <WatchlistCard />
        </div>

        {/* Suggested Tokens */}
        {suggestedTokens.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              <Plus className="inline-block h-5 w-5 mr-2" />
              Add More Tokens
            </h2>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedTokens.map((token) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <Link 
                        to={`/token/${token.address}`}
                        className="flex items-center gap-3"
                      >
                        <TokenLogo 
                          address={token.address} 
                          symbol={token.symbol} 
                          size="sm" 
                        />
                        <div>
                          <p className="font-medium text-foreground">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </Link>
                      <WatchlistButton tokenAddress={token.address} size="sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Watchlist;
