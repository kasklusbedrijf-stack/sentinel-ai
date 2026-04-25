/**
 * OrderSizeCheck — pre-validation panel shown before the user clicks "Validate".
 * After validation, uses real Kraken pair rules (ordermin from AssetPairs API) when available.
 * Falls back to local table for client-side pre-check (no network).
 */

import { AlertCircle, CheckCircle2, Info, Wifi, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

// Local fallback table — used ONLY for client-side pre-check before backend responds.
// Backend always tries the real Kraken AssetPairs API first.
const KRAKEN_MIN_VOLUME_FALLBACK = {
  BTC:  0.0001,
  ETH:  0.002,
  SOL:  0.5,
  XRP:  10,
  ADA:  10,
  DOT:  0.5,
  AVAX: 0.1,
  MATIC:10,
  POL:  10,
  LINK: 0.5,
  LTC:  0.1,
  UNI:  0.3,
  ATOM: 0.3,
  DOGE: 50,
  FIL:  0.5,
  NEAR: 1,
  ARB:  10,
  OP:   3,
  INJ:  0.3,
  SUI:  2,
  APT:  0.5,
  TIA:  0.5,
  WIF:  2,
  PEPE: 5000000,
};

function fmt(n, decimals = 4) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '0';
  if (Math.abs(n) < 0.0001) return n.toExponential(3);
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals });
}

