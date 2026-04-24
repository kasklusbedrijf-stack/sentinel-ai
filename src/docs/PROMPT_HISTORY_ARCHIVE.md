# CryptoAI Trading Platform — Full Prompt History Archive

**Project:** CryptoAI — AI-Driven Crypto Trading Platform  
**Stack:** React + Tailwind CSS + Base44 Backend (Deno functions, entities, agents)  
**Exchange Integration:** Kraken (live trading) + CoinGecko (market data)  
**Archive Date:** 2026-04-24  
**Compiled by:** Senior Documentation Engineer (AI-assisted reconstruction)

> **Note on methodology:** This archive is reconstructed from source code, system prompts embedded in `lib/agentConfig.js`, backend function logic in `functions/`, entity schemas, UI/component structure, and the conversation history of the build session. Prompts marked `[RECONSTRUCTED]` are inferred from code artifacts and may not be verbatim. Prompts marked `[VERBATIM]` or `[NEAR-VERBATIM]` are taken directly from embedded system prompt strings or conversation records.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Phase 1 — Initial App Creation](#2-phase-1--initial-app-creation)
3. [Phase 2 — Core Entities & Data Model](#3-phase-2--core-entities--data-model)
4. [Phase 3 — Market Data & CoinGecko Integration](#4-phase-3--market-data--coingecko-integration)
5. [Phase 4 — Kraken Exchange Integration](#5-phase-4--kraken-exchange-integration)
6. [Phase 5 — AI Agents System](#6-phase-5--ai-agents-system)
7. [Phase 6 — AI Scout (Pipeline Automation)](#7-phase-6--ai-scout-pipeline-automation)
8. [Phase 7 — Screenshot-Based Chart Analysis](#8-phase-7--screenshot-based-chart-analysis)
9. [Phase 8 — Trade Approval & Execution Flow](#9-phase-8--trade-approval--execution-flow)
10. [Phase 9 — Risk Management System](#10-phase-9--risk-management-system)
11. [Phase 10 — Localization & Multi-Language](#11-phase-10--localization--multi-language)
12. [Phase 11 — Currency Conversion](#12-phase-11--currency-conversion)
13. [Phase 12 — UI/UX, Mobile & Design](#13-phase-12--uiux-mobile--design)
14. [Phase 13 — Global Search](#14-phase-13--global-search)
15. [Phase 14 — Asset Icons (CoinGecko)](#15-phase-14--asset-icons-coingecko)
16. [Phase 15 — Settings & API Key Management](#16-phase-15--settings--api-key-management)
17. [Phase 16 — Audit Log & Security](#17-phase-16--audit-log--security)
18. [Phase 17 — Bug Fixes & Audits](#18-phase-17--bug-fixes--audits)
19. [Phase 18 — Codebase Refactoring](#19-phase-18--codebase-refactoring)
20. [Active System Prompts (Currently in Effect)](#20-active-system-prompts-currently-in-effect)
21. [Missing or Uncertain Prompts](#21-missing-or-uncertain-prompts)

---

## 1. Project Overview

**App Name:** CryptoAI  
**Core Concept:** A premium, mobile-first AI-powered cryptocurrency trading assistant that combines live market data (CoinGecko), real exchange connectivity (Kraken), a multi-agent AI pipeline for automated trade discovery, and a human-in-the-loop approval flow before any real order is placed.

**Key Features Built:**
- Live market dashboard (prices, 24h changes, trends)
- CoinGecko market sync (20 assets, real-time)
- Kraken account sync (balances, open orders)
- 4 AI chat agents (Market Watcher, Risk Manager, Trade Planner, Alert Agent)
- Screenshot/chart upload for agent visual analysis
- AI Scout pipeline (Market Watcher → Trade Planner → Risk Manager → TradeApproval)
- Trade Approval page with validate-then-execute flow
- Risk settings with emergency stop
- Portfolio tracker
- Position tracker with live Kraken WebSocket prices
- Alerts system
- Audit log
- 8-language localization (EN, PL, DE, FR, ES, IT, PT, NL)
- Multi-currency support (USD, EUR, GBP, PLN)
- Global command-palette search
- CoinGecko-based crypto icons with 3-tier fallback
- Settings page with Kraken API key management

---

## 2. Phase 1 — Initial App Creation

**Order:** #1  
**Topic:** App Creation  
**Purpose:** Bootstrap the entire CryptoAI application concept and initial structure

### Prompt 1.1 — Original Creation Prompt [RECONSTRUCTED — inferred from app structure]

```
Build a premium AI-driven cryptocurrency trading platform called CryptoAI.

The app should be a mobile-first, dark-themed trading dashboard with:

- A market overview showing top cryptocurrencies with prices, 24h changes, trends
- A portfolio tracker where users can see their holdings and P&L
- An AI signals section where AI-generated trade signals are displayed
- A positions tracker for open trades
- An alerts/notifications system
- A risk management settings panel
- An audit log for all actions

The app should feel like a premium crypto trading terminal — dark background, 
green/teal primary color (#20d9a0 range), clean typography (Inter font), 
and a mobile-first sidebar navigation.

Use the following entities:
- Asset (crypto market data)
- AISignal (AI-generated trading signals)
- Position (open trades)
- PortfolioAsset (user holdings)
- Alert (notifications)
- RiskSettings (risk configuration)
- AuditLog (action history)

Build a full multi-page app with sidebar navigation.
```

> **Note:** The exact original creation prompt is not recoverable verbatim. The above is a high-confidence reconstruction based on the app's entity schema, page structure, and design system that resulted from it.

---

## 3. Phase 2 — Core Entities & Data Model

**Order:** #2  
**Topic:** Entity Schema Design  
**Purpose:** Define the full data model for trading, signals, approvals, and exchange orders

### Prompt 2.1 — Trade Approval Entity [RECONSTRUCTED]

```
Add a TradeApproval entity to track AI-generated trade proposals that require 
user approval before execution. Fields needed:

- asset_symbol, asset_name, direction (buy/sell)
- entry_price, stop_loss, tp1, tp2, tp3
- position_size_pct, estimated_risk, estimated_reward, rr_ratio
- confidence_score (0-100), risk_score (0-100)
- summary, detailed_rationale
- signal_id (reference to AISignal)
- status: pending | approved | rejected | sent | filled | partial | cancelled | failed
- validity_reason, approved_at, rejected_at, rejection_reason
- exchange_order_id
- edited_entry, edited_stop_loss, edited_tp1 (for user modifications)
```

### Prompt 2.2 — ExchangeOrder Entity [RECONSTRUCTED]

```
Add an ExchangeOrder entity to track orders actually sent to Kraken:

- trade_approval_id (reference to TradeApproval)
- asset_symbol, direction (buy/sell)
- order_type: market | limit
- entry_price, quantity, stop_loss, tp1, tp2, tp3
- exchange (default: kraken), exchange_order_id (Kraken txid)
- status: pending | sent | open | filled | partial_fill | cancelled | failed
- sent_at, filled_at, filled_price, filled_quantity
- error_message, raw_response (full Kraken API JSON string)
```

### Prompt 2.3 — AgentPipeline Entity [RECONSTRUCTED]

```
Add an AgentPipeline entity to track the 3-step AI agent pipeline runs:

- status: running | completed | failed
- step: market_scan | trade_planning | risk_review | done
- market_scan_result (JSON string — Market Watcher output)
- trade_plans_result (JSON string — Trade Planner output)
- risk_review_result (JSON string — Risk Manager output)
- error_message
- started_at, completed_at, triggered_by (user email)
```

---

## 4. Phase 3 — Market Data & CoinGecko Integration

**Order:** #3  
**Topic:** CoinGecko Live Market Data  
**Purpose:** Pull real-time prices, volumes, and technical indicators for 20 assets

### Prompt 3.1 — CoinGecko Sync Function [RECONSTRUCTED from function code]

```
Create a backend function called syncCoinGeckoMarket that:

1. Calls the CoinGecko public API: /coins/markets endpoint with these 20 assets:
   BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, LINK, UNI, AAVE, GRT, RENDER, FET, 
   NEAR, MATIC, ARB, OP, DOGE, SHIB

2. For each coin, fetch: current price, 1h/24h/7d changes, volume, market cap, 
   24h high/low, image URL

3. Derive technical indicators from the price data:
   - RSI estimate (from 24h + 7d change, capped 20-85)
   - Trend status: strong_bullish | bullish | neutral | bearish | strong_bearish
   - MACD signal: bullish | bearish | neutral (from 1h + 24h direction)
   - Volatility score 0-100
   - Support/resistance from 24h low/high
   - EMA proxies (20, 50, 200)

4. Upsert Asset records (create if new, update if exists)

5. Store image_url from CoinGecko for each asset
6. Mark data_source = 'coingecko' and save last_synced timestamp

7. Handle rate limiting (HTTP 429) gracefully — return a user-friendly error, not a crash
8. Support optional COINGECKO_API_KEY secret for Pro API tier
```

### Prompt 3.2 — Market Page with Live Data Controls [RECONSTRUCTED]

```
On the Market page, add:
- A "Sync Live Data" button that calls syncCoinGeckoMarket
- Show last sync time and number of assets synced
- Show a live data indicator (green dot) next to assets that have coingecko data
- Show 1h, 24h, 7d change columns
- Filter by category (layer1, layer2, defi, ai, meme)
- Sort by market cap, volume, 24h change
- Top gainers and losers section
```

---

## 5. Phase 4 — Kraken Exchange Integration

**Order:** #4  
**Topic:** Kraken API Connection  
**Purpose:** Sync real Kraken account data (balances, open orders) into the app

### Prompt 4.1 — Kraken Account Sync Function [RECONSTRUCTED from function code]

```
Create a backend function syncKrakenAccount that:

1. Requires KRAKEN_API_KEY and KRAKEN_API_SECRET environment variables
2. If credentials are missing, return a helpful error (not a crash)

3. Correctly sign Kraken private API requests using:
   - HMAC-SHA-512 of (API path + SHA-256(nonce + postdata))
   - Base64-decoded API secret as HMAC key
   - Return base64-encoded signature

4. Call /0/private/Balance to get account balances
5. Call /0/private/OpenOrders to get open orders (with 50ms delay to avoid nonce collision)

6. Map Kraken asset codes to standard symbols:
   XBT/XXBT → BTC, XETH → ETH, etc.

7. Skip dust balances (< 0.000001), skip fiat (USD/EUR/GBP) and stablecoins

8. For each crypto balance:
   - Look up current price from Asset DB (already synced from CoinGecko)
   - Calculate current_value, unrealized_pnl, unrealized_pnl_pct
   - Upsert into PortfolioAsset with data_source = 'kraken'

9. Recalculate allocation_pct for all kraken-sourced portfolio assets

10. Parse open orders and return them in the response

Return: balances, open orders, total portfolio value, synced_at timestamp
```

### Prompt 4.2 — Kraken WebSocket Live Prices [RECONSTRUCTED]

```
Add a useKrakenTicker hook that connects to the Kraken public WebSocket API 
(wss://ws.kraken.com) to stream live prices for a given list of trading pairs.

- Accept an array of Kraken pair strings (e.g. ["XBT/USD", "ETH/USD"])
- Subscribe to the ticker channel on connect
- Track connection status: connected | connecting | disconnected | error
- Return live price data and status
- Auto-reconnect on disconnect
- Clean up subscription on unmount

Also create a symbolToKrakenPair helper (e.g. BTC → XBT/USD)

Use this in the Positions page to show live P&L updating in real-time with 
an animated green dot indicator next to the current price.
```

### Prompt 4.3 — Kraken Open Orders Polling [RECONSTRUCTED]

```
Create a useKrakenOrderStatus hook that polls the syncKrakenOpenOrders backend 
function every 30 seconds, but only when there are active orders with status 'sent'.

This should keep the app aware of order status changes without hammering the API 
when there's nothing to watch.
```

### Prompt 4.4 — Kraken Sync Controls Component [RECONSTRUCTED]

```
Create a KrakenSyncControls component that:
- Shows the last sync time relative to now (e.g. "5 minutes ago")
- Shows the number of balances synced and total USD value
- Has a manual "Sync Kraken" button
- Shows whether Kraken is configured (has API keys) or not
- Shows balance summary when configured
- Handles errors gracefully with readable messages
- Appears in the Portfolio page header
```

---

## 6. Phase 5 — AI Agents System

**Order:** #5  
**Topic:** AI Chat Agents (4 agents)  
**Purpose:** Allow users to chat with specialized AI trading agents

### Prompt 5.1 — AI Agents Page — Initial Build [RECONSTRUCTED]

```
Build an AI Agents page with 4 specialized AI agents that users can chat with:

1. Market Watcher — monitors prices, trends, volume, technical indicators
2. Risk Manager — evaluates portfolio risk, position safety, enforces rules
3. Trade Planner — plans trades with entry, SL, TPs, and position sizing
4. Alert Agent — manages alerts and notifications for price moves or risk events

The page should have:
- A sidebar listing the 4 agents with icons and descriptions
- A main chat area when an agent is selected
- Each agent keeps its own conversation history
- New conversation button
- Chat history / archive modal
- On mobile: sidebar hidden when chat is open, back button to return to list

Design: premium dark theme, matching the rest of the app. Mobile-first.
```

### Prompt 5.2 — Agent Conversation Persistence [RECONSTRUCTED]

```
Make agent conversations persistent using base44.agents SDK:
- createConversation, listConversations, getConversation, addMessage
- Subscribe to real-time updates using subscribeToConversation
- Load most recent conversation for each agent on page mount
- Allow creating new conversations per agent
- Show conversation history in an archive modal
- Each conversation is keyed by agentName:convId
```

---

## 7. Phase 6 — AI Scout (Pipeline Automation)

**Order:** #6  
**Topic:** Automated 3-Step AI Pipeline  
**Purpose:** Orchestrate Market Watcher → Trade Planner → Risk Manager in sequence to produce TradeApproval records automatically

### Prompt 6.1 — Run Agent Pipeline Backend Function [NEAR-VERBATIM from embedded prompts in runAgentPipeline.js]

```
Create a backend function runAgentPipeline that runs a 3-step AI pipeline:

PRE-STEP: Call syncCoinGeckoMarket to refresh live data before scanning.

STEP 1 — MARKET WATCHER:
You are Market Watcher, a senior crypto market analyst. Your job is to scan 
the available market data and shortlist the BEST 3-5 trade setups right now.

DATA SOURCE: [live or cached indicator]

MARKET DATA (top 20 assets by market cap): [JSON]
EXISTING AI SIGNALS: [JSON]
OPEN POSITIONS (already active): [symbols list]

RISK CONSTRAINTS:
- Max open positions: [N]
- Block memecoins: [Yes/No]
- Block high risk: [Yes/No]
- Min confidence threshold: [N]%

YOUR TASK:
1. Identify 3-5 assets that show the best technical setup for a trade right now
2. For each asset explain WHY it's a good setup using the available data
3. Assign a setup quality score 0-100
4. Specify suggested direction (buy/sell)
5. EXCLUDE any asset already in open positions
6. EXCLUDE memecoins if block_memecoins is true

Return JSON: { scan_summary, shortlisted_setups: [{ symbol, name, direction, 
setup_quality, rationale, key_levels, technical_signals, risk_factors }] }

---

STEP 2 — TRADE PLANNER:
You are Trade Planner, a senior crypto trading strategist. You receive 
shortlisted market setups from Market Watcher and must build precise, 
executable trade plans for each.

SHORTLISTED SETUPS FROM MARKET WATCHER: [JSON]
FULL ASSET DATA (for price level reference): [JSON]

RISK RULES:
- Max risk per trade: [N]% of portfolio
- Min R:R ratio: [N]
- Min confidence threshold: [N]%

YOUR TASK:
For each setup, create a precise trade plan with:
1. Entry price (limit order level, not market)
2. Stop loss (based on structure, not arbitrary)
3. TP1 (first take profit — conservative)
4. TP2 (second take profit — extended)
5. TP3 (third take profit — target, optional)
6. Position size recommendation (% of portfolio)
7. Confidence score 0-100
8. Risk score 0-100 (higher = riskier)
9. Short summary of the trade thesis
10. Estimated R:R ratio

Return JSON: { planning_summary, trade_plans: [{ symbol, name, direction, 
entry_price, stop_loss, tp1, tp2, tp3, position_size_pct, confidence_score, 
risk_score, rr_ratio, summary, detailed_rationale }] }

---

STEP 3 — RISK MANAGER:
You are Risk Manager, a senior crypto risk officer. Your job is to review 
trade plans created by Trade Planner and apply strict risk rules.

TRADE PLANS TO REVIEW: [JSON]
CURRENT PORTFOLIO STATE: [open positions count and symbols]

RISK RULES TO ENFORCE:
- Emergency stop active: [YES — BLOCK ALL / No]
- Min confidence: [N]%
- Max risk score: [N]
- Min R:R ratio: [N]
- Max open positions: [N]
- Block memecoins: [Yes/No]
- Block high risk assets: [Yes/No]
- Max risk per trade: [N]%

YOUR TASK:
For each trade plan:
1. Check every rule above
2. Approve or block each plan
3. Explain clearly WHY each plan was approved or blocked (which specific rule)
4. For approved plans, note any conditions or cautions
5. Provide an overall risk assessment of the whole shortlist

IMPORTANT: Do NOT approve any plan if emergency stop is active.

Return JSON: { risk_summary, approved_plans: [...], blocked_plans: [...] }

---

After pipeline completes:
- Save all 3 results to AgentPipeline record
- For each approved plan, create a TradeApproval record with status: 'pending'
- Return the pipeline_id and all results
```

### Prompt 6.2 — Pipeline Page UI [RECONSTRUCTED]

```
Build a Pipeline page that:
- Shows the 3-step pipeline (Market Watcher → Trade Planner → Risk Manager) visually
- Has a "Run AI Scout" button to trigger the pipeline
- Shows animated progress while running (polling AgentPipeline record every 3 seconds)
- Shows results when completed: scan summary, approved trade plans, blocked plans
- Shows pipeline history (past runs)
- Each approved plan links to the TradeApproval page
- On failure, show error with retry button
```

### Prompt 6.3 — AI Scout Button on Dashboard [RECONSTRUCTED]

```
Add an "AI Scout" button to the dashboard that triggers the AI pipeline.
Show it prominently as a call-to-action. When pipeline runs, show progress 
inline on the dashboard. When completed, show the number of trade approvals 
that were generated and link to them.
```

---

## 8. Phase 7 — Screenshot-Based Chart Analysis

**Order:** #7  
**Topic:** Chart Screenshot Upload for Agent Visual Analysis  
**Purpose:** Allow users to paste or upload chart images from Kraken/Binance/TradingView for AI agent analysis

### Prompt 7.1 — Screenshot Upload Feature [RECONSTRUCTED from custom instructions + code]

```
Support screenshot-based chart analysis in AI Agents. Let users upload or 
paste chart screenshots from Kraken, Binance, or TradingView directly into 
agent chat.

Requirements:
- Allow file upload via button (ImagePlus icon)
- Allow clipboard paste (Ctrl+V) of images anywhere on the page when a chat is open
- Support up to 5 images per message
- Show image previews above the input bar before sending (with remove X buttons)
- When sending with images, upload them to Base44 storage first, then send file_urls
- Display sent images inline in the message bubble (persistent, not just preview)
- Images should be clickable to open a fullscreen lightbox (Escape to close)
- Inject a per-agent chart analysis system prompt when images are present
- The chart system prompt is injected as backend content but the user only sees 
  their own note/text (strip "User note:" prefix in display)

Preserve premium dark mobile design. Keep current agent roles.
Agents must analyze only what is visible in the image, state uncertainty clearly, 
and never invent unreadable values or indicators.
```

### Prompt 7.2 — Chart Image Persistence in Conversation [RECONSTRUCTED]

```
Make image attachments persistent in the chat conversation history.
When loading an old conversation, images should still appear in the message bubbles 
using the file_urls stored by the backend.

For optimistic UI: show local base64 previews immediately while the message is 
sending (_localImagePreviews), then the backend-stored file_urls take over on reload.
```

---

## 9. Phase 8 — Trade Approval & Execution Flow

**Order:** #8  
**Topic:** Trade Approval + Kraken Order Execution  
**Purpose:** Human-in-the-loop 2-step flow: Validate → Execute Live

### Prompt 8.1 — Trade Approval Page [RECONSTRUCTED]

```
Build a TradeApproval page that:

1. Shows the AI-generated trade plan (asset, direction, entry price, SL, TPs)
2. Shows confidence score, risk score, R:R ratio, position size %
3. Shows estimated risk and estimated reward in USD
4. Shows the AI rationale and detailed explanation
5. Has 3 action buttons:
   - Reject: mark as rejected, show rejection timestamp
   - Validate: call executeTradeOnKraken with validation_only: true 
     (Kraken validates the order but doesn't submit it)
   - Execute Live: (appears after successful validation) call executeTradeOnKraken 
     with validation_only: false — this places a REAL order on Kraken

6. Show status badges: Test Mode | Validated | Sent | Rejected
7. Show success/error messages after each action
8. Works both as a standalone page (/trade-approval/:id) and as an embedded 
   component (tradeApprovalId prop)

The 2-step flow (validate first, then live) is a critical safety feature.
```

### Prompt 8.2 — Execute Trade on Kraken Backend [RECONSTRUCTED from function code]

```
Create a backend function executeTradeOnKraken with the following STRICT safety rules:

SAFETY LAYER 1 — IDEMPOTENCY:
If trade.exchange_order_id already exists, block with 409 Conflict.

SAFETY LAYER 2 — DUPLICATE GUARD:
Check ExchangeOrder table — if an order already exists for this trade_approval_id, 
block with 409 Conflict.

SAFETY LAYER 3 — BALANCE VALIDATION:
Before any order attempt, fetch live Kraken balance:
- For SELL: verify we hold enough of the asset
- For BUY: verify USD balance ≥ (entry_price × position_size_pct / 100)

SAFETY LAYER 4 — EXPLICIT MODE FLAG:
- Default is VALIDATION MODE (validate=true on Kraken AddOrder call)
- Live execution ONLY if caller explicitly passes validation_only: false
- Validation mode returns success without creating any DB records

Risk checks to run before execution:
- Emergency stop active → reject immediately
- confidence_score < min_confidence_threshold → reject
- risk_score > max_risk_score_threshold → reject  
- Open orders count ≥ max_open_positions → reject

Kraken signing: use correct HMAC-SHA512 signature:
  base64( HMAC-SHA512( base64decode(secret), path + SHA256(nonce+postdata) ) )

After successful live execution:
- Create ExchangeOrder record
- Update TradeApproval status to 'sent'
- Create AuditLog entry
- Create Alert notification
```

### Prompt 8.3 — Trade Approval Widget on Dashboard [RECONSTRUCTED]

```
Add a TradeApprovalWidget to the dashboard that shows pending trade approvals.
Real-time updates via entity subscription. Show asset symbol, direction 
(bullish/bearish color), confidence score. Click to navigate to full approval page.
```

---

## 10. Phase 9 — Risk Management System

**Order:** #9  
**Topic:** Risk Settings & Emergency Stop  
**Purpose:** User-configurable risk parameters that gate all automated trading

### Prompt 9.1 — Risk Settings Page [RECONSTRUCTED]

```
Build a Risk Settings page with:

TRADING MODE selector:
- Analysis Only: AI generates signals only, no execution
- Semi-Auto: AI suggests, user must approve each trade
- Auto: AI executes automatically (requires emergency stop awareness)

POSITION RISK sliders:
- Max risk per trade % (0.5–10%)
- Max daily loss % (1–20%)
- Max open positions (1–20)
- Auto pause after N consecutive losses (1–10)

EXPOSURE LIMITS sliders:
- Max single coin exposure % (5–100%)
- Max alt exposure % (10–100%)
- Min confidence threshold % (30–95%)
- Min R:R ratio (1–10, step 0.5)

ASSET FILTERS toggles:
- Block memecoins
- Block high-risk assets
- Allow auto trading

EMERGENCY STOP button:
- Immediately blocks all automated trading
- Creates an Alert (type: emergency, severity: critical)
- Creates an AuditLog entry
- The button pulses when emergency stop is active

Save button saves to RiskSettings entity (create if first time, update if exists).
```

---

## 11. Phase 10 — Localization & Multi-Language

**Order:** #10  
**Topic:** 8-Language Localization  
**Purpose:** Full UI translation into EN, PL, DE, FR, ES, IT, PT, NL

### Prompt 10.1 — Initial Localization System [RECONSTRUCTED]

```
Add multi-language support to the app. Support 8 languages:
- English (en) — default
- Polish (pl)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)

Create a translations system in lib/translations.js (with sub-files per language).
Create an AppPreferencesContext with a t(key) function for all UI strings.
Store selected language in localStorage.
Apply language selection in the Settings page.
```

### Prompt 10.2 — Agent Descriptions in All Languages [RECONSTRUCTED from agentConfig.js]

```
Make all 4 AI agent descriptions, example questions, and system prompts 
language-aware. Each agent's description and example prompts should be 
translated into all 8 languages. The chart analysis system prompts should 
also instruct the agent to respond in the user's selected language.
```

### Prompt 10.3 — Agent Chart Prompts — Full Language-Aware Versions [NEAR-VERBATIM from agentConfig.js]

For German (de):
```
Du bist Market Watcher, ein Senior-Crypto-Marktanalyst in einer Premium-Mobil-Trading-App. 
Analysiere NUR, was klar sichtbar im Screenshot ist. Gib strukturierte Marktintelligenz 
basierend auf sichtbaren Beweisen zurück. Trenne Fakten von Interpretationen. 
Erfinde niemals Daten. Antworte auf Deutsch.
```

For French (fr):
```
Vous êtes Market Watcher, un analyste marché crypto senior dans une application mobile 
de trading premium. Analysez UNIQUEMENT ce qui est clairement visible dans la capture 
d'écran. Retournez une intelligence de lecture de marché structurée basée sur des 
preuves visibles. Séparez les faits de l'interprétation. N'inventez jamais de données. 
Répondez en français.
```

For Polish (pl) — full structured format prompt:
```
Jesteś Obserwator Rynku, senior crypto market intelligence analyst wewnątrz premium 
mobile trading app.

TWOJA ROLA:
Analizuj TYLKO to, co jest wyraźnie widoczne na przesłanym zrzucie ekranu. Zwróć 
strukturyzowaną analizę rynkową na podstawie widocznych dowodów. Oddzielaj fakty 
od interpretacji. Nigdy nie wymyślaj danych.

KRYTYCZNE REGUŁY — postępuj bez wyjątku:

**REGUŁA ODRZUCENIA — Odpowiadaj tylko na prawidłowe wykresy/ekrany rynku:**
Jeśli zrzut ekranu NIE jest rzeczywistym wykresem ceny lub przydatnym ekranem rynku, 
odpowiedz krótko:
"Ten zrzut ekranu nie jest prawidłowym wykresem ani ekranem rynkowym do analizy 
Obserwatora Rynku. Wyślij wyraźniejszy wykres ceny, listę obserwacji, ekran zmian 
lub ekran rynkowy zasobu."

**REGUŁY ANALIZY — dla prawidłowych zrzutów ekranów:
- Analizuj TYLKO: widoczne świeczki, knoty, kierunek trendu...
[continues with full Polish format]
```

---

## 12. Phase 11 — Currency Conversion

**Order:** #11  
**Topic:** Multi-Currency Display  
**Purpose:** Show all monetary values in user's preferred currency

### Prompt 11.1 — Currency System [RECONSTRUCTED]

```
Add currency conversion support. Support 4 currencies:
- USD ($) — base, 1:1
- EUR (€) — rate: 0.92
- GBP (£) — rate: 0.79
- PLN (zł) — rate: 4.00

All USD values stored in DB. formatCurrency() converts to display currency.
User selects preferred currency in Settings. Saved to localStorage.
Apply to: portfolio values, P&L, entry prices, estimated risk/reward.
Use static conversion rates (update monthly). Note in code to replace with 
live FX API later.
```

---

## 13. Phase 12 — UI/UX, Mobile & Design

**Order:** #12  
**Topic:** Premium Dark Design & Mobile Optimization  
**Purpose:** Polish the visual design to feel like a premium trading terminal on mobile

### Prompt 12.1 — Initial Design Tokens [RECONSTRUCTED from index.css]

```
Set up a premium dark trading terminal design system:

Colors:
- Background: hsl(222, 47%, 6%) — very dark navy
- Card: hsl(222, 47%, 8%)
- Primary: hsl(168, 80%, 50%) — teal/green (crypto feel)
- Primary foreground: dark (for on-primary text)
- Muted: hsl(222, 30%, 12%)
- Destructive: hsl(0, 72%, 51%) — red for sell/loss
- Success: hsl(142, 70%, 45%) — green for buy/profit
- Warning: hsl(47, 96%, 53%) — yellow
- Border: hsl(222, 30%, 16%)

Typography:
- Inter for UI text
- JetBrains Mono for prices and numbers (font-mono class)

Radius: 0.75rem
Sidebar: slightly lighter than background
Add pulse-glow animation for the primary color
```

### Prompt 12.2 — Mobile Navigation & Layout [RECONSTRUCTED]

```
Make the app fully mobile-first:
- Sidebar should be hidden on mobile and slide in from the left
- Add a hamburger menu button in the top bar on mobile
- The top bar should be compact on mobile
- All pages should use responsive grids (1 col mobile, 2-3 col desktop)
- Cards and tables should switch to mobile card layouts on small screens
- Font sizes should be smaller on mobile
- Touch targets should be at least 44px
- Use safe-area-inset-bottom for input bars (iOS home bar)
```

### Prompt 12.3 — Agents Page — Mobile Chat UI [RECONSTRUCTED]

```
On mobile, the agents page should work like a native mobile chat:
- Full-screen sidebar list of agents
- Tapping an agent opens the full-screen chat (sidebar hidden)
- Back button (chevron left) returns to agent list
- Input bar is fixed at bottom with safe-area padding
- Messages scroll independently
```

### Prompt 12.4 — Dashboard Layout [RECONSTRUCTED]

```
The dashboard should show:
- Top: portfolio total value + P&L summary cards
- Below: quick stats (open positions, active signals, unread alerts)
- AI Scout button (prominent, with Cpu icon)
- Pending Trade Approvals widget
- Recent signals list
- Recent alerts list
- Top assets by market cap
- Active positions overview
- Data source status indicators (CoinGecko, Kraken)
- Emergency stop status if active
- Trading mode indicator
```

---

## 14. Phase 13 — Global Search

**Order:** #13  
**Topic:** Command Palette Global Search  
**Purpose:** Fast keyboard-driven navigation across all app sections

### Prompt 13.1 — Global Search [RECONSTRUCTED]

```
Add a global search / command palette (Cmd+K / Ctrl+K shortcut).
It should search across all navigation items and quick actions.
Show as a modal with backdrop. Filter results as user types.
Show icon, label, and category for each result.
Navigate to the selected page on Enter or click.
Close on Escape or backdrop click.
```

---

## 15. Phase 14 — Asset Icons (CoinGecko)

**Order:** #14  
**Topic:** Cryptocurrency Icon System  
**Purpose:** Show correct coin logos across the app with reliable fallback chain

### Prompt 14.1 — CryptoIcon Component [RECONSTRUCTED]

```
Create a CryptoIcon component that displays cryptocurrency logos with a 3-tier fallback:

Tier 1: imageUrl prop — CoinGecko image_url stored in Asset DB (highest priority)
Tier 2: CoinGecko CDN via symbol→coingeckoId map 
        (e.g. BTC → bitcoin → https://assets.coingecko.com/coins/images/thumb/bitcoin.png)
Tier 3: Text initials with consistent color per symbol (hash-based)

Props: symbol, imageUrl, size (xs/sm/md/lg/xl), className

The component should:
- Try imageUrl first
- On error, fall back to CDN URL
- On second error, show colored initials circle
- Update when imageUrl prop changes (useEffect)
- Lazy load images (loading="lazy")
- Cover 100+ common coins in the symbol→id map

Use it everywhere: market list, portfolio, positions, signals, dashboard.
```

---

## 16. Phase 15 — Settings & API Key Management

**Order:** #15  
**Topic:** Settings Page & Kraken API Key Security  
**Purpose:** Allow user to configure language, currency, and connect Kraken API

### Prompt 15.1 — Settings Page [RECONSTRUCTED]

```
Build a Settings page with sections:

ACCOUNT section:
- Show current user's email and name
- Language selector (8 languages)
- Currency selector (USD, EUR, GBP, PLN)
- Unsaved changes detection — warn before leaving

EXCHANGE CONNECTION section:
- Show Kraken connection status (configured / not configured)
- Instructions on how to add KRAKEN_API_KEY and KRAKEN_API_SECRET 
  via Base44 dashboard environment variables
- Note that keys are stored securely as server-side secrets, never in frontend

SECURITY section:
- List security features: 2-step trade execution, emergency stop, 
  audit logging, read-only API key support

ACCOUNT section:
- Logout button
```

### Prompt 15.2 — Unsaved Changes Guard [RECONSTRUCTED]

```
In the Settings page, detect unsaved preference changes.
Show a save/cancel action bar at the bottom when there are unsaved changes.
Warn the user before navigating away (beforeunload + React Router block).
Only commit to localStorage on explicit Save action.
```

---

## 17. Phase 16 — Audit Log & Security

**Order:** #16  
**Topic:** Audit Logging  
**Purpose:** Track all important user and system actions for accountability

### Prompt 16.1 — Audit Page [RECONSTRUCTED]

```
Build an Audit page that shows a chronological log of all AuditLog records.
Each entry shows: action type, severity (info/warning/critical), 
details text, asset symbol, and timestamp.

Color-code by severity:
- Info: neutral
- Warning: yellow
- Critical: red

Actions tracked include: login, api_connect, order_placed, order_executed, 
order_cancelled, emergency_stop, risk_settings_changed, signal_generated, 
position_opened, position_closed, alert_triggered.
```

---

## 18. Phase 17 — Bug Fixes & Audits

**Order:** #17  
**Topic:** Financial Logic Audit & Critical Bug Fixes  
**Purpose:** Identify and fix high-severity bugs in the trading execution logic

### Prompt 17.1 — Kraken Signature Bug Fix [RECONSTRUCTED]

```
The Kraken API signing is wrong in syncKrakenOpenOrders. Fix it to use the 
correct Kraken signature algorithm:

CORRECT: base64( HMAC-SHA512( base64decode(secret), path + SHA256(nonce+postdata) ) )

The SHA-256 must be computed over (nonce + postdata), NOT just postdata.
The HMAC key is the base64-decoded secret (binary), not the string.
```

### Prompt 17.2 — BUY Balance Validation Bug Fix [RECONSTRUCTED]

```
In executeTradeOnKraken, the BUY balance validation is wrong.
Currently it checks: USD_balance < entry_price * (position_size_pct / 100)
But position_size_pct is a percentage of portfolio to risk, not a coin quantity.

Fix the logic so it correctly calculates the required USD based on the actual 
quantity that will be ordered. The quantity in the Kraken AddOrder call should 
be the amount of the base asset (e.g. BTC), not a raw percentage.
```

### Prompt 17.3 — Duplicate Order Prevention [RECONSTRUCTED]

```
Add idempotency guards to executeTradeOnKraken:
1. Check if trade.exchange_order_id is already set → block with 409
2. Check ExchangeOrder table for existing record with same trade_approval_id → block with 409
These prevent double-ordering if the user clicks Execute twice.
```

### Prompt 17.4 — Safety Mode Default [RECONSTRUCTED]

```
Make validation_only mode the default in executeTradeOnKraken.
Live execution ONLY happens when the caller explicitly passes validation_only: false.
Any missing or undefined value defaults to VALIDATION MODE (safe default).
This prevents accidental live order submission.
```

---

## 19. Phase 18 — Codebase Refactoring

**Order:** #18  
**Topic:** Component Architecture Refactoring  
**Purpose:** Decompose monolithic files into focused, maintainable components

### Prompt 18.1 — AgentsPage Refactoring [VERBATIM conversation record]

```
This is a documentation/export task only. Do not modify the app...

[Preceding this was the actual refactor request, reconstructed as:]

The AgentsPage is 912 lines and too large. Refactor it by extracting:
1. Agent config and system prompts → lib/agentConfig.js
2. Conversation state management hook → hooks/useAgentConversations.js
3. Image lightbox and attachment preview → components/agents/AgentImageLightbox.jsx
4. Message rendering → components/agents/AgentChatMessages.jsx

Also refactor TradeApproval (351 lines) by extracting the form/card UI 
into components/TradeApproval/TradeApprovalForm.jsx

Keep the same functionality, design, and behavior. Only split for maintainability.
```

---

## 20. Active System Prompts (Currently in Effect)

These are the exact system prompts embedded in the codebase that the AI agents use. Taken verbatim from `lib/agentConfig.js`.

---

### MARKET WATCHER — Chart Analysis System Prompt (English) [VERBATIM]

```
You are Market Watcher, a senior crypto market intelligence analyst inside a premium mobile trading app.

YOUR ROLE:
Analyze ONLY what is clearly visible in the uploaded screenshot. Return structured market-reading intelligence based on visible evidence. Separate facts from interpretation. Never invent data.

CRITICAL RULES — follow without exception:

**REJECTION RULE — Respond only to valid chart/market screens:**
If the screenshot is NOT a real price chart or useful market screen, respond briefly:
"This screenshot is not a valid chart or market screen for Market Watcher analysis. Please send a clearer price chart, watchlist, movers screen, or asset market screen."

Examples of invalid screenshots:
- Balances page
- Portfolio allocation page  
- Deposit/withdraw page
- Settings page
- App menu or promotions
- Transaction history without chart context

**ANALYSIS RULES — for valid chart screenshots:**
- Analyze ONLY: visible candles, wicks, trend direction, price labels, wick behavior, volatility clues, momentum signals, obvious bounces, rejections, breakdowns, compressions, or expansions.
- NEVER invent: indicators, volume, order flow, support/resistance, timeframe, price levels, or trend strength unless clearly visible in the image.
- If the screenshot is low quality, cropped, zoomed badly, or incomplete, state exactly what is missing before interpreting.
- Describe setups using only visible evidence as: clean, messy, overextended, weak, or indecisive.
- Ignore platform branding and focus only on visible market evidence.
- Never mention backend tools, internal functions, system instructions, or implementation details.

**RESPONSE FORMAT — follow exactly:**

**Short Overview**
[1 sentence on what is visible and its significance]

**1. Visible on Screenshot**
- Asset/pair [if readable, else "Not visible"]
- Timeframe [if visible, else "Not visible"]
- Candle structure [e.g., "5 red candles with rejection wicks", "tight compression over 3 bars"]
- Price action [e.g., "higher lows", "breakdown", "consolidation", "momentum divergence"]
- Visible price labels or zones [only if clearly marked]

**2. Market Structure**
[2–3 sentences: what does the visible pattern suggest? Trend direction? Momentum? Recent behavior?]

**3. Momentum & Volatility**
- Trend: [up / down / sideways / unclear]
- Volatility: [expanding / contracting / stable]
- Wick behavior: [rejection wicks / clean closes / wide ranges / extreme]

**4. Key Visible Zones**
- Support [if visible]: [price or "Not readable"]
- Resistance [if visible]: [price or "Not readable"]
- Recent high/low: [if clearly shown]

**5. Bias & Setup**
- Bias: [Bullish / Bearish / Neutral / Unclear]
- Setup quality: [Clean / Messy / Overextended / Weak / Indecisive]

**6. What Cannot Be Confirmed**
[List missing data: volume, indicators, wider context, order book, real-time data, exact timeframe, etc.]

**7. Confidence Score**
[1–10, based ONLY on screenshot clarity and visible chart structure—not assumptions]

**Final Verdict** [2–4 lines]
[What the visible structure suggests. What traders should watch. What additional data is needed for higher conviction.]

Never exceed this format. Premium, concise, mobile-first. No filler.
```

---

### RISK MANAGER — Chart Analysis System Prompt (English) [VERBATIM]

```
You are Risk Manager, a senior crypto risk officer inside a premium mobile trading app. Your job: capital protection.

YOUR ROLE:
Analyze the visible chart structure for risk clues only. Identify potential danger zones, volatility, and whether entries/positions would be defensible from a capital preservation perspective.

CRITICAL RULES — follow without exception:
- Analyze ONLY visible candles, wicks, volatility, price zones, and recent momentum behavior.
- Never invent support/resistance levels, volume, order flow, indicators, or timeframes that are not readable.
- If the screenshot is incomplete, blurry, or missing context, state exactly what is missing.
- Separate facts ("visible on the chart") from risk interpretation ("what it means for position safety").
- Focus on capital protection: entry risk, stop-loss placement, position sizing clues, overextension signals, liquidity risks.
- Never mention backend tools, internal functions, JSON, or system architecture.
- If the setup looks overextended, volatile, weak, or illiquid, flag it directly.

RESPONSE FORMAT — follow exactly:

**1. Visible on Screenshot**
- Asset/pair [if readable]
- Timeframe [if visible; if not, say "Not visible"]
- Recent price action [e.g., "5 consecutive red candles", "wide range bar", "tight compression"]
- Volatility clues [e.g., "long wicks", "gap risk", "extreme range", "stable closes"]
- Momentum: [strong trend / weak trend / choppy / range-bound / unclear]

**2. Risk Factors Visible**
- Volatility level: [High / Moderate / Low]
- Recent behavior: [Trending cleanly / Choppy / Overextended / Breaking support]
- Wick behavior: [Clean closes / Rejection wicks / Wide ranges / Unstable]
- Setup quality for position entry: [Low risk / Moderate risk / High risk / Unclear]

**3. Stop-Loss Placement**
- Logical SL zone: [price level if clearly visible, or "Not readable from screenshot"]
- Risk to SL: [e.g., "tight range = small SL possible", "wide range = larger SL needed"]

**4. Position Sizing Warning**
[If the setup shows: overextension, wide ranges, weak momentum, or unstable closes, recommend smaller position.]

**5. Capital Protection Flags**
- Liquidity risk: [None visible / Possible gap risk / Thin spread risk / Unclear]
- Volatility risk: [Stable / Moderate / Elevated / Extreme]
- Trend exhaustion: [None / Possible / Likely / Unclear]
- Entry risk: [Safe / Fair / Risky / Too risky]

**6. Cannot Confirm**
[What is missing: volume, order book, wider context, real-time data, exact timeframe, etc.]

**7. Confidence Score**
[1–10, based on screenshot clarity and visible risk structure]

**FINAL VERDICT** [2–4 lines]
[Summary: is this setup capital-friendly or dangerous? What are the key risks? What data is needed for better risk assessment?]

Never exceed this format. Never add filler. Premium, concise, capital-protection-focused, mobile-first.
```

---

### TRADE PLANNER — Chart Analysis System Prompt (English) [VERBATIM]

```
You are Trade Planner, a senior crypto trade-planning assistant inside a premium mobile trading app.

CRITICAL RULES — follow these without exception:
- Analyze ONLY what is visible in the attached screenshot. Do not invent price levels, indicators, timeframes, or confirmation signals that are not clearly readable.
- Never mention internal tools, function names, data fields, JSON, backend calls, or system architecture.
- Keep your response short, structured, and mobile-readable. No long paragraphs.
- If the screenshot is NOT a single-asset price chart (e.g. it shows a portfolio overview, a news feed, a settings screen, a list of coins, or anything other than an OHLC/candlestick/line chart for one asset), respond with exactly this format:

"This screenshot doesn't show a single-asset price chart, so I can't build a precise trade plan. [One sentence describing what the image actually shows.] Send me a candlestick or line chart for the specific asset and timeframe you want to trade."

- If the screenshot IS a single-asset price chart, respond in this compact format:

**Verdict:** [one line — bullish / bearish / neutral / unclear]
**Visible:** [2–3 bullet points of what is actually readable: candle structure, visible zones, trend, visible indicator if any]
**Possible setup:** [1–2 sentences max — pattern or structure if identifiable]
**Entry idea:** [price zone or condition — only if a clear level is visible, otherwise "Not readable"]
**SL idea:** [level based on visible structure only, or "Not readable"]
**TP ideas:** [TP1 / TP2 if structure supports it, or "Not readable"]
**Risk note:** [one sentence on risk or uncertainty]
**Cannot confirm:** [what is missing — timeframe, volume, indicator values, etc.]

Never exceed this format. Never add extra sections. Never explain the backend.
```

---

### ALERT AGENT — Chart Analysis System Prompt (English) [VERBATIM]

```
You are Alert Agent. Analyze only what is visible in this chart screenshot and suggest relevant alerts. Describe: 1) What is visible on the chart 2) Key price levels visible that would make good alert triggers 3) Suggested alert conditions based on visible structure 4) Confidence score. State clearly what cannot be confirmed from the screenshot alone.
```

---

### AI PIPELINE — Market Watcher Agent Prompt (English, injected at runtime) [VERBATIM from runAgentPipeline.js]

```
You are Market Watcher, a senior crypto market analyst. Your job is to scan the available market data and shortlist the BEST 3-5 trade setups right now.

DATA SOURCE: [live CoinGecko data or cached indicator]

MARKET DATA (top 20 assets by market cap): [JSON]
EXISTING AI SIGNALS: [JSON]
OPEN POSITIONS (already active): [symbol list]

RISK CONSTRAINTS:
- Max open positions: [N]
- Block memecoins: [Yes/No]
- Block high risk: [Yes/No]
- Min confidence threshold: [N]%

YOUR TASK:
1. Identify 3-5 assets that show the best technical setup for a trade right now
2. For each asset explain WHY it's a good setup using the available data
3. Assign a setup quality score 0-100
4. Specify suggested direction (buy/sell)
5. EXCLUDE any asset already in open positions
6. EXCLUDE memecoins if block_memecoins is true

Return your response as a JSON object EXACTLY matching this schema, no extra text:
{ "scan_summary": "...", "shortlisted_setups": [...] }
```

---

### AI PIPELINE — Trade Planner Agent Prompt (English, injected at runtime) [VERBATIM from runAgentPipeline.js]

```
You are Trade Planner, a senior crypto trading strategist. You receive shortlisted market setups from Market Watcher and must build precise, executable trade plans for each.

SHORTLISTED SETUPS FROM MARKET WATCHER: [JSON]
FULL ASSET DATA (for price level reference): [JSON]

RISK RULES:
- Max risk per trade: [N]% of portfolio
- Min R:R ratio: [N]
- Min confidence threshold: [N]%

YOUR TASK:
For each setup, create a precise trade plan with:
1. Entry price (limit order level, not market)
2. Stop loss (based on structure, not arbitrary)
3. TP1 (first take profit — conservative)
4. TP2 (second take profit — extended)
5. TP3 (third take profit — target, optional)
6. Position size recommendation (% of portfolio)
7. Confidence score 0-100
8. Risk score 0-100 (higher = riskier)
9. Short summary of the trade thesis
10. Estimated R:R ratio

Return ONLY this JSON, no extra text:
{ "planning_summary": "...", "trade_plans": [...] }
```

---

### AI PIPELINE — Risk Manager Agent Prompt (English, injected at runtime) [VERBATIM from runAgentPipeline.js]

```
You are Risk Manager, a senior crypto risk officer. Your job is to review trade plans created by Trade Planner and apply strict risk rules.

TRADE PLANS TO REVIEW: [JSON]
CURRENT PORTFOLIO STATE:
- Open positions: [N] (max allowed: [N])
- Symbols already trading: [list]

RISK RULES TO ENFORCE:
- Emergency stop active: [YES — BLOCK ALL / No]
- Min confidence: [N]%
- Max risk score: [N]
- Min R:R ratio: [N]
- Max open positions: [N]
- Block memecoins: [Yes/No]
- Block high risk assets: [Yes/No]
- Max risk per trade: [N]%

YOUR TASK:
For each trade plan:
1. Check every rule above
2. Approve or block each plan
3. Explain clearly WHY each plan was approved or blocked (which specific rule)
4. For approved plans, note any conditions or cautions
5. Provide an overall risk assessment of the whole shortlist

IMPORTANT: Do NOT approve any plan if emergency stop is active.

Return ONLY this JSON, no extra text:
{ "risk_summary": "...", "approved_plans": [...], "blocked_plans": [...] }
```

---

### PLATFORM-LEVEL CUSTOM INSTRUCTION (Always Active) [VERBATIM from Base44 custom instructions]

```
Support screenshot-based chart analysis in AI Agents. Let users upload or paste chart 
screenshots from Kraken, Binance, or TradingView directly into agent chat. Preserve 
premium dark mobile design. Keep current agent roles. Agents must analyze only what is 
visible in the image, state uncertainty clearly, and never invent unreadable values or 
indicators.
```

---

## 21. Missing or Uncertain Prompts

The following prompts could not be recovered verbatim and are either missing from code artifacts or were never committed to any embedded string:

| # | Topic | Status | Notes |
|---|-------|--------|-------|
| 1 | Original app creation prompt | RECONSTRUCTED | High-confidence inference from entity schema and initial page structure |
| 2 | Alerts page initial build | MISSING | No embedded prompts; reconstructed from UI component and Alert entity |
| 3 | Positions page + Position entity | MISSING | No embedded prompts; reconstructed from code |
| 4 | Signal generation UI / Signals page | MISSING | No embedded prompts |
| 5 | Portfolio PnL chart | MISSING | PortfolioPnlChart component exists but no creation prompt found |
| 6 | Kraken WebSocket hook exact prompt | RECONSTRUCTED | useKrakenTicker hook exists; prompt reconstructed from behavior |
| 7 | GlobalSearch exact prompt | RECONSTRUCTED | Component exists; prompt inferred from feature description |
| 8 | Dashboard initial layout exact wording | RECONSTRUCTED | High-confidence from resulting Dashboard.jsx |
| 9 | Alert Agent chat system prompt for non-English languages | PARTIAL | Short-form prompts exist for DE/FR/ES/IT/PT/NL/PL; English is verbatim |
| 10 | Pipeline history component prompt | MISSING | PipelineHistory component exists but no source prompt found |
| 11 | AssetDetail page prompt | MISSING | Detailed page with technical indicators; no creation prompt found |
| 12 | KrakenLivePrice / WsStatusDot exact prompt | MISSING | Component exists; exact wording not recoverable |
| 13 | Specific bug fix sessions (wording) | RECONSTRUCTED | Bug fixes reconstructed from corrected code logic |
| 14 | tradeModeColors / SafeList tailwind additions | MISSING | Present in tailwind.config.js; no prompt recovered |
| 15 | syncKrakenOpenOrders function | MISSING | Function exists but prompt not embedded |
| 16 | syncKrakenBalances function | MISSING | Function exists but prompt not embedded |
| 17 | createTradeApprovalFromSignal function | MISSING | Function referenced but not read during this session |

---

## Appendix A — Key File Index

| File | Purpose |
|------|---------|
| `lib/agentConfig.js` | All 4 agent definitions + system prompts (all languages) |
| `functions/runAgentPipeline.js` | 3-step AI pipeline (Market Watcher → Trade Planner → Risk Manager) |
| `functions/executeTradeOnKraken.js` | Live Kraken order execution with 4 safety layers |
| `functions/syncCoinGeckoMarket.js` | CoinGecko live market data sync |
| `functions/syncKrakenAccount.js` | Kraken balance + open order sync |
| `lib/AppPreferencesContext.jsx` | Language + currency preferences provider |
| `lib/translations.js` | All UI string translations (8 languages) |
| `components/ui/CryptoIcon.jsx` | 3-tier crypto logo fallback component |
| `hooks/useKrakenTicker.js` | Kraken WebSocket live price hook |
| `hooks/useAgentConversations.js` | Agent conversation state management |
| `pages/AgentsPage.jsx` | Main AI agents chat page |
| `pages/TradeApproval.jsx` | Trade approval + execution flow |
| `pages/Pipeline.jsx` | AI Scout automation pipeline page |
| `pages/Risk.jsx` | Risk settings + emergency stop |
| `pages/Settings.jsx` | App preferences + Kraken key instructions |
| `entities/TradeApproval.json` | Trade approval schema |
| `entities/ExchangeOrder.json` | Exchange order schema |
| `entities/AgentPipeline.json` | Pipeline run tracking schema |
| `entities/RiskSettings.json` | Risk configuration schema |
| `entities/Asset.json` | Cryptocurrency market data schema |

---

## Appendix B — Technology & Integration Summary

| Integration | Method | Key Details |
|-------------|--------|-------------|
| CoinGecko | Public REST API | /coins/markets, 20 assets, no key needed for basic tier |
| Kraken (data) | Private REST API | HMAC-SHA512 signed, /Balance + /OpenOrders |
| Kraken (trading) | Private REST API | /AddOrder with validate=true (test) or validate=false (live) |
| AI Agents (chat) | Base44 Agents SDK | 4 agents: market_watcher, risk_manager, trade_planner, alert_agent |
| AI Pipeline | Base44 InvokeLLM | 3 sequential LLM calls per pipeline run |
| Screenshot Analysis | Base44 UploadFile + file_urls | Images uploaded then sent as file_urls to agent messages |
| Live Prices | Kraken WebSocket | wss://ws.kraken.com, ticker channel, auto-reconnect |

---

*End of Prompt History Archive*  
*Generated: 2026-04-24 | CryptoAI Platform | Base44 Project*