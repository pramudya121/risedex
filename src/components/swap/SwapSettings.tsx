import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface SwapSettingsProps {
  open: boolean;
  onClose: () => void;
}

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0];

export const SwapSettings = ({ open, onClose }: SwapSettingsProps) => {
  const { swap, setSlippage, setDeadline } = useAppStore();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle>Transaction Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slippage Tolerance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Slippage Tolerance</Label>
            <div className="flex gap-2">
              {SLIPPAGE_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  size="sm"
                  onClick={() => setSlippage(option)}
                  className={cn(
                    'flex-1 border-border/50',
                    swap.slippage === option && 'bg-primary/20 border-primary/50 text-primary'
                  )}
                >
                  {option}%
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={swap.slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                className="bg-muted/50 border-border/50"
                step="0.1"
                min="0.01"
                max="50"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            {swap.slippage > 5 && (
              <p className="text-xs text-warning">
                High slippage tolerance may result in unfavorable trades
              </p>
            )}
            {swap.slippage < 0.1 && (
              <p className="text-xs text-warning">
                Low slippage tolerance may cause transaction failures
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Transaction Deadline</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={swap.deadline}
                onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                className="bg-muted/50 border-border/50"
                min="1"
                max="60"
              />
              <span className="text-muted-foreground">minutes</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Transaction will revert if pending for longer than the deadline
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