function fmtUsd(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Compute order size check from trade data alone (no network call).
 * Always uses the local fallback table — clearly labelled as such in the UI.
 */
export function computeOrderCheck(trade, usdBalance = null) {
  const symbol = trade?.asset_symbol?.toUpperCase();
  if (!symbol || !trade?.entry_price) return null;

  const minVol = KRAKEN_MIN_VOLUME_FALLBACK[symbol] ?? null;
  const entryPrice = parseFloat(trade.edited_entry || trade.entry_price);

  const estimatedRisk = parseFloat(trade.estimated_risk || 0);
  let usdAmount = null;
  if (estimatedRisk > 0) {
    usdAmount = estimatedRisk;
  } else if (usdBalance != null) {
    usdAmount = (parseFloat(trade.position_size_pct || 1) / 100) * usdBalance;
  }

  const calculatedVol = (usdAmount != null && entryPrice > 0)
    ? Math.round((usdAmount / entryPrice) * 1e8) / 1e8
    : null;

  const minUsdRequired = minVol != null ? minVol * entryPrice : null;

  const passes = minVol == null || calculatedVol == null
    ? null
    : calculatedVol >= minVol;

  return {
    symbol,
    entryPrice,
    calculatedVol,
    minVol,
    minVolumeSource: 'fallback_table',
    pairInfo: null,
    costMin: null,
    usdAmount,
    usdBalance,
    minUsdRequired,
    passes,
  };
}

/**
 * Props:
 *   trade         — TradeApproval record
 *   orderCheck    — structured order_check from backend response (optional, overrides client calc)
 */
export default function OrderSizeCheck({ trade, orderCheck }) {
  // Use backend data if available (includes real Kraken pair rules), else compute client-side
  const check = orderCheck
    ? {
        symbol:          orderCheck.symbol || trade?.asset_symbol,
        entryPrice:      orderCheck.entry_price,
        calculatedVol:   orderCheck.calculated_volume,
        minVol:          orderCheck.min_volume,
        minVolumeSource: orderCheck.min_volume_source || 'fallback_table',
        pairInfo:        orderCheck.pair_info || null,
        costMin:         orderCheck.cost_min || null,
        usdAmount:       orderCheck.usd_amount,
        usdBalance:      orderCheck.usd_balance,
        minUsdRequired:  orderCheck.min_usd_required,
        passes:          orderCheck.passes,
      }
    : computeOrderCheck(trade);

  if (!check) return null;

  const { symbol, entryPrice, calculatedVol, minVol, minVolumeSource, pairInfo, costMin, usdAmount, usdBalance, minUsdRequired, passes } = check;

  const isLiveData = minVolumeSource === 'kraken_api';
  const isUnknown = passes === null;
  const isFail = passes === false;
  const isPass = passes === true;

  const borderColor = isFail ? 'border-red-500/30' : isPass ? 'border-green-500/20' : 'border-border/50';
  const bgColor = isFail ? 'bg-red-500/5' : isPass ? 'bg-green-500/5' : 'bg-secondary/20';
  const Icon = isFail ? AlertCircle : isPass ? CheckCircle2 : Info;
  const iconColor = isFail ? 'text-red-400' : isPass ? 'text-green-400' : 'text-muted-foreground';

  const headline = isFail
    ? 'Order too small for Kraken minimum'
    : isPass
    ? 'Order size passes Kraken minimum'
    : 'Order size (pre-check, USD balance unknown)';

  return (
    <div className={cn('rounded-lg border p-3 sm:p-4 space-y-3', bgColor, borderColor)}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
          <span className={cn('text-sm font-semibold', isFail ? 'text-red-400' : isPass ? 'text-green-400' : 'text-foreground')}>
            {headline}
          </span>
        </div>
        {/* Source badge */}
        <SourceBadge isLive={isLiveData} hasBackendData={!!orderCheck} />
      </div>

      {/* Pair info from Kraken API */}
      {pairInfo && (
        <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md px-3 py-2 border border-border/40">
          <span className="font-medium text-foreground">{pairInfo.wsname || pairInfo.altname}</span>
          {pairInfo.base && pairInfo.quote && (
            <span className="ml-2 text-muted-foreground/70">base: {pairInfo.base} · quote: {pairInfo.quote}</span>
          )}
          {pairInfo.lot_decimals && (
            <span className="ml-2 text-muted-foreground/70">lot decimals: {pairInfo.lot_decimals}</span>
          )}
        </div>
      )}

      {/* Data rows */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <Row label="Calculated volume" value={calculatedVol != null ? `${fmt(calculatedVol, 8)} ${symbol}` : '—'} highlight={isFail ? 'red' : null} />
        <Row label="Kraken minimum" value={minVol != null ? `${fmt(minVol, 8)} ${symbol}` : '—'} />
        <Row label="USD to deploy" value={usdAmount != null ? fmtUsd(usdAmount) : '—'} highlight={isFail ? 'red' : null} />
        <Row label="Min. USD required" value={minUsdRequired != null ? fmtUsd(minUsdRequired) : '—'} />
        {usdBalance != null && <Row label="Available USD balance" value={fmtUsd(usdBalance)} fullWidth />}
        <Row label="Entry price" value={entryPrice ? fmtUsd(entryPrice) : '—'} />
        {costMin != null && <Row label="Kraken cost min" value={fmtUsd(costMin)} />}
      </div>

      {/* Actionable hint on failure */}
      {isFail && (
        <div className="text-xs text-red-300/80 pt-1 border-t border-red-500/20">
          Deposit more USD to your Kraken account, or increase the position size so the order meets the{' '}
          <span className="font-semibold text-red-300">{fmt(minVol, 8)} {symbol}</span> minimum
          {isLiveData ? ' (from live Kraken pair rules)' : ' (from local fallback table)'}.
        </div>
      )}
    </div>
  );
}

function SourceBadge({ isLive, hasBackendData }) {
  if (!hasBackendData) {
    // Client-side pre-check — always fallback
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
        <Database className="w-2.5 h-2.5" />
        Pre-check · fallback table
      </span>
    );
  }
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
        <Wifi className="w-2.5 h-2.5" />
        Live Kraken pair rules
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
      <Database className="w-2.5 h-2.5" />
      Fallback table
    </span>
  );
}

function Row({ label, value, highlight, fullWidth }) {
  const valueColor = highlight === 'red' ? 'text-red-400' : 'text-foreground';
  return (
    <>
      <span className={cn('text-muted-foreground', fullWidth && 'col-span-2')}>{label}</span>
      <span className={cn('font-mono font-medium text-right', valueColor, fullWidth && 'col-span-2 text-right')}>
        {value}
      </span>
    </>
  );
}