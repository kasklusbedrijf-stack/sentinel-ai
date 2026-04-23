import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';

export default function TradeApprovalWidget() {
  const navigate = useNavigate();
  const { formatCurrency } = useAppPreferences();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPending = async () => {
      const data = await base44.entities.TradeApproval.filter(
        { status: 'pending' },
        '-created_date',
        5
      );
      setPending(data || []);
      setLoading(false);
    };
    loadPending();

    // Subscribe to changes
    const unsub = base44.entities.TradeApproval.subscribe((event) => {
      if (event.type === 'create' && event.data.status === 'pending') {
        setPending((prev) => [event.data, ...prev].slice(0, 5));
      }
    });

    return unsub;
  }, []);

  if (loading) {
    return null;
  }

  if (pending.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-4 py-2">
        <Clock className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-foreground">
          {pending.length} Trade{pending.length !== 1 ? 's' : ''} Awaiting Approval
        </h3>
      </div>
      <div className="space-y-2 px-4">
        {pending.map((trade) => (
          <Card
            key={trade.id}
            className="bg-card border-border hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/trade-approval/${trade.id}`)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {trade.direction === 'buy' ? (
                    <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {trade.asset_symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Entry {formatCurrency(trade.entry_price)}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge
                    className={cn(
                      'text-xs',
                      trade.confidence_score >= 70
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    )}
                  >
                    {trade.confidence_score}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {pending.length > 0 && (
          <Button
            onClick={() => navigate('/trade-approval')}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            View All
          </Button>
        )}
      </div>
    </div>
  );
}