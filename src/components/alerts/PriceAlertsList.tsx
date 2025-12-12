import { Bell, Trash2, TrendingUp, TrendingDown, BellOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenLogo } from '@/components/shared/TokenLogo';
import { usePriceAlertStore, PriceAlert } from '@/stores/usePriceAlertStore';
import { formatDistanceToNow } from 'date-fns';

export const PriceAlertsList = () => {
  const { alerts, removeAlert, clearTriggeredAlerts } = usePriceAlertStore();

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  if (alerts.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-8 text-center">
          <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No price alerts set</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create alerts to get notified when token prices reach your targets
          </p>
        </CardContent>
      </Card>
    );
  }

  const AlertItem = ({ alert }: { alert: PriceAlert }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        alert.triggered
          ? 'bg-primary/10 border border-primary/30'
          : 'bg-background/50 hover:bg-background/80'
      }`}
    >
      <div className="flex items-center gap-3">
        <TokenLogo symbol={alert.tokenSymbol} size="sm" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{alert.tokenSymbol}</span>
            <span
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                alert.condition === 'above'
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-red-500/20 text-red-500'
              }`}
            >
              {alert.condition === 'above' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {alert.condition}
            </span>
            {alert.triggered && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Triggered!
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Target: ${alert.targetPrice.toLocaleString()} •{' '}
            {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeAlert(alert.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-green-500" />
              Triggered ({triggeredAlerts.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTriggeredAlerts}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {triggeredAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
