import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Check, Shield, AlertTriangle } from 'lucide-react';
import { Token, TOKEN_LIST, getTokenLogoFallback } from '@/constants/tokens';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token | null;
  otherToken?: Token | null;
}

export const TokenSelector = ({
  open,
  onClose,
  onSelect,
  selectedToken,
  otherToken,
}: TokenSelectorProps) => {
  const [search, setSearch] = useState('');
  const { balances } = useAppStore();

  const filteredTokens = useMemo(() => {
    const filtered = TOKEN_LIST.filter(
      (token) =>
        token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase()) ||
        token.address.toLowerCase().includes(search.toLowerCase())
    );

    // Sort by balance (highest first)
    return filtered.sort((a, b) => {
      const balA = parseFloat(balances[a.address.toLowerCase()] || '0');
      const balB = parseFloat(balances[b.address.toLowerCase()] || '0');
      return balB - balA;
    });
  }, [search, balances]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    onClose();
    setSearch('');
  };

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (address: string) => {
    setImageErrors((prev) => ({ ...prev, [address]: true }));
  };

  const getTokenLogo = (token: Token) => {
    if (imageErrors[token.address] || !token.logoURI) {
      return getTokenLogoFallback(token.address);
    }
    return token.logoURI;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Select Token</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>

        {/* Common tokens quick select */}
        <div className="flex flex-wrap gap-2">
          {TOKEN_LIST.slice(0, 5).map((token) => (
            <Button
              key={token.address}
              variant="outline"
              size="sm"
              disabled={
                token.address === selectedToken?.address ||
                token.address === otherToken?.address
              }
              onClick={() => handleSelect(token)}
              className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/10"
            >
              <img
                src={getTokenLogo(token)}
                alt={token.symbol}
                className="h-5 w-5 rounded-full"
                onError={() => handleImageError(token.address)}
              />
              {token.symbol}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            {filteredTokens.map((token) => {
              const isSelected = token.address === selectedToken?.address;
              const isDisabled = token.address === otherToken?.address;
              const balance = balances[token.address.toLowerCase()] || '0';

              return (
                <button
                  key={token.address}
                  disabled={isDisabled}
                  onClick={() => handleSelect(token)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-all',
                    'hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed',
                    isSelected && 'bg-primary/20 border border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={getTokenLogo(token)}
                        alt={token.symbol}
                        className="h-10 w-10 rounded-full bg-muted"
                        onError={() => handleImageError(token.address)}
                      />
                      {token.isVerified && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success flex items-center justify-center">
                          <Shield className="h-2.5 w-2.5 text-success-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{token.symbol}</span>
                        {token.isVerified ? (
                          <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{token.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">
                        {parseFloat(balance).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">Balance</div>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </button>
              );
            })}

            {filteredTokens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
