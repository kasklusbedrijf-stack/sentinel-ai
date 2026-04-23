import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PriceChange from '../shared/PriceChange';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function TopAssets() {
  const { data: assets = [] } = useQuery({
    queryKey: ['assets-top'],
    queryFn: () => base44.entities.Asset.list('-market_cap', 6),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Top Assets</h3>
        <Link to="/market" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No assets tracked yet. Use the Market Watcher agent to add assets.</p>
      ) : (
        <div className="space-y-2">
          {assets.map(asset => (
            <Link key={asset.id} to={`/market/${asset.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {asset.symbol?.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-medium text-foreground">
                  ${asset.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <PriceChange value={asset.change_24h} className="text-xs" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}