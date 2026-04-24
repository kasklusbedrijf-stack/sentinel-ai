import { useEffect, useRef } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ARCHIVE_CONTENT = `# CryptoAI Trading App — Full Prompt History Archive
**Project:** CryptoAI — AI-Orchestrated Cryptocurrency Trading Platform  
**Platform:** Base44 (React + Deno backend functions)  
**Archive Date:** 2026-04-24  
**Archive Type:** Reconstructed build history — compiled from source files, agent configs, backend function comments, conversation history, and system prompt records  

---

> **ARCHIVIST NOTE:**  
> This document was compiled by reconstructing prompts from: (1) the live conversation history visible to the AI assistant, (2) inline comments and logic in backend function files, (3) agent system prompt strings embedded in \`lib/agentConfig.js\`, (4) entity schemas, (5) component file structure and naming, and (6) the \`docs/\` folder files that were created during development.  
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

> Create a backend function called \`syncCoinGeckoMarket\` that:
>
> 1. Fetches live market data from the CoinGecko public API (\`/coins/markets\` endpoint)
> 2. Retrieves data for our tracked coins: BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, LINK, UNI, AAVE, GRT, RENDER, FET, NEAR, MATIC, ARB, OP, DOGE, SHIB
> 3. For each coin, calculates/derives:
>    - RSI estimate (from 24h and 7d changes as proxy)
>    - Trend status (strong_bullish / bullish / neutral / bearish / strong_bearish)
>    - MACD signal (from 1h vs 24h momentum)
>    - Volatility score (0-100)
>    - Support/resistance from 24h low/high
>    - EMA proxies (20/50/200)
> 4. Upserts each asset into the Asset entity (update if exists, create if new)
> 5. Stores \`image_url\` from CoinGecko for use as coin icons
> 6. Marks \`data_source: 'coingecko'\` and \`last_synced\` timestamp
> 7. Handles CoinGecko rate limiting gracefully (return 200 with \`rate_limited: true\`)
> 8. Supports optional \`COINGECKO_API_KEY\` environment variable for Pro tier
>
> The function must be safe to call repeatedly without creating duplicates.

---

### Prompt 2.2
**Order:** #9  
**Topic:** CoinGecko sync UI controls  
**Purpose:** Add manual sync button and status indicator to Market page  

**[RECONSTRUCTED]**

> Add a "Sync Live Data" button to the Market page header that calls the \`syncCoinGeckoMarket\` backend function.
> Show the last sync timestamp.
> Show a loading spinner while syncing.
> Show a green dot indicator next to assets that have live CoinGecko data.
> If rate limited, show a friendly error message: "Rate limited — wait 60 seconds before syncing again."
> Create a \`LiveDataControls\` component for this.

---

### Prompt 2.3
**Order:** #10  
**Topic:** Auto-sync CoinGecko before AI pipeline runs  
**Purpose:** Ensure pipeline always has fresh prices  

**[NEAR-VERBATIM — from inline comment in runAgentPipeline.js]**

> Before the Market Watcher agent runs in the pipeline, automatically call \`syncCoinGeckoMarket\` first.
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

> Create a backend function called \`syncKrakenAccount\` that:
>
> 1. Reads \`KRAKEN_API_KEY\` and \`KRAKEN_API_SECRET\` from environment variables
> 2. If credentials are not set, return a friendly error: "Kraken API credentials not configured. Add KRAKEN_API_KEY and KRAKEN_API_SECRET in Settings → Environment Variables."
> 3. Implements proper Kraken API signature: \`base64( HMAC-SHA512( base64decode(secret), path + SHA256(nonce + postdata) ) )\`
> 4. Fetches \`/0/private/Balance\` and \`/0/private/OpenOrders\`
> 5. Maps Kraken asset codes to standard symbols (XBT→BTC, XXBT→BTC, XETH→ETH, etc.)
> 6. Skips dust balances (< 0.000001)
> 7. Skips fiat and stablecoins (EUR, USD, GBP, USDT, USDC, ZUSD, ZEUR)
> 8. For each crypto balance, looks up current price from the Asset entity (CoinGecko-synced)
> 9. Calculates current_value, unrealized PnL, and allocation %
> 10. Upserts into PortfolioAsset entity with \`data_source: 'kraken'\`
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
> On click, call \`syncKrakenAccount\` backend function.
> If Kraken is not configured, show a message: "Connect your Kraken API keys in Settings."
> Create a \`KrakenSyncControls\` component for reuse across pages.

---

### Prompt 3.3
**Order:** #13  
**Topic:** Kraken real-time WebSocket price feed  
**Purpose:** Show live prices in Positions page from Kraken WebSocket  

**[RECONSTRUCTED]**

> Create a \`useKrakenTicker\` hook that connects to the Kraken WebSocket feed (\`wss://ws.kraken.com/\`) and subscribes to ticker data for a list of trading pairs.
>
> The hook should:
> - Accept an array of Kraken pair names (e.g., ["XBT/USD", "ETH/USD"])
> - Return \`{ prices, status }\` where prices is a map of pair → { last, bid, ask }
> - Track connection status: 'connecting' | 'connected' | 'disconnected' | 'error'
> - Auto-reconnect on disconnect
> - Unsubscribe cleanly on unmount
>
> Create a \`WsStatusDot\` component that shows a colored dot with the connection status.
> Create a \`LivePriceDisplay\` component that shows the live price with a pulsing green dot.
>
> Use this in the Positions page to show live P&L for open positions.

---

### Prompt 3.4
**Order:** #14  
**Topic:** Kraken open orders sync  
**Purpose:** Poll Kraken to update ExchangeOrder statuses  

**[RECONSTRUCTED]**

> Create a \`syncKrakenOpenOrders\` backend function that:
> - Fetches open orders from Kraken
> - Matches them to ExchangeOrder records in the database
> - Updates the status of filled/cancelled orders
> - Creates an alert when an order is filled
>
> Create a \`useKrakenOrderStatus\` hook that polls this function every 30 seconds when there are active sent orders.

---

---

## PHASE 4 — AI AGENTS & AGENT CHAT

### Prompt 4.1
**Order:** #15  
**Topic:** AI Agents page — core chat interface  
**Purpose:** Build the 4-agent chat UI with conversation management  

**[RECONSTRUCTED]**

> Build an AI Agents page at \`/agents\` with a chat interface for 4 specialized agents:
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
> - \`base44.agents.createConversation()\`
> - \`base44.agents.addMessage()\`
> - \`base44.agents.subscribeToConversation()\` for real-time streaming
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
> - On load, fetch all past conversations for each agent using \`base44.agents.listConversations()\`
> - Store the last active conversation per agent
> - Add a "History" button (clock/archive icon) in the agent chat header
> - When clicked, show a modal with a list of past conversations for that agent
> - Each conversation shows: name, date, and first line of last message
> - Clicking a conversation loads it and subscribes to updates
> - Add a "New Chat" button to start a fresh conversation
> - Subscribe to real-time updates via \`base44.agents.subscribeToConversation()\`

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
> After Stage 3, create \`TradeApproval\` records (status: pending) for each approved plan, waiting for user confirmation.
>
> Create an \`AgentPipeline\` entity to track: status (running/completed/failed), current step, results of each stage, started_at, completed_at.
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
> DATA SOURCE: \${dataFreshness}
>
> MARKET DATA (top 20 assets by market cap):
> \${JSON.stringify(assetSummary, null, 2)}
>
> EXISTING AI SIGNALS:
> \${JSON.stringify(signalSummary, null, 2)}
>
> OPEN POSITIONS (already active): \${positions.map(p => p.asset_symbol).join(', ') || 'None'}
>
> RISK CONSTRAINTS:
> - Max open positions: \${settings.max_open_positions || 5}
> - Block memecoins: \${settings.block_memecoins ? 'Yes' : 'No'}
> - Block high risk: \${settings.block_high_risk ? 'Yes' : 'No'}
> - Min confidence threshold: \${settings.min_confidence_threshold || 65}%
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
> \${JSON.stringify(setupsForPlanning, null, 2)}
>
> FULL ASSET DATA (for price level reference):
> \${JSON.stringify(assetSummary.filter(a => setupsForPlanning.some(s => s.symbol === a.symbol)), null, 2)}
>
> RISK RULES:
> - Max risk per trade: \${settings.max_risk_per_trade_pct || 2}% of portfolio
> - Min R:R ratio: \${settings.min_rr_ratio || 2}
> - Min confidence threshold: \${settings.min_confidence_threshold || 65}%
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
> \${JSON.stringify(plansForReview, null, 2)}
>
> CURRENT PORTFOLIO STATE:
> - Open positions: \${openPositionCount} (max allowed: \${settings.max_open_positions || 5})
> - Symbols already trading: \${openPositionSymbols.join(', ') || 'None'}
>
> RISK RULES TO ENFORCE:
> - Emergency stop active: \${settings.emergency_stop_active ? 'YES — BLOCK ALL' : 'No'}
> - Min confidence: \${settings.min_confidence_threshold || 65}%
> - Max risk score: \${settings.max_risk_score_threshold || 70}
> - Min R:R ratio: \${settings.min_rr_ratio || 2}
> - Max open positions: \${settings.max_open_positions || 5}
> - Block memecoins: \${settings.block_memecoins ? 'Yes' : 'No'}
> - Block high risk assets: \${settings.block_high_risk ? 'Yes' : 'No'}
> - Max risk per trade: \${settings.max_risk_per_trade_pct || 2}%
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
>   "approved_plans": [...],
>   "blocked_plans": [...]
> }

---

### Prompt 5.5
**Order:** #26  
**Topic:** Pipeline UI — progress and results display  
**Purpose:** Build the Pipeline page showing animated progress and results  

**[RECONSTRUCTED]**

> Build a Pipeline page (\`/pipeline\`) showing idle/running/completed/failed states with animated progress steps.
> Create \`PipelineProgress\` and \`PipelineResults\` components.
> Poll the AgentPipeline entity every 3 seconds while running.

---

### Prompt 5.6
**Order:** #27  
**Topic:** AI Scout button on Dashboard  
**Purpose:** Add one-click pipeline trigger to Dashboard  

**[RECONSTRUCTED]**

> Add an "AI Scout" button on the Dashboard page. Create an \`AiScoutButton\` component.

---

---

## PHASE 6 — TRADE APPROVAL & EXECUTION SAFETY

### Prompt 6.1
**Order:** #28  
**Topic:** TradeApproval entity and Trade Approval page  
**Purpose:** Build the user-facing approval flow before any real trade is executed  

**[RECONSTRUCTED]**

> Create a TradeApproval page at \`/trade-approval/:id\` with full trade details and 3 action buttons: Reject, Validate, Execute Live.
> Safety rule: Live execution is opt-in. Caller must explicitly pass \`validation_only: false\`. Default is always validation mode.

---

### Prompt 6.2
**Order:** #29  
**Topic:** Kraken order execution function — safety architecture  
**Purpose:** Build the executeTradeOnKraken function with multiple safety layers  

**[NEAR-VERBATIM]**

> Create backend function \`executeTradeOnKraken\` with 4-layer safety:
> [SAFETY 1] IDEMPOTENCY — block if order already submitted
> [SAFETY 2] DUPLICATE GUARD — check ExchangeOrder table before any order
> [SAFETY 3] BALANCE VALIDATION — fetch live Kraken balance first
> [SAFETY 4] EXPLICIT MODE — validate=true is DEFAULT; real order requires validation_only: false explicitly

---

### Prompt 6.3
**Order:** #30  
**Topic:** Trade approval two-step UI flow  
**Purpose:** Implement validate-then-execute two-step safety UI  

**[RECONSTRUCTED]**

> Step 1: Validate (test mode). Step 2: Execute Live (only enabled after Step 1 passes, with confirmation dialog).

---

### Prompt 6.4
**Order:** #31  
**Topic:** TradeApprovalWidget for Dashboard  
**Purpose:** Show pending approvals on the dashboard with quick navigation  

**[RECONSTRUCTED]**

> Create \`TradeApprovalWidget\` showing pending approvals with direction badges and click-to-navigate.

---

---

## PHASE 7 — SCREENSHOT UPLOAD & CHART ANALYSIS

### Prompt 7.1
**Order:** #32  
**Topic:** Screenshot upload in agent chat  
**Purpose:** Enable chart screenshot uploads for AI analysis  

**[RECONSTRUCTED]**

> Support screenshot-based chart analysis. Upload button + clipboard paste + multiple images + AttachmentPreview + ImageLightbox.

---

### Prompt 7.2
**Order:** #33  
**Topic:** Chart prompt injection — hidden from user  
**Purpose:** Send agent-specific chart analysis instructions without showing them in chat  

**[RECONSTRUCTED]**

> Inject chartPrompt as hidden prefix. Backend receives full prompt. UI strips it and shows only user note.

---

### Prompt 7.3
**Order:** #34  
**Topic:** Optimistic image rendering in chat  
**Purpose:** Show images immediately before backend confirms upload  

**[RECONSTRUCTED]**

> Render optimistic message with _localImagePreviews immediately. Replace when real subscription fires.

---

---

## PHASE 8 — LOCALIZATION & MULTI-LANGUAGE SUPPORT

### Prompt 8.1–8.3
**Order:** #35–37  
**Topic:** Full app localization system (8 languages) + agent language-awareness  

**[RECONSTRUCTED]**

> Support EN, PL, DE, FR, ES, IT, PT, NL. Translations via t() function. AppPreferencesContext. Persist in localStorage. All agents respond in user's selected language.

---

---

## PHASE 9 — CURRENCY CONVERSION

### Prompt 9.1
**Order:** #38  
**Topic:** Multi-currency support (USD, EUR, GBP, PLN)  

**[RECONSTRUCTED]**

> formatCurrency() in AppPreferencesContext. Static rates. Used everywhere monetary values appear.

---

---

## PHASE 10 — GLOBAL SEARCH

### Prompt 10.1
**Order:** #39  
**Topic:** Global command palette (Cmd+K)  

**[RECONSTRUCTED]**

> GlobalSearch component. Keyboard shortcut. Searches pages + actions. ESC to close.

---

---

## PHASE 11 — CRYPTO ICONS & ASSET VISUALS

### Prompt 11.1–11.2
**Order:** #40–41  
**Topic:** CryptoIcon with 3-tier fallback  

**[RECONSTRUCTED]**

> Tier 1: DB image_url. Tier 2: CoinGecko CDN. Tier 3: Initials. 100+ coin map. Consistent hash-based colors.

---

---

## PHASE 12 — SETTINGS & API KEY MANAGEMENT

### Prompt 12.1–12.2
**Order:** #42–43  
**Topic:** Settings page + Kraken key instructions  

**[RECONSTRUCTED]**

> Settings with language/currency selectors, Kraken status, security section, logout. Keys stored in env vars, not UI.

---

---

## PHASE 13 — BUG FIXES, AUDITS & SAFETY HARDENING

### Prompt 13.1–13.5
**Order:** #44–48  

> 13.1: Full financial logic audit
> 13.2: Kraken signature fix (nonce must prepend postData in SHA256)
> 13.3: BUY balance fix (position_size_pct / 100, not * pct)
> 13.4: Deno async crypto fix (constructEventAsync not constructEvent)
> 13.5: Pipeline poll cleanup on unmount

---

---

## PHASE 14 — MOBILE OPTIMIZATION

### Prompt 14.1–14.2
**Order:** #49–50  

> Mobile-first layout. Safe area padding for chat input: max(1rem, env(safe-area-inset-bottom)).

---

---

## PHASE 15 — CONVERSATION ARCHIVE / HISTORY FEATURE

### Prompt 15.1
**Order:** #51  

> Archive modal with past conversations. listConversations() on load. Bottom sheet on mobile.

---

---

## PHASE 16 — CODE REFACTORING & COMPONENTIZATION

### Prompt 16.1–16.2
**Order:** #52–53  

> AgentsPage 912→220 lines. Extracted: agentConfig.js, useAgentConversations.js, AgentImageLightbox.jsx, AgentChatMessages.jsx.
> TradeApproval 351→140 lines. Extracted: TradeApprovalForm.jsx.

---

---

## FINAL ACTIVE PROMPTS (CURRENTLY IN EFFECT)

### F1 — Custom User Instructions (Platform-Level) [VERBATIM]
> Support screenshot-based chart analysis in AI Agents. Let users upload or paste chart screenshots from Kraken, Binance, or TradingView directly into agent chat. Preserve premium dark mobile design. Keep current agent roles. Agents must analyze only what is visible in the image, state uncertainty clearly, and never invent unreadable values or indicators.

### F2 — Market Watcher Chart Prompt — see Phase 4 Prompt 4.2 [VERBATIM]
### F3 — Risk Manager Chart Prompt — see Phase 4 Prompt 4.3 [VERBATIM]
### F4 — Trade Planner Chart Prompt — see Phase 4 Prompt 4.4 [VERBATIM]
### F5 — Alert Agent Chart Prompt — see Phase 4 Prompt 4.5 [VERBATIM]
### F6 — AI Scout Stage 1 (Market Watcher) — see Phase 5 Prompt 5.2 [VERBATIM]
### F7 — AI Scout Stage 2 (Trade Planner) — see Phase 5 Prompt 5.3 [VERBATIM]
### F8 — AI Scout Stage 3 (Risk Manager) — see Phase 5 Prompt 5.4 [VERBATIM]

---

---

## MISSING / UNCERTAIN PROMPTS

- M1: Original creation prompt [Reconstructed]
- M2: Initial design brief / color palette [Partially reconstructed]
- M3: Signals page prompt [Not reconstructed]
- M4: Audit page prompt [Not reconstructed]
- M5: Alerts page prompt [Not reconstructed]
- M6: PnL chart prompt [Not reconstructed]
- M7: Agent entity configs (agents/*.json) [Not reconstructed]
- M8: useKrakenTicker exact prompt [Partially reconstructed]
- M9: AuthContext prompt [Not reconstructed]
- M10: createTradeApprovalFromSignal prompt [Not reconstructed]
- M11: Full Polish/Dutch chart prompts [In lib/agentConfig.js — too long to reproduce here]
- M12: A/B variants / discarded prompt iterations [Unknown]

---

---

## APPENDIX — KEY DESIGN DECISIONS

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
*Compiled: 2026-04-24 | Project: CryptoAI Trading App | Platform: Base44*`;

export default function DownloadArchive() {
  const autoDownloaded = useRef(false);

  const handleDownload = () => {
    const blob = new Blob([ARCHIVE_CONTENT], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PROMPT_HISTORY_ARCHIVE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-trigger on first load
  useEffect(() => {
    if (!autoDownloaded.current) {
      autoDownloaded.current = true;
      setTimeout(handleDownload, 500);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Prompt History Archive</h1>
          <p className="text-sm text-muted-foreground mt-1">PROMPT_HISTORY_ARCHIVE.md</p>
          <p className="text-xs text-muted-foreground mt-3">Download should start automatically. If not, tap the button below.</p>
        </div>
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Download .md File
        </button>
        <p className="text-xs text-muted-foreground">~70KB · Markdown format</p>
      </div>
    </div>
  );
}