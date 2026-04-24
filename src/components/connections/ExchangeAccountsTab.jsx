import KrakenConnectionForm from '@/components/settings/KrakenConnectionForm';

export default function ExchangeAccountsTab() {
  return (
    <div className="space-y-6 py-6">
      {/* Kraken Exchange */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Kraken</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Connect your Kraken account to sync balances, view open orders, and execute trades.
        </p>

        {/* Kraken Connection Form */}
        <KrakenConnectionForm />
      </div>

      {/* Future exchanges placeholder */}
      <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
        <p>More exchanges coming soon (Binance, Coinbase, etc.)</p>
      </div>
    </div>
  );
}