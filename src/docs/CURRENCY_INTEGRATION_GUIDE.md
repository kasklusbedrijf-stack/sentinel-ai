# Currency Integration Guide

## Quick Start: How to Use Currency Formatting in Components

The `useAppPreferences()` hook provides `formatCurrency()` function that automatically formats values with the user's selected currency.

### Basic Example

```jsx
import { useAppPreferences } from '@/lib/AppPreferencesContext';

export default function Dashboard() {
  const { formatCurrency } = useAppPreferences();
  
  const totalValue = 15500.50;
  const unrealizedPnL = 320.75;
  
  return (
    <div>
      <p>Portfolio Value: {formatCurrency(totalValue)}</p>
      <p>Unrealized PnL: {formatCurrency(unrealizedPnL)}</p>
    </div>
  );
}
```

### Output Examples (Based on User's Currency Selection)

**User selects USD:**
- Portfolio Value: **$15,500.50**
- Unrealized PnL: **$320.75**

**User selects EUR:**
- Portfolio Value: **€15,500.50**
- Unrealized PnL: **€320.75**

**User selects GBP:**
- Portfolio Value: **£15,500.50**
- Unrealized PnL: **£320.75**

**User selects PLN:**
- Portfolio Value: **zł15,500.50**
- Unrealized PnL: **zł320.75**

---

## Full useAppPreferences Hook API

```jsx
const {
  language,           // Current language code (string: 'en', 'pl', 'de', etc.)
  setLanguage,        // Function to change language
  currency,           // Current currency code (string: 'USD', 'EUR', 'GBP', 'PLN')
  setCurrency,        // Function to change currency
  languages,          // Object with all available languages
  currencies,         // Array of available currency objects
  getCurrencySymbol,  // Function: () => string (e.g., '$', '€', '£', 'zł')
  formatCurrency,     // Function: (amount) => string (formats number with symbol + commas)
} = useAppPreferences();
```

---

## Integration Points in App

### Current Implementation Status

| Component/Page | Status | Notes |
|---|---|---|
| AppPreferencesContext | ✅ Ready | Context + hooks implemented |
| GlobalSearch | ✅ Ready | Search modal working |
| Settings (Language) | ✅ Ready | Dropdown working, persists to localStorage |
| Settings (Currency) | ✅ Ready | Dropdown working, persists to localStorage |
| **Dashboard** | ⚠️ TODO | Replace hardcoded `$` with formatCurrency() |
| **Portfolio** | ⚠️ TODO | Replace hardcoded `$` with formatCurrency() |
| **Positions** | ⚠️ TODO | Replace hardcoded `$` with formatCurrency() |
| **Alerts** | ⚠️ TODO | Update currency symbols if present |
| **AI Signals** | ⚠️ TODO | Update suggested entry/TP/SL prices with currency |
| **Audit Log** | ⚠️ TODO | Update monetary values if present |

---

## Step-by-Step Integration Example: Dashboard Component

### Before (Current)
```jsx
// pages/Dashboard.jsx
<StatsCard
  title="Portfolio Value"
  value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
  subtitle="Total holdings"
  icon={DollarSign}
  accent={true}
/>

<StatsCard
  title="Unrealized PnL"
  value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
  subtitle={`${totalPnlPct.toFixed(2)}% overall`}
  icon={TrendingUp}
/>
```

### After (With Currency Support)
```jsx
// pages/Dashboard.jsx
import { useAppPreferences } from '@/lib/AppPreferencesContext';

export default function Dashboard() {
  const { formatCurrency } = useAppPreferences();
  
  // ... existing code ...
  
  return (
    <>
      <StatsCard
        title="Portfolio Value"
        value={formatCurrency(totalValue)}
        subtitle="Total holdings"
        icon={DollarSign}
        accent={true}
      />

      <StatsCard
        title="Unrealized PnL"
        value={`${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl)}`}
        subtitle={`${totalPnlPct.toFixed(2)}% overall`}
        icon={TrendingUp}
      />
    </>
  );
}
```

### Key Changes
1. Add import: `import { useAppPreferences } from '@/lib/AppPreferencesContext';`
2. Call hook: `const { formatCurrency } = useAppPreferences();`
3. Replace hardcoded `$` with `formatCurrency(value)`
4. Done! Value now updates when user changes currency in Settings

---

## Common Patterns

### Pattern 1: Display Money with PnL Styling
```jsx
const { formatCurrency } = useAppPreferences();
const pnl = totalPnl;

<p className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
</p>
```

