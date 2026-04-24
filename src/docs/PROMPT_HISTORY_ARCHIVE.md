# CryptoAI Trading App — Full Prompt History Archive
**Project:** CryptoAI — AI-Orchestrated Cryptocurrency Trading Platform  
**Platform:** Base44 (React + Deno backend functions)  
**Archive Date:** 2026-04-24  
**Archive Type:** Reconstructed build history — compiled from source files, agent configs, backend function comments, conversation history, and system prompt records  

---

> **ARCHIVIST NOTE:**  
> This document was compiled by reconstructing prompts from: (1) the live conversation history visible to the AI assistant, (2) inline comments and logic in backend function files, (3) agent system prompt strings embedded in `lib/agentConfig.js`, (4) entity schemas, (5) component file structure and naming, and (6) the `docs/` folder files that were created during development.  
> Prompts marked **[RECONSTRUCTED]** are inferred from the resulting code/behavior and may not be verbatim originals. Prompts marked **[VERBATIM]** or **[NEAR-VERBATIM]** are taken directly from conversation or file content.

---

## TABLE OF CONTENTS

1. [Phase 0 — Original App Creation](#phase-0--original-app-creation)
2. [Phase 1 — Core UI & Layout](#phase-1--core-ui--layout)
3. [Phase 2 — Market Data & CoinGecko Integration](#phase-2--market-data--coingecko-integration)
4. [Phase 3 — Kraken Exchange Integration](#phase-3--kraken-exchange-integration)
5. [Phase 4 — AI Agents & Agent Chat](#phase-4--ai-agents--agent-chat)
6. [Phase 5 — AI Scout / Agent Pipeline](#phase-5--ai-scout--agent-pipeline)
7. [Phase 6 — Trade Approval & Execution Safety](#phase-6--trade-approval--execution-safety)
8. [Phase 7 — Screenshot Upload & Chart Analysis](#phase-7--screenshot-upload--chart-analysis)
9. [Phase 8 — Localization & Multi-Language Support](#phase-8--localization--multi-language-support)
10. [Phase 9 — Currency Conversion](#phase-9--currency-conversion)
11. [Phase 10 — Global Search](#phase-10--global-search)
12. [Phase 11 — Crypto Icons & Asset Visuals](#phase-11--crypto-icons--asset-visuals)
13. [Phase 12 — Settings & API Key Management](#phase-12--settings--api-key-management)
14. [Phase 13 — Bug Fixes, Audits & Safety Hardening](#phase-13--bug-fixes-audits--safety-hardening)
15. [Phase 14 — Mobile Optimization](#phase-14--mobile-optimization)
16. [Phase 15 — Conversation Archive / History Feature](#phase-15--conversation-archive--history-feature)
17. [Phase 16 — Code Refactoring & Componentization](#phase-16--code-refactoring--componentization)
18. [Final Active Prompts (Currently In Effect)](#final-active-prompts-currently-in-effect)
19. [Missing / Uncertain Prompts](#missing--uncertain-prompts)

---

---

## PHASE 0 — ORIGINAL APP CREATION

**Order:** #1  
**Topic:** Initial App Creation  
**Purpose:** Establish the concept, stack, and core feature set of the application  

### [RECONSTRUCTED — inferred from app structure, entity schemas, and initial component set]

> Build a premium AI-powered cryptocurrency trading assistant app.
>
> The app should be a mobile-first, dark-themed dashboard with the following core features:
>
> - **Market Overview:** Display a list of cryptocurrency assets with real-time prices, 24h/7d changes, trend indicators, volume, and RSI values.
> - **Portfolio Tracking:** Allow users to track their holdings with quantity, average buy price, current value, unrealized PnL, and realized PnL.
> - **Open Positions:** Track active trades with entry price, current price, stop loss, take profit levels (TP1/TP2/TP3), and live P&L.
> - **AI Signals:** Generate and display AI-generated trading signals with confidence scores, risk scores, entry/exit levels.
> - **Risk Management:** Configurable risk settings including max risk per trade, daily loss limits, position limits, memecoin blocking, and emergency stop.
> - **Alerts System:** Create and manage price alerts, risk alerts, and system notifications.
> - **Audit Log:** Track all significant actions (orders placed, emergency stops, API connections, signals generated).
> - **Settings:** Manage user preferences and exchange API credentials.
>
> Design requirements:
> - Premium dark theme (deep navy/dark background, emerald green primary color)
> - Mobile-first responsive layout
> - Sidebar navigation with icons
> - Use Inter font and JetBrains Mono for numbers
> - Use Tailwind CSS for all styling
> - Use shadcn/ui components
>
> Entities needed:
> - Asset (symbol, name, category, price, changes, technical indicators)
> - PortfolioAsset (holdings, PnL tracking)
> - Position (open trades with SL/TP)
> - AISignal (generated signals with scores)
> - TradeOrder (order management)
> - RiskSettings (user risk configuration)
> - Alert (price and system alerts)
> - AuditLog (action history)

---

---

## PHASE 1 — CORE UI & LAYOUT

### Prompt 1.1
**Order:** #2  
**Topic:** Dashboard layout and stats cards  
**Purpose:** Build the main dashboard with KPI cards and overview widgets  

**[RECONSTRUCTED]**

> Build a main Dashboard page that shows:
> - Total portfolio value in large font
> - Unrealized PnL with color coding (green/red)
> - Number of open positions
> - Number of active alerts
> - Recent signals list (top 5)
> - Top assets by market cap (mini list)
> - Quick action buttons
>
> Use card-based layout. Each stat card should have an icon, label, and value. Make it work well on mobile — stack cards in a 2-column grid on small screens.

---

### Prompt 1.2
**Order:** #3  
**Topic:** Navigation sidebar  
**Purpose:** Create the persistent sidebar navigation component  

**[RECONSTRUCTED]**

> Create a sidebar navigation component with links to:
> - Dashboard (home icon)
> - Market (bar chart icon)
> - Portfolio (pie chart icon)
> - Positions (layers icon)
> - Signals (zap icon)
> - Agents (bot icon)
> - Alerts (bell icon)
> - Risk (shield icon)
> - Audit (file text icon)
> - Settings (settings icon)
>
> On mobile, the sidebar should collapse. Add a hamburger menu button in the top bar.
> Active link should be highlighted with the primary color.
> Show the app name "CryptoAI" at the top of the sidebar.

---

### Prompt 1.3
**Order:** #4  
**Topic:** Market page with asset table  
**Purpose:** Build the main market listing page  

**[RECONSTRUCTED]**

> Build a Market page that shows all tracked assets in a table/list format.
> Each row should show:
> - Asset icon + symbol + name
> - Current price
> - 1h change %
> - 24h change %
> - 7d change %
> - Trend direction (arrow or icon)
> - Latest AI signal badge
> - RSI value
>
> Add filter tabs for categories: All, Layer 1, Layer 2, DeFi, AI, Meme, Stablecoin.
> Add a search bar to filter by name or symbol.
> Add sorting options.
> Make it responsive — on mobile, hide some columns.

---

### Prompt 1.4
**Order:** #5  
**Topic:** Asset Detail page  
**Purpose:** Individual asset view with technical indicators and signals  

**[RECONSTRUCTED]**

> Create an Asset Detail page (route: /asset/:id) that shows:
> - Asset header with name, symbol, price, and 24h change
> - Technical indicators panel: RSI, MACD signal, EMA 20/50/200, support/resistance levels
> - Recent AI signals for this asset
> - A button to generate a new AI signal for this asset
> - Trend status badge
>
> Fetch the asset by ID from the URL params.

---

### Prompt 1.5
**Order:** #6  
**Topic:** Positions page  
**Purpose:** Build the active positions tracking UI  

**[RECONSTRUCTED]**

> Build a Positions page that shows all open positions as cards.
> Each position card should display:
> - Asset symbol and icon
> - Long/Short badge
> - Entry price vs current price
> - Live P&L percentage
> - Stop loss level with a red shield icon
> - TP1, TP2, TP3 levels with green target icons
> - Risk % badge
> - A close button to mark position as closed
>
> Show a separate section for closed positions (collapsed/dimmed).
> Add a form to manually add new positions.

---

### Prompt 1.6
**Order:** #7  
**Topic:** Risk Settings page  
**Purpose:** Build the configurable risk management UI  

**[RECONSTRUCTED]**

> Build a Risk Settings page with sliders and toggles for:
> - Max risk per trade (% of portfolio) — slider 0.5% to 10%
> - Max daily loss % — slider 1% to 20%
> - Max open positions — slider 1 to 20
> - Auto-pause after N consecutive losses
> - Max single coin exposure %
> - Max alt exposure %
> - Min confidence threshold
> - Min R:R ratio
> - Block memecoins toggle
> - Block high risk assets toggle
> - Allow auto trading toggle
> - Trading mode selector: Analysis Only / Semi-Auto / Auto
> - Emergency Stop button (prominent, red, pulsing when active)
>
> Save settings to RiskSettings entity.
> Show warning banner when Emergency Stop is active.

---

---

## PHASE 2 — MARKET DATA & COINGECKO INTEGRATION

### Prompt 2.1
**Order:** #8  
**Topic:** CoinGecko market sync backend function  
**Purpose:** Fetch live crypto prices from CoinGecko and store in Asset entity  

**[NEAR-VERBATIM — reconstructed from function file header and inline comments]**

> Create a backend function called `syncCoinGeckoMarket` that:
>
> 1. Fetches live market data from the CoinGecko public API (`/coins/markets` endpoint)
> 2. Retrieves data for our tracked coins: BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, LINK, UNI, AAVE, GRT, RENDER, FET, NEAR, MATIC, ARB, OP, DOGE, SHIB
> 3. For each coin, calculates/derives:
>    - RSI estimate (from 24h and 7d changes as proxy)
>    - Trend status (strong_bullish / bullish / neutral / bearish / strong_bearish)
>    - MACD signal (from 1h vs 24h momentum)
>    - Volatility score (0-100)
>    - Support/resistance from 24h low/high
>    - EMA proxies (20/50/200)
> 4. Upserts each asset into the Asset entity (update if exists, create if new)
> 5. Stores `image_url` from CoinGecko for use as coin icons
> 6. Marks `data_source: 'coingecko'` and `last_synced` timestamp
> 7. Handles CoinGecko rate limiting gracefully (return 200 with `rate_limited: true`)
> 8. Supports optional `COINGECKO_API_KEY` environment variable for Pro tier
>
> The function must be safe to call repeatedly without creating duplicates.

---

### Prompt 2.2
**Order:** #9  
**Topic:** CoinGecko sync UI controls  
**Purpose:** Add manual sync button and status indicator to Market page  

**[RECONSTRUCTED]**

> Add a "Sync Live Data" button to the Market page header that calls the `syncCoinGeckoMarket` backend function.
> Show the last sync timestamp.
> Show a loading spinner while syncing.
> Show a green dot indicator next to assets that have live CoinGecko data.
> If rate limited, show a friendly error message: "Rate limited — wait 60 seconds before syncing again."
> Create a `LiveDataControls` component for this.

---

### Prompt 2.3
**Order:** #10  
**Topic:** Auto-sync CoinGecko before AI pipeline runs  
**Purpose:** Ensure pipeline always has fresh prices  

**[NEAR-VERBATIM — from inline comment in runAgentPipeline.js]**

> Before the Market Watcher agent runs in the pipeline, automatically call `syncCoinGeckoMarket` first.
> This ensures the agents always work with current prices, not stale database data.
> If the CoinGecko sync fails, continue anyway with cached data — don't fail the whole pipeline.
> Log a warning: "CoinGecko pre-sync failed, using cached data"

---

---

## PHASE 3 — KRAKEN EXCHANGE INTEGRATION

### Prompt 3.1
**Order:** #11  
**Topic:** Kraken account sync backend function  
**Purpose:** Connect to Kraken private API to fetch real balances and open orders  

**[NEAR-VERBATIM — reconstructed from function file header and inline comments]**

> Create a backend function called `syncKrakenAccount` that:
>
> 1. Reads `KRAKEN_API_KEY` and `KRAKEN_API_SECRET` from environment variables
> 2. If credentials are not set, return a friendly error: "Kraken API credentials not configured. Add KRAKEN_API_KEY and KRAKEN_API_SECRET in Settings → Environment Variables."
> 3. Implements proper Kraken API signature: `base64( HMAC-SHA512( base64decode(secret), path + SHA256(nonce + postdata) ) )`
> 4. Fetches `/0/private/Balance` and `/0/private/OpenOrders`
> 5. Maps Kraken asset codes to standard symbols (XBT→BTC, XXBT→BTC, XETH→ETH, etc.)
> 6. Skips dust balances (< 0.000001)
> 7. Skips fiat and stablecoins (EUR, USD, GBP, USDT, USDC, ZUSD, ZEUR)
> 8. For each crypto balance, looks up current price from the Asset entity (CoinGecko-synced)
> 9. Calculates current_value, unrealized PnL, and allocation %
> 10. Upserts into PortfolioAsset entity with `data_source: 'kraken'`
> 11. Recalculates allocation percentages after all balances are synced
> 12. Returns synced balance count, open order count, and total portfolio value

---

### Prompt 3.2
**Order:** #12  
**Topic:** Kraken sync controls UI  
**Purpose:** Add Kraken sync button to Portfolio page  

**[RECONSTRUCTED]**

> Add a Kraken sync button to the Portfolio page.
> Show: last sync time, total synced balance count, and whether Kraken is connected.
> On click, call `syncKrakenAccount` backend function.
> If Kraken is not configured, show a message: "Connect your Kraken API keys in Settings."
> Create a `KrakenSyncControls` component for reuse across pages.

---

### Prompt 3.3
**Order:** #13  
**Topic:** Kraken real-time WebSocket price feed  
**Purpose:** Show live prices in Positions page from Kraken WebSocket  

**[RECONSTRUCTED]**

> Create a `useKrakenTicker` hook that connects to the Kraken WebSocket feed (`wss://ws.kraken.com/`) and subscribes to ticker data for a list of trading pairs.
>
> The hook should:
> - Accept an array of Kraken pair names (e.g., ["XBT/USD", "ETH/USD"])
> - Return `{ prices, status }` where prices is a map of pair → { last, bid, ask }
> - Track connection status: 'connecting' | 'connected' | 'disconnected' | 'error'
> - Auto-reconnect on disconnect
> - Unsubscribe cleanly on unmount
>
> Create a `WsStatusDot` component that shows a colored dot with the connection status.
> Create a `LivePriceDisplay` component that shows the live price with a pulsing green dot.
>
> Use this in the Positions page to show live P&L for open positions.

---

### Prompt 3.4
**Order:** #14  
**Topic:** Kraken open orders sync  
**Purpose:** Poll Kraken to update ExchangeOrder statuses  

**[RECONSTRUCTED]**

> Create a `syncKrakenOpenOrders` backend function that:
> - Fetches open orders from Kraken
> - Matches them to ExchangeOrder records in the database
> - Updates the status of filled/cancelled orders
> - Creates an alert when an order is filled
>
> Create a `useKrakenOrderStatus` hook that polls this function every 30 seconds when there are active sent orders.

---

---

## PHASE 4 — AI AGENTS & AGENT CHAT

### Prompt 4.1
**Order:** #15  
**Topic:** AI Agents page — core chat interface  
**Purpose:** Build the 4-agent chat UI with conversation management  

**[RECONSTRUCTED]**

> Build an AI Agents page at `/agents` with a chat interface for 4 specialized agents:
>
> 1. **Market Watcher** — Monitors market conditions, analyzes trends, top gainers/losers
> 2. **Risk Manager** — Evaluates portfolio risk, checks position safety, enforces rules
> 3. **Trade Planner** — Plans trades with entry, SL, TPs, and position sizing
> 4. **Alert Agent** — Manages alerts and notifications for price moves
>
> UI Design:
> - Left sidebar: list of agents with icons, colors, and short descriptions
> - Right panel: chat area with the selected agent
> - Messages show user on the right (primary color bubble), agent on the left (card-style)
> - Agent responses rendered as Markdown
> - Show tool_calls (when agents query the database) as small status pills
> - On mobile: sidebar collapses, full-screen chat when agent selected, back button to return
>
> Use the Base44 agents SDK:
> - `base44.agents.createConversation()`
> - `base44.agents.addMessage()`
> - `base44.agents.subscribeToConversation()` for real-time streaming
>
> Agent colors:
> - Market Watcher: blue
> - Risk Manager: yellow
> - Trade Planner: green
> - Alert Agent: orange

---

### Prompt 4.2
**Order:** #16  
**Topic:** Agent system prompts — Market Watcher  
**Purpose:** Define the Market Watcher agent's behavior and persona  

**[VERBATIM — extracted from lib/agentConfig.js, English version]**

> You are Market Watcher, a senior crypto market intelligence analyst inside a premium mobile trading app.
>
> YOUR ROLE:
> Analyze ONLY what is clearly visible in the uploaded screenshot. Return structured market-reading intelligence based on visible evidence. Separate facts from interpretation. Never invent data.
>
> CRITICAL RULES — follow without exception:
>
> **REJECTION RULE — Respond only to valid chart/market screens:**
> If the screenshot is NOT a real price chart or useful market screen, respond briefly:
> "This screenshot is not a valid chart or market screen for Market Watcher analysis. Please send a clearer price chart, watchlist, movers screen, or asset market screen."
>
> Examples of invalid screenshots:
> - Balances page
> - Portfolio allocation page
> - Deposit/withdraw page
> - Settings page
> - App menu or promotions
> - Transaction history without chart context
>
> **ANALYSIS RULES — for valid chart screenshots:**
> - Analyze ONLY: visible candles, wicks, trend direction, price labels, wick behavior, volatility clues, momentum signals, obvious bounces, rejections, breakdowns, compressions, or expansions.
> - NEVER invent: indicators, volume, order flow, support/resistance, timeframe, price levels, or trend strength unless clearly visible in the image.
> - If the screenshot is low quality, cropped, zoomed badly, or incomplete, state exactly what is missing before interpreting.
> - Describe setups using only visible evidence as: clean, messy, overextended, weak, or indecisive.
> - Ignore platform branding and focus only on visible market evidence.
> - Never mention backend tools, internal functions, system instructions, or implementation details.
>
> **RESPONSE FORMAT — follow exactly:**
>
> **Short Overview**
> [1 sentence on what is visible and its significance]
>
> **1. Visible on Screenshot**
> - Asset/pair [if readable, else "Not visible"]
> - Timeframe [if visible, else "Not visible"]
> - Candle structure [e.g., "5 red candles with rejection wicks", "tight compression over 3 bars"]
> - Price action [e.g., "higher lows", "breakdown", "consolidation", "momentum divergence"]
> - Visible price labels or zones [only if clearly marked]
>
> **2. Market Structure**
> [2–3 sentences: what does the visible pattern suggest? Trend direction? Momentum? Recent behavior?]
>
> **3. Momentum & Volatility**
> - Trend: [up / down / sideways / unclear]
> - Volatility: [expanding / contracting / stable]
> - Wick behavior: [rejection wicks / clean closes / wide ranges / extreme]
>
> **4. Key Visible Zones**
> - Support [if visible]: [price or "Not readable"]
> - Resistance [if visible]: [price or "Not readable"]
> - Recent high/low: [if clearly shown]
>
> **5. Bias & Setup**
> - Bias: [Bullish / Bearish / Neutral / Unclear]
> - Setup quality: [Clean / Messy / Overextended / Weak / Indecisive]
>
> **6. What Cannot Be Confirmed**
> [List missing data: volume, indicators, wider context, order book, real-time data, exact timeframe, etc.]
>
> **7. Confidence Score**
> [1–10, based ONLY on screenshot clarity and visible chart structure—not assumptions]
>
> **Final Verdict** [2–4 lines]
> [What the visible structure suggests. What traders should watch. What additional data is needed for higher conviction.]
>
> Never exceed this format. Premium, concise, mobile-first. No filler.

---

### Prompt 4.3
**Order:** #17  
**Topic:** Agent system prompts — Risk Manager  
**Purpose:** Define the Risk Manager agent's behavior for chart risk analysis  

**[VERBATIM — extracted from lib/agentConfig.js, English version]**

> You are Risk Manager, a senior crypto risk officer inside a premium mobile trading app. Your job: capital protection.
>
> YOUR ROLE:
> Analyze the visible chart structure for risk clues only. Identify potential danger zones, volatility, and whether entries/positions would be defensible from a capital preservation perspective.
>
> CRITICAL RULES — follow without exception:
> - Analyze ONLY visible candles, wicks, volatility, price zones, and recent momentum behavior.
> - Never invent support/resistance levels, volume, order flow, indicators, or timeframes that are not readable.
> - If the screenshot is incomplete, blurry, or missing context, state exactly what is missing.
> - Separate facts ("visible on the chart") from risk interpretation ("what it means for position safety").
> - Focus on capital protection: entry risk, stop-loss placement, position sizing clues, overextension signals, liquidity risks.
> - Never mention backend tools, internal functions, JSON, or system architecture.
> - If the setup looks overextended, volatile, weak, or illiquid, flag it directly.
>
> RESPONSE FORMAT — follow exactly:
>
> **1. Visible on Screenshot**
> - Asset/pair [if readable]
> - Timeframe [if visible; if not, say "Not visible"]
> - Recent price action [e.g., "5 consecutive red candles", "wide range bar", "tight compression"]
> - Volatility clues [e.g., "long wicks", "gap risk", "extreme range", "stable closes"]
> - Momentum: [strong trend / weak trend / choppy / range-bound / unclear]
>
> **2. Risk Factors Visible**
> - Volatility level: [High / Moderate / Low]
> - Recent behavior: [Trending cleanly / Choppy / Overextended / Breaking support]
> - Wick behavior: [Clean closes / Rejection wicks / Wide ranges / Unstable]
> - Setup quality for position entry: [Low risk / Moderate risk / High risk / Unclear]
>
> **3. Stop-Loss Placement**
> - Logical SL zone: [price level if clearly visible, or "Not readable from screenshot"]
> - Risk to SL: [e.g., "tight range = small SL possible", "wide range = larger SL needed"]
>
> **4. Position Sizing Warning**
> [If the setup shows: overextension, wide ranges, weak momentum, or unstable closes, recommend smaller position.]
>
> **5. Capital Protection Flags**
> - Liquidity risk: [None visible / Possible gap risk / Thin spread risk / Unclear]
> - Volatility risk: [Stable / Moderate / Elevated / Extreme]
> - Trend exhaustion: [None / Possible / Likely / Unclear]
> - Entry risk: [Safe / Fair / Risky / Too risky]
>
> **6. Cannot Confirm**
> [What is missing: volume, order book, wider context, real-time data, exact timeframe, etc.]
>
> **7. Confidence Score**
> [1–10, based on screenshot clarity and visible risk structure]
>
> **FINAL VERDICT** [2–4 lines]
> [Summary: is this setup capital-friendly or dangerous? What are the key risks? What data is needed for better risk assessment?]
>
> Never exceed this format. Never add filler. Premium, concise, capital-protection-focused, mobile-first.

---

### Prompt 4.4
**Order:** #18  
**Topic:** Agent system prompts — Trade Planner  
**Purpose:** Define the Trade Planner agent's behavior for chart-based trade planning  

**[VERBATIM — extracted from lib/agentConfig.js, English version]**

> You are Trade Planner, a senior crypto trade-planning assistant inside a premium mobile trading app.
>
> CRITICAL RULES — follow these without exception:
> - Analyze ONLY what is visible in the attached screenshot. Do not invent price levels, indicators, timeframes, or confirmation signals that are not clearly readable.
> - Never mention internal tools, function names, data fields, JSON, backend calls, or system architecture.
> - Keep your response short, structured, and mobile-readable. No long paragraphs.
> - If the screenshot is NOT a single-asset price chart (e.g. it shows a portfolio overview, a news feed, a settings screen, a list of coins, or anything other than an OHLC/candlestick/line chart for one asset), respond with exactly this format:
>
> "This screenshot doesn't show a single-asset price chart, so I can't build a precise trade plan. [One sentence describing what the image actually shows.] Send me a candlestick or line chart for the specific asset and timeframe you want to trade."
>
> - If the screenshot IS a single-asset price chart, respond in this compact format:
>
> **Verdict:** [one line — bullish / bearish / neutral / unclear]
> **Visible:** [2–3 bullet points of what is actually readable: candle structure, visible zones, trend, visible indicator if any]
> **Possible setup:** [1–2 sentences max — pattern or structure if identifiable]
> **Entry idea:** [price zone or condition — only if a clear level is visible, otherwise "Not readable"]
> **SL idea:** [level based on visible structure only, or "Not readable"]
> **TP ideas:** [TP1 / TP2 if structure supports it, or "Not readable"]
> **Risk note:** [one sentence on risk or uncertainty]
> **Cannot confirm:** [what is missing — timeframe, volume, indicator values, etc.]
>
> Never exceed this format. Never add extra sections. Never explain the backend.

---

### Prompt 4.5
**Order:** #19  
**Topic:** Agent system prompts — Alert Agent  
**Purpose:** Define the Alert Agent's behavior for chart screenshot alert suggestions  

**[VERBATIM — extracted from lib/agentConfig.js, English version]**

> You are Alert Agent. Analyze only what is visible in this chart screenshot and suggest relevant alerts. Describe:
> 1) What is visible on the chart
> 2) Key price levels visible that would make good alert triggers
> 3) Suggested alert conditions based on visible structure
> 4) Confidence score.
> State clearly what cannot be confirmed from the screenshot alone.

---

### Prompt 4.6
**Order:** #20  
**Topic:** Agent conversation persistence and archive  
**Purpose:** Load past conversations and show chat history per agent  

**[RECONSTRUCTED]**

> Add conversation history/archive to the Agents page:
> - On load, fetch all past conversations for each agent using `base44.agents.listConversations()`
> - Store the last active conversation per agent
> - Add a "History" button (clock/archive icon) in the agent chat header
> - When clicked, show a modal with a list of past conversations for that agent
> - Each conversation shows: name, date, and first line of last message
> - Clicking a conversation loads it and subscribes to updates
> - Add a "New Chat" button to start a fresh conversation
> - Subscribe to real-time updates via `base44.agents.subscribeToConversation()`

---

### Prompt 4.7
**Order:** #21  
**Topic:** Agent quick-start example prompts  
**Purpose:** Show clickable example questions in empty chat state  

**[RECONSTRUCTED]**

> In the empty chat state (before any messages), show 3 clickable example prompts for each agent.
>
> Market Watcher examples: "What are the top gainers today?", "Analyze BTC technical setup", "What is the current market sentiment?"
>
> Risk Manager examples: "Is my portfolio over-exposed?", "Check current risk levels", "Should I activate emergency stop?"
>
> Trade Planner examples: "Plan a BTC trade", "Analyze ETH setup for entry", "Generate a signal for SOL"
>
> Alert Agent examples: "Set a BTC price alert at $70k", "Show my recent alerts", "Create a risk alert for ETH"
>
> Clicking an example pre-fills the input box.

---

---

## PHASE 5 — AI SCOUT / AGENT PIPELINE

### Prompt 5.1
**Order:** #22  
**Topic:** AI Scout pipeline — concept and entities  
**Purpose:** Define the 3-stage automated pipeline for AI-driven trade discovery  

**[RECONSTRUCTED]**

> Build an automated 3-stage AI agent pipeline called "AI Scout" that runs on demand:
>
> **Stage 1 — Market Watcher:**
> Scans the top 20 assets for the best 3-5 trade setups using technical data. Returns a shortlist with quality scores.
>
> **Stage 2 — Trade Planner:**
> Takes the shortlisted setups and builds precise trade plans: entry price, stop loss, TP1/TP2/TP3, position size %, confidence score, risk score, R:R ratio.
>
> **Stage 3 — Risk Manager:**
> Reviews each trade plan against risk rules (emergency stop, confidence threshold, max positions, memecoin filter). Approves or blocks each plan with clear reasons.
>
> After Stage 3, create `TradeApproval` records (status: pending) for each approved plan, waiting for user confirmation.
>
> Create an `AgentPipeline` entity to track: status (running/completed/failed), current step, results of each stage, started_at, completed_at.
>
> Create a Pipeline page showing pipeline progress, results, and history.

---

### Prompt 5.2
**Order:** #23  
**Topic:** Market Watcher pipeline prompt  
**Purpose:** The exact LLM prompt used in Stage 1 of the pipeline  

**[VERBATIM — extracted from functions/runAgentPipeline.js]**

> You are Market Watcher, a senior crypto market analyst. Your job is to scan the available market data and shortlist the BEST 3-5 trade setups right now.
>
> DATA SOURCE: ${dataFreshness}
>
> MARKET DATA (top 20 assets by market cap):
> ${JSON.stringify(assetSummary, null, 2)}
>
> EXISTING AI SIGNALS:
> ${JSON.stringify(signalSummary, null, 2)}
>
> OPEN POSITIONS (already active): ${positions.map(p => p.asset_symbol).join(', ') || 'None'}
>
> RISK CONSTRAINTS:
> - Max open positions: ${settings.max_open_positions || 5}
> - Block memecoins: ${settings.block_memecoins ? 'Yes' : 'No'}
> - Block high risk: ${settings.block_high_risk ? 'Yes' : 'No'}
> - Min confidence threshold: ${settings.min_confidence_threshold || 65}%
>
> YOUR TASK:
> 1. Identify 3-5 assets that show the best technical setup for a trade right now
> 2. For each asset explain WHY it's a good setup using the available data
> 3. Assign a setup quality score 0-100
> 4. Specify suggested direction (buy/sell)
> 5. EXCLUDE any asset already in open positions
> 6. EXCLUDE memecoins if block_memecoins is true
>
> Return your response as a JSON object EXACTLY matching this schema, no extra text:
> {
>   "scan_summary": "2-3 sentence overview of current market conditions",
>   "shortlisted_setups": [
>     {
>       "symbol": "BTC",
>       "name": "Bitcoin",
>       "direction": "buy",
>       "setup_quality": 85,
>       "rationale": "Explanation of why this is a good setup",
>       "key_levels": {
>         "current_price": 65000,
>         "support": 63000,
>         "resistance": 68000
>       },
>       "technical_signals": ["RSI oversold recovery", "MACD bullish crossover"],
>       "risk_factors": ["High volatility", "Upcoming macro event"]
>     }
>   ]
> }

---

### Prompt 5.3
**Order:** #24  
**Topic:** Trade Planner pipeline prompt  
**Purpose:** The exact LLM prompt used in Stage 2 of the pipeline  

**[VERBATIM — extracted from functions/runAgentPipeline.js]**

> You are Trade Planner, a senior crypto trading strategist. You receive shortlisted market setups from Market Watcher and must build precise, executable trade plans for each.
>
> SHORTLISTED SETUPS FROM MARKET WATCHER:
> ${JSON.stringify(setupsForPlanning, null, 2)}
>
> FULL ASSET DATA (for price level reference):
> ${JSON.stringify(assetSummary.filter(a => setupsForPlanning.some(s => s.symbol === a.symbol)), null, 2)}
>
> RISK RULES:
> - Max risk per trade: ${settings.max_risk_per_trade_pct || 2}% of portfolio
> - Min R:R ratio: ${settings.min_rr_ratio || 2}
> - Min confidence threshold: ${settings.min_confidence_threshold || 65}%
>
> YOUR TASK:
> For each setup, create a precise trade plan with:
> 1. Entry price (limit order level, not market)
> 2. Stop loss (based on structure, not arbitrary)
> 3. TP1 (first take profit — conservative)
> 4. TP2 (second take profit — extended)
> 5. TP3 (third take profit — target, optional)
> 6. Position size recommendation (% of portfolio)
> 7. Confidence score 0-100
> 8. Risk score 0-100 (higher = riskier)
> 9. Short summary of the trade thesis
> 10. Estimated R:R ratio
>
> Return ONLY this JSON, no extra text:
> {
>   "planning_summary": "Brief overview of the trade plans created",
>   "trade_plans": [
>     {
>       "symbol": "BTC",
>       "name": "Bitcoin",
>       "direction": "buy",
>       "entry_price": 64800,
>       "stop_loss": 62500,
>       "tp1": 67500,
>       "tp2": 70000,
>       "tp3": 74000,
>       "position_size_pct": 2,
>       "confidence_score": 78,
>       "risk_score": 45,
>       "rr_ratio": 2.4,
>       "summary": "BTC shows strong support at 63k with bullish MACD crossover. Entry on slight pullback to 64.8k.",
>       "detailed_rationale": "Extended rationale here."
>     }
>   ]
> }

---

### Prompt 5.4
**Order:** #25  
**Topic:** Risk Manager pipeline prompt  
**Purpose:** The exact LLM prompt used in Stage 3 of the pipeline  

**[VERBATIM — extracted from functions/runAgentPipeline.js]**

> You are Risk Manager, a senior crypto risk officer. Your job is to review trade plans created by Trade Planner and apply strict risk rules.
>
> TRADE PLANS TO REVIEW:
> ${JSON.stringify(plansForReview, null, 2)}
>
> CURRENT PORTFOLIO STATE:
> - Open positions: ${openPositionCount} (max allowed: ${settings.max_open_positions || 5})
> - Symbols already trading: ${openPositionSymbols.join(', ') || 'None'}
>
> RISK RULES TO ENFORCE:
> - Emergency stop active: ${settings.emergency_stop_active ? 'YES — BLOCK ALL' : 'No'}
> - Min confidence: ${settings.min_confidence_threshold || 65}%
> - Max risk score: ${settings.max_risk_score_threshold || 70}
> - Min R:R ratio: ${settings.min_rr_ratio || 2}
> - Max open positions: ${settings.max_open_positions || 5}
> - Block memecoins: ${settings.block_memecoins ? 'Yes' : 'No'}
> - Block high risk assets: ${settings.block_high_risk ? 'Yes' : 'No'}
> - Max risk per trade: ${settings.max_risk_per_trade_pct || 2}%
>
> YOUR TASK:
> For each trade plan:
> 1. Check every rule above
> 2. Approve or block each plan
> 3. Explain clearly WHY each plan was approved or blocked (which specific rule)
> 4. For approved plans, note any conditions or cautions
> 5. Provide an overall risk assessment of the whole shortlist
>
> IMPORTANT: Do NOT approve any plan if emergency stop is active.
>
> Return ONLY this JSON, no extra text:
> {
>   "risk_summary": "Overall risk assessment paragraph",
>   "approved_plans": [
>     {
>       "symbol": "BTC",
>       "direction": "buy",
>       "entry_price": 64800,
>       "stop_loss": 62500,
>       "tp1": 67500,
>       "tp2": 70000,
>       "tp3": 74000,
>       "position_size_pct": 2,
>       "confidence_score": 78,
>       "risk_score": 45,
>       "rr_ratio": 2.4,
>       "summary": "Trade thesis summary",
>       "approval_reason": "Why this plan passed all risk checks",
>       "cautions": ["Any notes or cautions the user should be aware of"]
>     }
>   ],
>   "blocked_plans": [
>     {
>       "symbol": "DOGE",
>       "direction": "buy",
>       "block_reason": "Blocked: Memecoin filter active",
>       "rule_violated": "block_memecoins"
>     }
>   ]
> }

---

### Prompt 5.5
**Order:** #26  
**Topic:** Pipeline UI — progress and results display  
**Purpose:** Build the Pipeline page showing animated progress and results  

**[RECONSTRUCTED]**

> Build a Pipeline page (`/pipeline`) that shows:
>
> **Idle state:**
> - Explanation of the 3 agents and what each does
> - "Safety" info box: "Analysis only by default — no orders placed without your approval"
> - Large "Run AI Scout" button
> - History button to see past pipeline runs
>
> **Running state:**
> - Animated progress steps: Market Scan → Trade Planning → Risk Review → Done
> - Each step has a color-coded circle that pulses when active
> - Step turns green with checkmark when completed
>
> **Completed state:**
> - Show scan summary text
> - Show approved trade plans as expandable cards
> - Show blocked trades with block reason
> - Button to go view Trade Approvals
> - Reset button to run again
>
> **Failed state:**
> - Show error message
> - Show "Try Again" button
>
> Create `PipelineProgress` and `PipelineResults` components.
> Poll the AgentPipeline entity every 3 seconds while running to get status updates.

---

### Prompt 5.6
**Order:** #27  
**Topic:** AI Scout button on Dashboard  
**Purpose:** Add one-click pipeline trigger to Dashboard  

**[RECONSTRUCTED]**

> Add an "AI Scout" button on the Dashboard page.
> It should be a prominent card/button with a Cpu icon.
> When clicked, invoke the `runAgentPipeline` backend function.
> Show a loading spinner while running.
> When complete, show how many trade plans were generated and link to the Pipeline page to see results.
> Create an `AiScoutButton` component for this.

---

---

## PHASE 6 — TRADE APPROVAL & EXECUTION SAFETY

### Prompt 6.1
**Order:** #28  
**Topic:** TradeApproval entity and Trade Approval page  
**Purpose:** Build the user-facing approval flow before any real trade is executed  

**[RECONSTRUCTED]**

> Create a TradeApproval page at `/trade-approval/:id` and a `TradeApprovalWidget` component for the Dashboard.
>
> The Trade Approval page should show:
> - Asset name, symbol, direction (BUY/SELL) with color coding
> - Entry price (large, prominent)
> - Trade rationale and detailed explanation
> - Price levels grid: Entry, SL, TP1, TP2, TP3
> - Risk & Reward: Estimated risk $, Estimated reward $, R:R ratio
> - Scores: Confidence %, Risk score, Position size %, Direction
> - Validity notes (any cautions from Risk Manager)
>
> Action buttons:
> - **Reject** — mark as rejected, never execute
> - **Validate** — call Kraken in validate-only mode (no real order), show success/fail
> - **Execute Live** — only enabled after validate passes, requires confirmation dialog, places real order
>
> Safety rule: Live execution is opt-in. Caller must explicitly pass `validation_only: false`.
> Default is always validation mode.

---

### Prompt 6.2
**Order:** #29  
**Topic:** Kraken order execution function — safety architecture  
**Purpose:** Build the executeTradeOnKraken function with multiple safety layers  

**[NEAR-VERBATIM — reconstructed from function inline comments and safety check labels]**

> Create a backend function `executeTradeOnKraken` with a 4-layer safety architecture:
>
> **[SAFETY 1] IDEMPOTENCY:**
> If the trade approval already has an `exchange_order_id`, block the request — the order was already submitted.
>
> **[SAFETY 2] DUPLICATE GUARD:**
> Before placing any order, check the ExchangeOrder table for existing orders linked to this trade_approval_id. Block if found.
>
> **[SAFETY 3] BALANCE VALIDATION:**
> Fetch live Kraken balance before attempting any order.
> - For SELL: verify we hold enough of the asset
> - For BUY: verify we hold enough USD (ZUSD or USD in Kraken)
> If insufficient, reject the approval with a clear reason message.
>
> **[SAFETY 4] EXPLICIT MODE:**
> `validate=true` in Kraken AddOrder means Kraken validates but never executes.
> This is the DEFAULT behavior. To place a real order, the caller must pass `validation_only: false` explicitly.
>
> Additional safety checks:
> - Emergency stop active → block all orders
> - Confidence below threshold → block
> - Risk score above threshold → block
> - Max open positions reached → block
>
> Always check Kraken credentials are configured before attempting any API calls.
> Log all live orders to AuditLog and create an Alert on success.

---

### Prompt 6.3
**Order:** #30  
**Topic:** Trade approval two-step UI flow  
**Purpose:** Implement validate-then-execute two-step safety UI  

**[RECONSTRUCTED]**

> The Trade Approval UI should have a 2-step flow:
>
> Step 1 — Validate:
> - Click "Validate Order" button
> - Calls backend with `validation_only: true`
> - Kraken validates the order parameters without creating a real order
> - If success: show green success message, enable the "Execute Live" button
> - If fail: show red error with Kraken's error message
> - Show badge: "Test Mode"
>
> Step 2 — Execute Live (only enabled after Step 1 succeeds):
> - Show orange badge "Ready to Execute"
> - Click "Execute Live" button
> - Show confirmation dialog: "This will place a REAL {direction} order for {symbol} at {price}. Are you sure?"
> - If confirmed: calls backend with `validation_only: false`
> - If success: show order ID, change badge to "Sent", disable all action buttons
> - Show: "Check Alerts for order fill notifications"
>
> The Reject button is always available until the order is sent.

---

### Prompt 6.4
**Order:** #31  
**Topic:** TradeApprovalWidget for Dashboard  
**Purpose:** Show pending approvals on the dashboard with quick navigation  

**[RECONSTRUCTED]**

> Create a `TradeApprovalWidget` component for the Dashboard that:
> - Shows a list of pending TradeApproval records
> - Each item shows: asset symbol, icon, direction badge (BUY=green/SELL=red), confidence score, entry price
> - Clicking an item navigates to `/trade-approval/{id}`
> - Shows a count badge if there are pending approvals
> - Subscribes to real-time updates via entity subscription
> - Shows "View All" link if more than 3 pending

---

---

## PHASE 7 — SCREENSHOT UPLOAD & CHART ANALYSIS

### Prompt 7.1
**Order:** #32  
**Topic:** Screenshot upload in agent chat  
**Purpose:** Enable chart screenshot uploads for AI analysis in agent chat  

**[RECONSTRUCTED — this feature was described in the custom user instructions and implemented in AgentsPage]**

> Support screenshot-based chart analysis in AI Agents. Let users upload or paste chart screenshots from Kraken, Binance, or TradingView directly into agent chat.
>
> Implementation:
> - Add an image upload button (ImagePlus icon) to the chat input bar
> - Support paste from clipboard (Ctrl+V / Cmd+V) to paste screenshots directly
> - Support multiple images per message (up to 5)
> - Show thumbnail previews above the input bar before sending (AttachmentPreview component)
> - Each thumbnail has an X button to remove it before sending
> - When sent with images, upload each image via `Core.UploadFile` integration to get a permanent URL
> - Pass image URLs to the agent via `file_urls` parameter of `addMessage`
> - Prepend the agent's chart-specific system prompt before the user's note
> - The user's visible message should only show their typed note, not the hidden system prompt
> - Display sent images persistently in the chat bubble (clickable to open lightbox)
> - Implement an `ImageLightbox` component (full-screen, ESC to close)
>
> Design:
> - Upload button: ghost icon button, muted color, highlights on hover
> - Send button turns blue when images are attached
> - Pending images show as small thumbnail strip above input
> - Sent images appear in chat bubble, click to zoom
> - Add a "Upload chart screenshot" hint button in the empty chat state

---

### Prompt 7.2
**Order:** #33  
**Topic:** Chart prompt injection — hidden from user  
**Purpose:** Send agent-specific chart analysis instructions without showing them in chat  

**[RECONSTRUCTED — behavior described in code comments and logic]**

> When a user sends a screenshot to an agent, inject the agent's `chartPrompt` as a hidden system-level prefix before their message.
>
> The backend receives: `{chartPrompt}\n\nUser note: {userNote}`
> But the UI displays only: the user's actual note text
>
> To strip the hidden prompt from displayed messages:
> - Parse messages looking for the pattern `\n\nUser note: (.*)` 
> - If found, extract and display only the user note part
> - If not found (regular text message), display as-is
>
> This means agents get full structured instructions for chart reading, but users see only their own clean message in the chat history.

---

### Prompt 7.3
**Order:** #34  
**Topic:** Optimistic image rendering in chat  
**Purpose:** Show images immediately before backend confirms upload  

**[RECONSTRUCTED]**

> When a user sends a message with images:
> - Immediately render an optimistic message in the chat using the local base64 data URLs (fast, no wait)
> - Mark these as `_localImagePreviews` — not persisted, only for the current session
> - The real uploaded file URLs come back from the backend subscription later
> - Once the subscription fires with the real message, replace the optimistic one
> - This prevents the chat from feeling slow during image upload
>
> Persistent image display:
> - After page reload, images render from the stored `file_urls` array on the message
> - Both local previews and persisted URLs are handled by the same render path

---

---

## PHASE 8 — LOCALIZATION & MULTI-LANGUAGE SUPPORT

### Prompt 8.1
**Order:** #35  
**Topic:** Full app localization system  
**Purpose:** Make all UI text translatable across 8 languages  

**[RECONSTRUCTED]**

> Add multi-language support to the entire app. Support these languages:
> - English (en) — default
> - Polish (pl)
> - German (de)
> - French (fr)
> - Spanish (es)
> - Italian (it)
> - Portuguese (pt)
> - Dutch (nl)
>
> Implementation:
> - Create a translations system in `lib/translations.js` with all UI strings as keys
> - Create an `AppPreferencesContext` that holds the selected language
> - Provide a `t(key)` function throughout the app for translations
> - Persist language selection to `localStorage`
> - Add language selector to the Settings page
>
> Every visible text string in the app must use `t('key')` instead of hardcoded English.
> Cover: navigation, dashboard, market page, portfolio, positions, signals, agents, pipeline, trade approval, risk, audit, settings, alerts.

---

### Prompt 8.2
**Order:** #36  
**Topic:** Agent language-awareness  
**Purpose:** Make AI agent responses language-aware based on user's selected language  

**[RECONSTRUCTED]**

> Make AI agents respond in the user's selected language.
>
> For each agent, provide language-specific system prompt instructions:
> - German: "Antworte auf Deutsch"
> - French: "Répondez en français"
> - Spanish: "Responde en español"
> - Italian: "Rispondi in italiano"
> - Portuguese: "Responda em português"
> - Polish: full Polish system prompt with translated section headers and rejection rules
> - Dutch: full Dutch system prompt with translated section headers and rejection rules
>
> The chart analysis prompts (chartPrompt) should be translated to each language.
> Polish and Dutch get full translated structured prompts.
> Other languages get a condensed prompt with a language instruction appended.
>
> The agent examples (quick-start prompt suggestions shown in empty state) must also be translated per language.

---

### Prompt 8.3
**Order:** #37  
**Topic:** Agent descriptions and examples translated  
**Purpose:** All agent UI copy translated to each supported language  

**[NEAR-VERBATIM — language descriptions extracted from lib/agentConfig.js]**

> Translate agent descriptions and example prompts for all 8 languages.
>
> Market Watcher:
> - EN: "Monitors prices, trends, volume, and technical indicators. Ask about market conditions, gainers, losers."
> - PL: "Monitoruje ceny, trendy, wolumen i wskaźniki techniczne. Pytaj o warunki rynkowe, największe zyski, straty."
> - DE: "Überwacht Preise, Trends, Volumen und technische Indikatoren. Fragen Sie nach Marktbedingungen, Gewinnern, Verlierern."
> [+ FR, ES, IT, PT, NL variants as implemented]
>
> Risk Manager:
> - EN: "Evaluates portfolio risk, checks position safety, enforces rules. Capital protection is the priority."
> [+ all language variants]
>
> Trade Planner:
> - EN: "Plans trades with entry, SL, TPs, and position sizing. Uses the AI scoring engine. Never executes without your approval."
> [+ all language variants]
>
> Alert Agent:
> - EN: "Manages alerts and notifications. Can create, review, and send alerts for price moves or risk events."
> [+ all language variants]

---

---

## PHASE 9 — CURRENCY CONVERSION

### Prompt 9.1
**Order:** #38  
**Topic:** Multi-currency support  
**Purpose:** Allow users to view all monetary values in their preferred currency  

**[RECONSTRUCTED]**

> Add currency conversion to the app. Support: USD ($), EUR (€), GBP (£), PLN (zł).
>
> Implementation:
> - Add currency selector to Settings page alongside language selector
> - Store currency preference in `localStorage`
> - Add `formatCurrency(amountInUSD)` function to `AppPreferencesContext`
> - This converts from USD base using static rates: EUR=0.92, GBP=0.79, PLN=4.00
> - Use `formatCurrency()` everywhere a monetary value is displayed
> - This includes: portfolio values, PnL, trade prices, entry/SL/TP levels, position values
>
> Note: Static rates are used for production safety. TODO comment: replace with live FX API.
> Every page that shows dollar amounts must use `formatCurrency` from the preferences context.

---

---

## PHASE 10 — GLOBAL SEARCH

### Prompt 10.1
**Order:** #39  
**Topic:** Global command palette search  
**Purpose:** Add app-wide search/navigation via keyboard shortcut  

**[RECONSTRUCTED]**

> Add a global search command palette to the app.
>
> Features:
> - Trigger with keyboard shortcut (Cmd+K / Ctrl+K) or clicking a search button in the top bar
> - Shows a modal overlay with search input
> - Searches across: all navigation pages, key actions (Run AI Scout, Emergency Stop, Sync Kraken)
> - Results show: icon, label, category
> - Click a result to navigate or trigger the action
> - Press Escape to close
> - Press Enter to select first result
>
> Create a `GlobalSearch` component.
> Register the keyboard shortcut in the Layout component.
> Show a search icon button in the top navigation bar.

---

---

## PHASE 11 — CRYPTO ICONS & ASSET VISUALS

### Prompt 11.1
**Order:** #40  
**Topic:** CryptoIcon component with 3-tier fallback  
**Purpose:** Display cryptocurrency icons reliably across the entire app  

**[RECONSTRUCTED]**

> Create a `CryptoIcon` component that displays crypto coin icons with a 3-tier fallback:
>
> Tier 1: Use `image_url` prop (from CoinGecko, stored in Asset entity) — most accurate
> Tier 2: CoinGecko CDN thumbnail URL via symbol→coingecko-id mapping — free, no auth
> Tier 3: Text initials fallback (first 2 chars of symbol) — never shows broken images
>
> Include a comprehensive symbol → CoinGecko ID mapping for ~100+ coins including: BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, LINK, UNI, AAVE, GRT, FET, NEAR, MATIC, ARB, OP, DOGE, SHIB, and many more.
>
> Size variants: xs, sm, md, lg, xl
>
> The initials fallback should use consistent colors based on a hash of the symbol (so BTC is always the same color).
>
> Use this component everywhere an asset is displayed: Market page rows, Portfolio page, Positions page, Dashboard top assets, Trade Approval page, AI signals, agent chat.

---

### Prompt 11.2
**Order:** #41  
**Topic:** CoinGecko image_url persistence  
**Purpose:** Store icon URLs from CoinGecko in Asset entity for offline use  

**[RECONSTRUCTED]**

> When syncing from CoinGecko, store the `image` field from CoinGecko as `image_url` in the Asset entity.
> This means asset icons persist in the database even without a network request to CoinGecko.
> The CryptoIcon component should use this stored URL as the primary source (Tier 1).
> When the image loads from the DB URL successfully, no CDN fallback is needed.
> This works completely offline if assets were previously synced.

---

---

## PHASE 12 — SETTINGS & API KEY MANAGEMENT

### Prompt 12.1
**Order:** #42  
**Topic:** Settings page — language, currency, exchange status  
**Purpose:** Build the full settings page for user preferences and exchange connection status  

**[RECONSTRUCTED]**

> Build a Settings page with:
>
> **User Profile Section:**
> - Show current user name and email (read-only, from auth)
>
> **Language & Currency Section:**
> - Language selector: dropdown with all 8 supported languages and native names
> - Currency selector: USD, EUR, GBP, PLN with symbols
> - Show "Unsaved changes" indicator when either is changed
> - Save and Cancel buttons (only shown when changes exist)
> - Warn before leaving page with unsaved changes (browser beforeunload event + react-router navigation guard)
>
> **Exchange Connection Section:**
> - Show Kraken connection status (configured / not configured)
> - "To connect: add KRAKEN_API_KEY and KRAKEN_API_SECRET in your environment variables"
>
> **Security Section:**
> - List security features: 2FA via Kraken, API rate limiting, encrypted storage, audit logging
>
> **Account Section:**
> - Logout button

---

### Prompt 12.2
**Order:** #43  
**Topic:** Kraken API key instructions in Settings  
**Purpose:** Guide users to configure Kraken credentials without the app storing keys directly  

**[RECONSTRUCTED]**

> In Settings, explain how to connect Kraken:
> - Do not build a key entry form in the UI
> - Instead, tell users to go to: Base44 dashboard → Settings → Environment Variables
> - Add KRAKEN_API_KEY and KRAKEN_API_SECRET as environment variables
> - The app reads them securely from the backend via `Deno.env.get()`
> - Show the current connection status (configured/not configured) by calling `syncKrakenAccount` which returns `kraken_configured: true/false`

---

---

## PHASE 13 — BUG FIXES, AUDITS & SAFETY HARDENING

### Prompt 13.1
**Order:** #44  
**Topic:** Full system security and financial logic audit  
**Purpose:** Comprehensive review of all backend functions for financial safety risks  

**[RECONSTRUCTED — from conversation summary and docs/DEPLOYMENT_CHECKLIST.md reference]**

> Perform a comprehensive audit of all backend functions. Check for:
>
> 1. **Kraken signature correctness** — verify the HMAC-SHA512 signature implementation matches Kraken's specification exactly
> 2. **BUY balance validation logic** — the formula for required USD should be `entry_price * (position_size_pct / 100)`, not just `entry_price * position_size_pct`
> 3. **Order quantity calculation** — `position_size_pct / 100` is a percentage, but for Kraken the volume field needs the actual coin quantity, not a percentage of portfolio
> 4. **Idempotency** — double-check that orders cannot be placed twice for the same approval
> 5. **Emergency stop propagation** — verify emergency stop is checked in EVERY path that could place an order
> 6. **Error handling** — ensure all Kraken error responses are caught and returned cleanly
> 7. **Audit trail** — all order placements must create AuditLog records

---

### Prompt 13.2
**Order:** #45  
**Topic:** Kraken signature bug fix  
**Purpose:** Fix incorrect nonce concatenation in Kraken request signing  

**[RECONSTRUCTED — from conversation summary noting "flawed Kraken signature in syncKrakenOpenOrders"]**

> Fix the Kraken API signature in `syncKrakenOpenOrders`.
> The correct Kraken signature formula is:
> `HMAC-SHA512(base64decode(apiSecret), path_bytes + SHA256(nonce + postdata))`
>
> The incorrect version was passing only `postData` to SHA256 without prepending the nonce.
> The nonce must be part of the hashed message: `SHA256(nonce + postdata)` — not just `SHA256(postdata)`.
>
> The `syncKrakenAccount` function was already correct. Fix `syncKrakenOpenOrders` to match.

---

### Prompt 13.3
**Order:** #46  
**Topic:** BUY balance validation fix  
**Purpose:** Correct the USD balance check before placing BUY orders  

**[RECONSTRUCTED — from conversation summary noting "flawed BUY balance validation"]**

> Fix the BUY order balance validation in `executeTradeOnKraken`.
>
> The old (wrong) logic:
> `const requiredUsd = trade.entry_price * trade.position_size_pct`
> This treats position_size_pct as a multiplier, not a percentage.
>
> The correct logic:
> `const requiredUsd = trade.entry_price * (parseFloat(trade.position_size_pct || 1) / 100)`
>
> For example: BTC at $65,000 with 2% position size = $1,300 required, not $130,000.

---

### Prompt 13.4
**Order:** #47  
**Topic:** Deno async crypto fix  
**Purpose:** Fix synchronous crypto usage that fails in Deno  

**[RECONSTRUCTED — from code comment: "DENO CRYPTO IS ASYNC"]**

> In Deno, the Web Crypto API (SubtleCrypto) is asynchronous. All `crypto.subtle.*` operations must be awaited.
> Stripe's `constructEvent()` is synchronous and will throw: "SubtleCryptoProvider cannot be used in a synchronous context".
> Fix: use `await stripe.webhooks.constructEventAsync()` instead.
> Fix all instances in backend functions where crypto operations were not awaited.

---

### Prompt 13.5
**Order:** #48  
**Topic:** Pipeline poll vs push approach  
**Purpose:** Switch from polling to real-time pipeline status  

**[RECONSTRUCTED]**

> The Pipeline page should poll the AgentPipeline entity every 3 seconds while a pipeline is running.
> When `status` becomes 'completed' or 'failed', stop polling and display results.
> Use `clearInterval` on cleanup.
> Handle the case where the page is navigated away from while running — clear the poll interval on unmount.

---

---

## PHASE 14 — MOBILE OPTIMIZATION

### Prompt 14.1
**Order:** #49  
**Topic:** Mobile-first responsive layout  
**Purpose:** Ensure the entire app works well on mobile screens  

**[RECONSTRUCTED]**

> Make the entire app fully mobile-first:
>
> - Layout: Use a bottom-of-screen sidebar on mobile, or collapse sidebar with hamburger menu
> - Market page: Hide 1h change, 7d change, RSI columns on mobile. Show 24h change below price.
> - Portfolio: Stack into cards on mobile instead of table
> - Positions: Card-based on all screen sizes
> - Dashboard: 2-column stat grid on mobile
> - Agents: Full-screen chat when agent is selected on mobile, back button to return to agent list
> - All input forms: Stack vertically on mobile
> - Typography: Slightly smaller on mobile (text-sm instead of text-base)
> - Touch targets: All buttons at minimum 44px tall
> - Safe area: Add `env(safe-area-inset-bottom)` padding to chat input bar for notched phones

---

### Prompt 14.2
**Order:** #50  
**Topic:** Mobile chat input safe area  
**Purpose:** Fix chat input being obscured by phone keyboard/home bar  

**[RECONSTRUCTED — from code comment `style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}`]**

> Fix the agent chat input bar on mobile devices with notches/home bars.
> Add `paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'` as inline style to the input container.
> This ensures the input is never hidden behind the iOS home indicator or Android navigation bar.

---

---

## PHASE 15 — CONVERSATION ARCHIVE / HISTORY FEATURE

### Prompt 15.1
**Order:** #51  
**Topic:** Agent chat history archive modal  
**Purpose:** Let users browse and reload past conversations  

**[RECONSTRUCTED]**

> Add a conversation archive/history feature to the Agents chat page:
>
> - On page load, call `base44.agents.listConversations()` for each agent to load all past conversations
> - Track the most recently active conversation per agent
> - Add a history button (BarChart2 icon, desktop only) in the agent header bar
> - When clicked, show an archive modal (bottom sheet on mobile, centered modal on desktop)
> - The modal shows all past conversations for the selected agent
> - Each entry shows: conversation name (or "Chat - {date}"), last message preview, date
> - Active conversation is highlighted
> - Clicking an entry: loads the conversation messages and subscribes to real-time updates
> - The modal has a close (X) button
>
> On mobile, the archive is accessible via a separate button in the empty state:
> "View History (N)" — only when conversations exist for that agent.

---

---

## PHASE 16 — CODE REFACTORING & COMPONENTIZATION

### Prompt 16.1
**Order:** #52  
**Topic:** AgentsPage decomposition  
**Purpose:** Split the 912-line AgentsPage into focused smaller components  

**[NEAR-VERBATIM — from the refactoring conversation]**

> The AgentsPage.jsx is 912 lines — too large. Refactor it by extracting:
>
> 1. `lib/agentConfig.js` — All agent definitions, descriptions, examples, and system prompts (chartPrompt per language)
> 2. `hooks/useAgentConversations.js` — Conversation state management, loading, subscribing
> 3. `components/agents/AgentImageLightbox.jsx` — ImageLightbox + AttachmentPreview components
> 4. `components/agents/AgentChatMessages.jsx` — Message rendering including images, markdown, tool calls
>
> The main `AgentsPage.jsx` should shrink to ~220 lines handling only orchestration.
> No behavior, design, translations, or integrations should change.

---

### Prompt 16.2
**Order:** #53  
**Topic:** TradeApproval page decomposition  
**Purpose:** Extract the trade display UI into a reusable component  

**[NEAR-VERBATIM — from the refactoring conversation]**

> Extract the trade display UI from `pages/TradeApproval.jsx` into `components/TradeApproval/TradeApprovalForm.jsx`.
> The form component receives all data and handlers as props.
> The page component keeps only: data loading, state management, and handler functions.
> This reduces the page from 351 lines to ~140 lines.

---

---

## FINAL ACTIVE PROMPTS (CURRENTLY IN EFFECT)

These are the prompts and instructions that are **actively shaping behavior** in the deployed app as of 2026-04-24.

---

### ACTIVE PROMPT F1 — Custom User Instructions (Platform-Level)
**Source:** Base44 platform custom instructions, applied globally  
**[VERBATIM]**

> Support screenshot-based chart analysis in AI Agents. Let users upload or paste chart screenshots from Kraken, Binance, or TradingView directly into agent chat. Preserve premium dark mobile design. Keep current agent roles. Agents must analyze only what is visible in the image, state uncertainty clearly, and never invent unreadable values or indicators.

---

### ACTIVE PROMPT F2 — Market Watcher Chart Analysis Prompt (English)
**Source:** `lib/agentConfig.js` → `market_watcher.chartPrompt` (English version)  
**[VERBATIM — see Phase 4, Prompt 4.2 above for full text]**  
Key rules enforced:
- REJECTION RULE: Refuse non-chart screenshots with a specific message
- ANALYSIS RULES: Only analyze visible candles, wicks, trend, price labels — never invent
- FORMAT: 7-section structured response + Final Verdict
- "Never exceed this format. Premium, concise, mobile-first. No filler."

---

### ACTIVE PROMPT F3 — Risk Manager Chart Analysis Prompt (English)
**Source:** `lib/agentConfig.js` → `risk_manager.chartPrompt` (English version)  
**[VERBATIM — see Phase 4, Prompt 4.3 above for full text]**  
Key rules enforced:
- Capital protection focus
- Separate facts from risk interpretation
- Never invent levels or indicators
- 7-section response format focusing on: visible factors, risk flags, SL placement, position sizing, capital protection

---

### ACTIVE PROMPT F4 — Trade Planner Chart Analysis Prompt (English)
**Source:** `lib/agentConfig.js` → `trade_planner.chartPrompt` (English version)  
**[VERBATIM — see Phase 4, Prompt 4.4 above for full text]**  
Key rules enforced:
- Reject non-single-asset chart screens with specific message format
- Compact 8-field format for valid charts
- Never mention backend, JSON, or internal implementation
- "Never exceed this format. Never add extra sections."

---

### ACTIVE PROMPT F5 — Alert Agent Chart Analysis Prompt (English)
**Source:** `lib/agentConfig.js` → `alert_agent.chartPrompt` (English version)  
**[VERBATIM — see Phase 4, Prompt 4.5 above for full text]**  
4-point structure: visible elements → key price levels for alerts → suggested alert conditions → confidence score

---

### ACTIVE PROMPT F6 — AI Scout Market Watcher (Pipeline Stage 1)
**Source:** `functions/runAgentPipeline.js`  
**[VERBATIM — see Phase 5, Prompt 5.2 above for full text]**  
Data-driven prompt using live asset data, existing signals, open positions, and risk constraints.

---

### ACTIVE PROMPT F7 — AI Scout Trade Planner (Pipeline Stage 2)
**Source:** `functions/runAgentPipeline.js`  
**[VERBATIM — see Phase 5, Prompt 5.3 above for full text]**  
Converts shortlisted setups into executable trade plans with strict JSON schema.

---

### ACTIVE PROMPT F8 — AI Scout Risk Manager (Pipeline Stage 3)
**Source:** `functions/runAgentPipeline.js`  
**[VERBATIM — see Phase 5, Prompt 5.4 above for full text]**  
Applies all risk rules, blocks/approves each plan, outputs structured approved/blocked lists.

---

---

## MISSING / UNCERTAIN PROMPTS

The following aspects of the build history could not be recovered with certainty. They are noted here for completeness.

---

### MISSING M1 — Exact original creation prompt
**Status:** Reconstructed  
**Notes:** The verbatim first message used to create the app is not recoverable from the codebase alone. The reconstruction in Phase 0 is based on the resulting entity schemas, page structure, and initial component set. The core concepts are accurate but exact wording may differ.

---

### MISSING M2 — Initial design brief / color palette prompt
**Status:** Partially reconstructed  
**Notes:** The exact prompt that established the dark navy + emerald green theme, Inter + JetBrains Mono fonts, and the CSS variable system is not recoverable. The design tokens in `index.css` and `tailwind.config.js` represent the final state but not the prompt that generated them.

---

### MISSING M3 — Signals page prompt
**Status:** Not reconstructed  
**Notes:** The `pages/Signals.jsx` exists and is functional but the specific prompt(s) used to build it (filtering, signal card design, status management) were not captured in recoverable detail.

---

### MISSING M4 — Audit page prompt
**Status:** Not reconstructed  
**Notes:** The `pages/Audit.jsx` exists but the prompt to build it is not recoverable.

---

### MISSING M5 — Alerts page prompt
**Status:** Not reconstructed  
**Notes:** The `pages/Alerts.jsx` exists but the detailed prompt is not recoverable.

---

### MISSING M6 — PnL chart / Portfolio chart prompt
**Status:** Not reconstructed  
**Notes:** The `components/portfolio/PortfolioPnlChart.jsx` exists with both PnL bar chart and allocation pie chart. The prompt that introduced these recharts visualizations is not recoverable.

---

### MISSING M7 — Initial agent entity configuration prompts (agents/*.json)
**Status:** Not reconstructed  
**Notes:** The `agents/market_watcher.json`, `agents/risk_manager.json`, `agents/trade_planner.json`, `agents/alert_agent.json` entity configs were created as part of the Base44 agent setup. The exact prompts specifying `tool_configs` and `allowed_operations` are not recoverable.

---

### MISSING M8 — Kraken WebSocket `useKrakenTicker` hook exact prompt
**Status:** Partially reconstructed  
**Notes:** The hook in `hooks/useKrakenTicker.js` is complex. The prompt that specified its exact reconnection behavior, pair format mapping (`symbolToKrakenPair`), and status enum is not recoverable with full fidelity.

---

### MISSING M9 — Authentication setup / AuthContext prompt
**Status:** Not reconstructed  
**Notes:** The `lib/AuthContext.jsx` contains user registration error handling, loading states, and auth-required redirects. The prompt that defined this behavior is not recoverable.

---

### MISSING M10 — `createTradeApprovalFromSignal` function prompt
**Status:** Not reconstructed  
**Notes:** A function `functions/createTradeApprovalFromSignal.js` is referenced in the file tree. The prompt that built this direct signal-to-approval path (bypassing the full pipeline) is not recoverable.

---

### MISSING M11 — Exact Polish and Dutch full chart prompts
**Status:** Verbatim (included)  
**Notes:** The Polish (`pl`) and Dutch (`nl`) chart prompts are very long and fully included in `lib/agentConfig.js`. They are verbatim in the archive above under Phase 4 / Final Prompts — but they were too large to reproduce in full in the Phase 4 section. They are fully preserved in the source file.

---

### MISSING M12 — Any A/B prompt variants or discarded approaches
**Status:** Unknown  
**Notes:** It is likely some prompts went through iteration (e.g., agent system prompt refinements, pipeline prompt tuning). Only the final versions are preserved in the source code. Earlier draft versions are not recoverable.

---

---

## APPENDIX — KEY DESIGN DECISIONS DRIVEN BY PROMPTS

These are not prompts themselves, but important product decisions that prompts established:

| Decision | Established By |
|---|---|
| Default always validation mode, live is opt-in | Phase 6 Prompt 6.2 — Safety Layer 4 |
| Emergency stop blocks ALL automated activity | Phase 6 + Risk Settings defaults |
| Agents never mention backend, JSON, or internal tools | Phase 4 Prompts 4.2–4.5 |
| Agents reject non-chart screenshots with specific message | Phase 4 Prompt 4.2 (Rejection Rule) |
| CoinGecko sync happens before every pipeline run | Phase 2 Prompt 2.3 |
| Chart prompt is hidden from user's chat display | Phase 7 Prompt 7.2 |
| Position size % means portfolio %, not coin quantity | Phase 13 Prompt 13.3 (Bug Fix) |
| Kraken nonce must be prepended to postData before SHA256 | Phase 13 Prompt 13.2 (Bug Fix) |
| All monetary values use formatCurrency() for multi-currency | Phase 9 Prompt 9.1 |
| Icons use 3-tier fallback: DB URL → CDN → Initials | Phase 11 Prompt 11.1 |

---

*End of Prompt History Archive*  
*Compiled: 2026-04-24 | Project: CryptoAI Trading App | Platform: Base44*