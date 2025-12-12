import { useState } from 'react';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { usePriceAlertStore } from '@/stores/usePriceAlertStore';
import { TOKEN_LIST, Token } from '@/constants/tokens';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PriceAlertModalProps {
  open: boolean;
  onClose: () => void;
  preselectedToken?: Token;
}

export const PriceAlertModal = ({ open, onClose, preselectedToken }: PriceAlertModalProps) => {
  const { addAlert } = usePriceAlertStore();
  const [selectedToken, setSelectedToken] = useState<Token | null>(preselectedToken || null);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const handleSubmit = () => {
    if (!selectedToken || !targetPrice || parseFloat(targetPrice) <= 0) {
      toast.error('Please select a token and enter a valid price');
      return;
    }

    addAlert({
      tokenAddress: selectedToken.address,
      tokenSymbol: selectedToken.symbol,
      targetPrice: parseFloat(targetPrice),
      condition,
    });

    toast.success(`Alert created for ${selectedToken.symbol} ${condition} $${targetPrice}`);
    setTargetPrice('');
    setSelectedToken(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Create Price Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Token Selection */}
          <div>
            <Label className="text-muted-foreground">Select Token</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {TOKEN_LIST.filter(t => !t.isNative).slice(0, 6).map((token) => (
                <button
                  key={token.address}
                  onClick={() => setSelectedToken(token)}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                    selectedToken?.address === token.address
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-background/50'
                  )}
                >
                  <TokenLogo symbol={token.symbol} size="sm" />
                  <span className="text-sm font-medium text-foreground">{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <Label className="text-muted-foreground">Alert When Price Goes</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setCondition('above')}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors',
                  condition === 'above'
                    ? 'border-green-500 bg-green-500/10 text-green-500'
                    : 'border-border hover:border-green-500/50 text-muted-foreground'
                )}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Above</span>
              </button>
              <button
                onClick={() => setCondition('below')}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors',
                  condition === 'below'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-border hover:border-red-500/50 text-muted-foreground'
                )}
              >
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">Below</span>
              </button>
            </div>
          </div>

          {/* Target Price */}
          <div>
            <Label htmlFor="targetPrice" className="text-muted-foreground">Target Price (USD)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="mt-2 bg-background/50 border-border"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedToken || !targetPrice}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