### Pattern 2: Price Display in Tables
```jsx
const { formatCurrency } = useAppPreferences();

<td className="text-right font-mono">
  {formatCurrency(asset.current_price)}
</td>
```

### Pattern 3: Position Risk/Reward Display
```jsx
const { formatCurrency } = useAppPreferences();

<div className="flex gap-2">
  <span>Entry: {formatCurrency(position.entry_price)}</span>
  <span>SL: {formatCurrency(position.stop_loss)}</span>
  <span>TP1: {formatCurrency(position.tp1)}</span>
</div>
```

### Pattern 4: Summary Cards with Multiple Values
```jsx
const { formatCurrency } = useAppPreferences();

<div className="grid grid-cols-3 gap-4">
  <div>
    <p className="text-xs text-muted-foreground">Entry</p>
    <p className="font-mono font-semibold">{formatCurrency(entry)}</p>
  </div>
  <div>
    <p className="text-xs text-muted-foreground">Current</p>
    <p className="font-mono font-semibold">{formatCurrency(current)}</p>
  </div>
  <div>
    <p className="text-xs text-muted-foreground">PnL</p>
    <p className="font-mono font-semibold">{formatCurrency(pnl)}</p>
  </div>
</div>
```

---

## Implementation Priority (Recommended Order)

1. **Dashboard** (highest visibility) → Uses formatCurrency in stats cards
2. **Portfolio** → Holds display values
3. **Positions** → Entry, SL, TP prices
4. **AI Signals** → Suggested entry/TP prices
5. **Other pages** → Lower impact currency values

---

## Testing Currency Changes

### Manual Test Flow
1. Go to **Settings** page
2. Click **Display Currency** dropdown
3. Select **EUR** (or another currency)
4. Go to **Dashboard** → Values should update to EUR symbols once integrated
5. Go to **Portfolio** → Values should update once integrated
6. Refresh page → Currency selection persists (localStorage)
7. Close browser entirely → Currency selection still persists on reopening

### Debug/Verify Hook Works
```jsx
// Temporary: Add this to any component to verify hook works
import { useAppPreferences } from '@/lib/AppPreferencesContext';

export default function TestComponent() {
  const { currency, formatCurrency } = useAppPreferences();
  
  return (
    <div>
      <p>Current currency: {currency}</p>
      <p>Test value: {formatCurrency(1234.56)}</p>
    </div>
  );
}
```

---

## Troubleshooting

### "useAppPreferences is not defined" error
- **Fix:** Make sure AppPreferencesProvider wraps your component tree in App.jsx ✅ (already done)
- **Check:** Component is a child of App → Layout → Outlet

### Currency symbol not showing
- **Fix:** Make sure you're using `formatCurrency(value)` instead of just `$value`
- **Check:** Import is correct: `import { useAppPreferences } from '@/lib/AppPreferencesContext';`

### Selection not persisting after refresh
- **Check:** Browser has localStorage enabled
- **Check:** DevTools → Application → Local Storage → See `app_currency` and `app_language` keys

---

## Future: Real Exchange Rate Conversion

When ready to add real exchange rate support:

```jsx
// Example enhancement (not implemented yet)
const { currency, exchangeRate } = useAppPreferences();
const convertedValue = baseValue * (exchangeRate[currency] || 1);
```

This would require:
1. Adding exchange rate API call to AppPreferencesContext
2. Storing rates with update logic
3. Modifying `formatCurrency()` to convert amounts

---

## API Reference

### AppPreferencesContext.Provider

**Location:** `lib/AppPreferencesContext.jsx`

**Value Object:**
```typescript
{
  language: string;                   // 'en' | 'pl' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl'
  setLanguage: (lang: string) => void;
  currency: string;                   // 'USD' | 'EUR' | 'GBP' | 'PLN'
  setCurrency: (curr: string) => void;
  languages: Record<string, { name: string; nativeName: string }>;
  currencies: Array<{ code: string; symbol: string; name: string }>;
  getCurrencySymbol: () => string;    // Returns '$', '€', '£', or 'zł'
  formatCurrency: (amount: number | null | undefined) => string; // Returns formatted string
}
```

### useAppPreferences Hook

```jsx
const appPrefs = useAppPreferences();
// Throws error if used outside AppPreferencesProvider
```

---

## Notes

- All preferences are saved to browser's localStorage automatically
- No backend calls needed (client-side only)
- Minimal performance impact
- Works offline
- Ready for real-time updates when backend integration needed

Good luck with integration! 🚀