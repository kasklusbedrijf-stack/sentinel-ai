import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Settings as SettingsIcon, User, Link2, Shield, Globe, DollarSign, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { toast } from 'sonner';
import { translations } from '@/lib/translations';
import KrakenConnectionForm from '@/components/settings/KrakenConnectionForm';

export default function Settings() {
  const [user, setUser] = useState(null);
  const { language, setLanguage, currency, setCurrency, languages, currencies, applyPreferences, hasUnsavedChanges, t } = useAppPreferences();
  const navigate = useNavigate();
  const location = useLocation();

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleNavigation = (e) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes to your preferences. Leave without saving?'
        );
        if (!confirmLeave) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSavePreferences = () => {
    applyPreferences();
    toast.success(t('settings_save_changes'));
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto pb-32 sm:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> {t('settings_title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('settings_account_settings')}</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> {t('settings_profile')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('settings_name')}</Label>
            <Input value={user?.full_name || ''} disabled className="bg-muted border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('settings_email')}</Label>
            <Input value={user?.email || ''} disabled className="bg-muted border-border" />
          </div>
        </div>
      </div>

      {/* Localization & Currency */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> {t('settings_localization')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-xs text-muted-foreground">{t('settings_language')}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="bg-card border-border">
                <SelectValue placeholder={t('settings_language')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.entries(languages).map(([code, { name, nativeName }]) => (
                  <SelectItem key={code} value={code}>
                    {nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{t('settings_language_help')}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs text-muted-foreground">{t('settings_currency')}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="bg-card border-border">
                <SelectValue placeholder={t('settings_currency')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {currencies.map(({ code, symbol, name }) => (
                  <SelectItem key={code} value={code}>
                    {symbol} {code} - {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{t('settings_currency_help')}</p>
          </div>
        </div>

        {/* Unsaved changes notice */}
        {hasUnsavedChanges && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-400">{t('settings_unsaved_changes')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('settings_unsaved_help')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Kraken Connection */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" /> {t('settings_exchange_connection')}
        </h3>
        <KrakenConnectionForm onConnectionStatusChange={(status) => {}} />
        <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
          <p><strong>What this integrates:</strong></p>
          <ul className="ml-3 space-y-1">
            <li>• REST API for reading balances and order history</li>
            <li>• WebSocket for live price streaming</li>
            <li>• Order execution (buy/sell) with your manual approval</li>
            <li>• CoinGecko for public market data (always available)</li>
          </ul>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> {t('settings_security')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('settings_2fa_coming')}
        </p>
        <Button variant="outline" size="sm" onClick={() => base44.auth.logout()}>
          {t('settings_logout')}
        </Button>
      </div>

      {/* Save changes button — fixed on mobile, inline on desktop */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 sm:static border-t border-border bg-card/95 backdrop-blur-sm p-4 sm:p-0 sm:bg-transparent sm:border-0">
          <div className="max-w-3xl mx-auto flex gap-3 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setLanguage(localStorage.getItem('app_language') || 'en');
                setCurrency(localStorage.getItem('app_currency') || 'USD');
              }}
            >
              {t('settings_cancel')}
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            >
              {t('settings_save_changes')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}