import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { TradeApprovalForm } from '@/components/TradeApproval/TradeApprovalForm';

export default function TradeApproval({ tradeApprovalId, onBack }) {
  const { formatCurrency, t } = useAppPreferences();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [uiPhase, setUiPhase] = useState('idle');
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusIsError, setStatusIsError] = useState(false);
  const [orderCheck, setOrderCheck] = useState(null);

  const resolvedId = tradeApprovalId || routeId;
  const handleBack = onBack || (() => navigate(-1));

  useEffect(() => {
    const loadTrade = async () => {
      if (resolvedId) {
        const found = await base44.entities.TradeApproval.filter({ id: resolvedId });
        if (found.length > 0) setTrade(found[0]);
      } else {
        const data = await base44.entities.TradeApproval.list('-created_date', 1);
        if (data.length > 0) setTrade(data[0]);
      }
      setLoading(false);
    };
    loadTrade();
  }, [resolvedId]);

  const handleValidate = async () => {
    if (!trade) return;
    setBusy(true);
    setStatusMsg(null);
    setStatusIsError(false);
    setOrderCheck(null);
    try {
      if (trade.status === 'pending') {
        await base44.entities.TradeApproval.update(trade.id, {
          status: 'approved',
          approved_at: new Date().toISOString(),
        });
        setTrade(prev => ({ ...prev, status: 'approved' }));
      }
      const result = await base44.functions.invoke('executeTradeOnKraken', {
        trade_approval_id: trade.id,
        validation_only: true,
      });
      const data = result.data;
      if (data.order_check) setOrderCheck(data.order_check);

      if (data.success) {
        setUiPhase('validated');
        setStatusIsError(false);
        const oc = data.order_check;
        const detail = oc
          ? ` · ${oc.calculated_volume} ${oc.symbol} @ $${oc.entry_price}`
          : '';
        setStatusMsg(`${t('trade_approval_validated_ok')}${detail}`);
      } else {
        setStatusIsError(true);
        setStatusMsg(buildErrorMessage(data));
      }
    } catch (err) {
      setStatusIsError(true);
      // Try to extract structured data from the axios error response body
      const body = err?.response?.data;
      if (body) {
        if (body.order_check) setOrderCheck(body.order_check);
        setStatusMsg(buildErrorMessage(body));
      } else {
        setStatusMsg(err.message || 'Unknown error');
      }
    }
    setBusy(false);
  };

  /** Turn a structured backend error response into a human-readable string */
  function buildErrorMessage(data) {
    const oc = data?.order_check;
    if (data?.error_code === 'VOLUME_TOO_SMALL' && oc) {
      return [
        'Order too small for Kraken minimum.',
        `Calculated volume: ${oc.calculated_volume} ${oc.symbol}`,
        `Kraken minimum: ${oc.min_volume} ${oc.symbol}`,
        `USD to deploy: $${Number(oc.usd_amount).toFixed(2)}`,
        `Minimum USD required: $${Number(oc.min_usd_required).toFixed(2)}`,
        oc.usd_balance != null ? `Available balance: $${Number(oc.usd_balance).toFixed(2)}` : null,
        'Increase position size or deposit more USD to Kraken.',
      ].filter(Boolean).join('\n');
    }
    if (data?.error_code === 'VOLUME_ZERO' && oc) {
      return [
        'Calculated order volume is zero.',
        `USD to deploy: $${Number(oc.usd_amount).toFixed(2)}`,
        oc.usd_balance != null ? `Available balance: $${Number(oc.usd_balance).toFixed(2)}` : null,
        'Check your USD balance on Kraken or set a higher position size.',
      ].filter(Boolean).join('\n');
    }
    // Generic: just use the error field
    const base = data?.error || 'Validation failed';
    if (data?.debug) {
      const d = data.debug;
      return `${base}\npair=${d.pair}, volume=${d.volume}, price=${d.price}`;
    }
    return base;
  }

  const handleExecuteLive = async () => {
    if (!trade) return;
    const confirmed = window.confirm(
      t('trade_approval_confirm_live')
        .replace('{direction}', trade.direction?.toUpperCase())
        .replace('{symbol}', trade.asset_symbol)
        .replace('{price}', formatCurrency(trade.entry_price))
    );
    if (!confirmed) return;
    setBusy(true);
    setStatusMsg(null);
    setStatusIsError(false);
    try {
      const result = await base44.functions.invoke('executeTradeOnKraken', {
        trade_approval_id: trade.id,
        validation_only: false,
      });
      const data = result.data;
      if (data.success) {
        setUiPhase('sent');
        setStatusIsError(false);
        setTrade(prev => ({ ...prev, status: 'sent', exchange_order_id: data.order_id }));
        setStatusMsg(`${t('trade_approval_order_submitted')}: ${data.kraken_txid || data.order_id}`);
      } else {
        setStatusIsError(true);
        setStatusMsg(buildErrorMessage(data));
      }
    } catch (err) {
      setStatusIsError(true);
      const body = err?.response?.data;
      if (body) {
        if (body.order_check) setOrderCheck(body.order_check);
        setStatusMsg(buildErrorMessage(body));
      } else {
        setStatusMsg(err.message || 'Unknown error');
      }
    }
    setBusy(false);
  };

  const handleReject = async () => {
    if (!trade) return;
    setRejecting(true);
    try {
      await base44.entities.TradeApproval.update(trade.id, {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: t('trade_approval_user_rejected'),
      });
      setTrade(prev => ({ ...prev, status: 'rejected' }));
      setUiPhase('rejected');
    } catch (err) {
      console.error('Rejection failed:', err);
    }
    setRejecting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p className="text-muted-foreground">{t('trade_approval_no_trade')}</p>
      </div>
    );
  }

  const isExecuted = ['sent', 'filled', 'partial'].includes(trade.status) || uiPhase === 'sent';
  const isRejected = trade.status === 'rejected' || uiPhase === 'rejected';
  const isActionable = !isExecuted && !isRejected;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={handleBack}
          className="p-1 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{t('trade_approval_title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('trade_approval_subtitle')}</p>
        </div>
        {isExecuted && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t('trade_status_sent')}</Badge>}
        {isRejected && <Badge className="bg-destructive/20 text-destructive border-destructive/30">{t('trade_status_rejected')}</Badge>}
        {isActionable && uiPhase === 'idle' && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{t('trade_status_test_mode')}</Badge>}
        {isActionable && uiPhase === 'validated' && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{t('trade_status_ready')}</Badge>}
      </div>

      <TradeApprovalForm
        trade={trade}
        formatCurrency={formatCurrency}
        t={t}
        busy={busy}
        rejecting={rejecting}
        uiPhase={uiPhase}
        isActionable={isActionable}
        isExecuted={isExecuted}
        isRejected={isRejected}
        onValidate={handleValidate}
        onExecute={handleExecuteLive}
        onReject={handleReject}
        statusMsg={statusMsg}
        statusIsError={statusIsError}
        orderCheck={orderCheck}
      />
    </div>
  );
}