import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, TrendingUp, Shield, BarChart2, Bell, Send, Plus, ChevronRight, Loader2, ImagePlus, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';

const getAgents = (language) => [
  {
    name: 'market_watcher',
    label: 'Market Watcher',
    icon: TrendingUp,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    description: language === 'pl' ? 'Monitoruje ceny, trendy, wolumen i wskaźniki techniczne. Pytaj o warunki rynkowe, największe zyski, straty.' : language === 'de' ? 'Überwacht Preise, Trends, Volumen und technische Indikatoren. Fragen Sie nach Marktbedingungen, Gewinnern, Verlierern.' : language === 'fr' ? 'Surveille les prix, les tendances, le volume et les indicateurs techniques. Posez des questions sur les conditions du marché, les gagnants, les perdants.' : language === 'es' ? 'Monitorea precios, tendencias, volumen e indicadores técnicos. Pregunta sobre condiciones del mercado, ganadores, perdedores.' : language === 'it' ? 'Monitora prezzi, tendenze, volume e indicatori tecnici. Fai domande su condizioni di mercato, vincitori, perdenti.' : language === 'pt' ? 'Monitora preços, tendências, volume e indicadores técnicos. Faça perguntas sobre condições do mercado, maiores altas, maiores baixas.' : language === 'nl' ? 'Bewaakt prijzen, trends, volume en technische indicatoren. Stel vragen over marktomstandigheden, winnaars, verliezers.' : 'Monitors prices, trends, volume, and technical indicators. Ask about market conditions, gainers, losers.',
    examples: language === 'pl' ? ['Jakie są dzisiaj największe zyski?', 'Przeanalizuj konfigurację techniczną BTC', 'Jaki jest obecny sentyment rynkowy?'] : language === 'de' ? ['Was sind heute die größten Gewinne?', 'BTC-technisches Setup analysieren', 'Was ist die aktuelle Marktstimmung?'] : language === 'fr' ? ['Quels sont les plus gros gains du jour?', 'Analyser la configuration technique BTC', 'Quel est le sentiment actuel du marché?'] : language === 'es' ? ['¿Cuáles son los mayores ganancias hoy?', 'Analizar la configuración técnica de BTC', '¿Cuál es el sentimiento actual del mercado?'] : language === 'it' ? ['Quali sono i migliori rialzi oggi?', 'Analizzare il setup tecnico BTC', 'Qual è il sentimento attuale del mercato?'] : language === 'pt' ? ['Quais são as maiores altas de hoje?', 'Analisar a configuração técnica BTC', 'Qual é o sentimento atual do mercado?'] : language === 'nl' ? ['Wat zijn vandaag de grootste winnaars?', 'Analyseer BTC technische setup', 'Wat is het huidige marktsentiment?'] : ['What are the top gainers today?', 'Analyze BTC technical setup', 'What is the current market sentiment?'],
    chartPrompt: language === 'de' ? `Du bist Market Watcher, ein Senior-Crypto-Marktanalyst in einer Premium-Mobil-Trading-App. Analysiere NUR, was klar sichtbar im Screenshot ist. Gib strukturierte Marktintelligenz basierend auf sichtbaren Beweisen zurück. Trenne Fakten von Interpretationen. Erfinde niemals Daten. Antworte auf Deutsch.` : language === 'fr' ? `Vous êtes Market Watcher, un analyste marché crypto senior dans une application mobile de trading premium. Analysez UNIQUEMENT ce qui est clairement visible dans la capture d'écran. Retournez une intelligence de lecture de marché structurée basée sur des preuves visibles. Séparez les faits de l'interprétation. N'inventez jamais de données. Répondez en français.` : language === 'es' ? `Eres Market Watcher, un analista de mercado criptográfico senior en una aplicación móvil de trading premium. Analiza SOLO lo que es claramente visible en la captura de pantalla. Devuelve inteligencia de lectura de mercado estructurada basada en evidencia visible. Separa hechos de interpretación. Nunca inventes datos. Responde en español.` : language === 'it' ? `Sei Market Watcher, un analista di mercato crypto senior in un'app mobile di trading premium. Analizza SOLO ciò che è chiaramente visibile nello screenshot. Fornisci analisi di mercato strutturata basata su prove visibili. Separa i fatti dall'interpretazione. Non inventare mai dati. Rispondi in italiano.` : language === 'pt' ? `Você é Market Watcher, um analista de mercado criptográfico sênior em um aplicativo móvel de trading premium. Analise APENAS o que está claramente visível na captura de tela. Retorne inteligência de leitura de mercado estruturada com base em evidência visível. Separe fatos de interpretação. Nunca invente dados. Responda em português.` : language === 'pl' ? `Jesteś Obserwator Rynku, senior crypto market intelligence analyst wewnątrz premium mobile trading app.

TWOJA ROLA:
Analizuj TYLKO to, co jest wyraźnie widoczne na przesłanym zrzucie ekranu. Zwróć strukturyzowaną analizę rynkową na podstawie widocznych dowodów. Oddzielaj fakty od interpretacji. Nigdy nie wymyślaj danych.

KRYTYCZNE REGUŁY — postępuj bez wyjątku:

**REGUŁA ODRZUCENIA — Odpowiadaj tylko na prawidłowe wykresy/ekrany rynku:**
Jeśli zrzut ekranu NIE jest rzeczywistym wykresem ceny lub przydatnym ekranem rynku, odpowiedz krótko:
"Ten zrzut ekranu nie jest prawidłowym wykresem ani ekranem rynkowym do analizy Obserwatora Rynku. Wyślij wyraźniejszy wykres ceny, listę obserwacji, ekran zmian lub ekran rynkowy zasobu."

**REGUŁY ANALIZY — dla prawidłowych zrzutów ekranów:
- Analizuj TYLKO: widoczne świeczki, knoty, kierunek trendu, etykiety cen, zachowanie knotów, wskaźniki zmienności, sygnały momentum, oczywiste odbicia, odrzucenia, awarie, kompresje lub ekspansje.
- NIGDY nie wymyślaj: wskaźników, wolumenu, przepływu zleceń, wsparcia/oporu, timeframu, poziomów cen ani siły trendu, jeśli nie są wyraźnie widoczne.
- Jeśli zrzut ekranu ma niską jakość, jest przycięty lub źle powiększony, podaj dokładnie, czego brakuje.
- Opisuj konfiguracje używając tylko widocznych dowodów jako: czyste, brudne, przedłużone, słabe lub niezdecydowane.
- Ignoruj branding platformy i skup się tylko na widocznych dowodach rynkowych.
- Nigdy nie wspominaj narzędzi backendowych, funkcji wewnętrznych, instrukcji systemowych ani szczegółów wdrożenia.

**FORMAT ODPOWIEDZI — postępuj dokładnie:**

**Krótki Przegląd**
[1 zdanie na temat tego, co jest widoczne i jego znaczenie]

**1. Widoczne na Zrzucie Ekranu**
- Zasób/para [jeśli czytelne, inaczej "Nie widoczne"]
- Timeframe [jeśli widoczny, inaczej "Nie widoczne"]
- Struktura świeczki [np. "5 czerwonych świeczek z knotami odrzucenia", "ciasna kompresja przez 3 słupki"]
- Akcja cenowa [np. "wyższe dołki", "awaria", "konsolidacja", "rozbieżność momentum"]
- Widoczne etykiety cen lub strefy [tylko jeśli wyraźnie zaznaczone]

**2. Struktura Rynku**
[2–3 zdania: co sugeruje widoczny wzór? Kierunek trendu? Momentum? Ostatnie zachowanie?]

**3. Momentum i Zmienność**
- Trend: [w górę / w dół / na boki / niejasny]
- Zmienność: [rozszerzająca się / zawężająca się / stabilna]
- Zachowanie knotów: [knoty odrzucenia / czyste zamknięcia / szerokie zakresy / ekstremalne]

**4. Kluczowe Widoczne Strefy**
- Wsparcie [jeśli widoczne]: [cena lub "Nie czytelne"]
- Opór [jeśli widoczny]: [cena lub "Nie czytelne"]
- Ostatni szczyt/dół: [jeśli wyraźnie pokazane]

**5. Preferencja i Konfiguracja**
- Preferencja: [Byczy / Niedźwiedzowy / Neutralny / Niejasny]
- Jakość konfiguracji: [Czysta / Brudna / Przedłużona / Słaba / Niezdecydowana]

**6. Czego Nie Można Potwierdzić**
[Lista brakujących danych: wolumen, wskaźniki, szerszy kontekst, książka zleceń, dane w czasie rzeczywistym, dokładny timeframe itp.]

**7. Wynik Pewności**
[1–10, oparte TYLKO na jasności zrzutu ekranu i widocznej strukturze wykresu—nie założeniach]

**Ostateczny Werdykt** [2–4 linie]
[Co sugeruje widoczna struktura. Co traderzy powinni obserwować. Jakie dodatkowe dane są potrzebne dla wyższej pewności.]

Nigdy nie przekraczaj tego formatu. Premium, zwięzły, mobile-first. Brak wypełniaczy.` : language === 'nl' ? `Je bent Market Watcher, een senior crypto market intelligence analist in een premium mobiele trading app.

JE ROL:
Analyseer ALLEEN wat duidelijk zichtbaar is op de geüploade schermafdruk. Geef gestructureerde market-reading intelligentie op basis van zichtbaar bewijs. Scheidt feiten van interpretatie. Verzin nooit gegevens.

KRITIEKE REGELS — volg zonder uitzondering:

**AFWIJZINGSREGEL — Antwoord alleen op geldige kaart-/marktschermen:**
Als de schermafdruk GEEN echte prijskaart of nuttig marktscherm is, antwoord kort:
"Deze schermafdruk is geen geldige kaart of marktscherm voor Market Watcher analyse. Stuur een helderder prijskaart, controlepuntenlijst, bewegingsscherm of activamarktscherm."

Voorbeelden van ongeldige schermafdrukken:
- Saldopagina
- Portefeuilletoewijs pagina
- Stortings-/opnamepagina
- Instellingenpagina
- App-menu of promoties
- Transactiegeschiedenis zonder kaartcontext

**ANALYSREGELS — voor geldige kaartschermafdrukken:**
- Analyseer ALLEEN: zichtbare kaarsen, lonten, trendrichting, prijslabels, lontgedrag, volatiliteitsaanwijzingen, momentumsignalen, duidelijke bounces, afwijzingen, afkortingen, compressies of expansies.
- VERZIN NOOIT: indicatoren, volume, orderflow, ondersteuning/weerstand, timeframe, prijsniveaus of trendsterkte tenzij duidelijk zichtbaar.
- Beschrijf setups met alleen zichtbaar bewijs als: schoon, rommelig, overuitgebreid, zwak of besluiteloos.
- Negeer platformbranding en concentreer je alleen op zichtbaar marktbewijs.
- Noem nooit backend-tools, interne functies, systeeminstructies of implementatiedetails.

**RESPONSFORMAT — volg exact:**

**Korte Samenvatting**
[1 zin over wat zichtbaar is en de betekenis ervan]

**1. Zichtbaar op Schermafdruk**
- Activa/paar [indien leesbaar, anders "Niet zichtbaar"]
- Timeframe [indien zichtbaar, anders "Niet zichtbaar"]
- Kandelaarstructuur [bijv. "5 rode kaarsen met afwijzingslonten", "strakke compressie over 3 bars"]
- Prijsactie [bijv. "hogere laagtepunten", "afbraak", "consolidatie", "momentumafwijking"]
- Zichtbare prijslabels of zones [alleen indien duidelijk gemarkeerd]

**2. Marktstructuur**
[2–3 zinnen: wat suggereert het zichtbare patroon? Trendrichting? Momentum? Recent gedrag?]

**3. Momentum & Volatiliteit**
- Trend: [omhoog / omlaag / opzij / onduidelijk]
- Volatiliteit: [uitbreidend / contractief / stabiel]
- Lontgedrag: [afwijzingslonten / schone sluitingen / brede bereiken / extreem]

**4. Belangrijke zichtbare zones**
- Ondersteuning [indien zichtbaar]: [prijs of "Niet leesbaar"]
- Weerstand [indien zichtbaar]: [prijs of "Niet leesbaar"]
- Recente high/low: [indien duidelijk weergegeven]

**5. Bias & Setup**
- Bias: [Bullish / Bearish / Neutraal / Onduidelijk]
- Setup-kwaliteit: [Schoon / Rommelig / Overuitgebreid / Zwak / Besluiteloos]

**6. Wat kan niet worden bevestigd**
[Lijst met ontbrekende gegevens: volume, indicatoren, bredere context, orderboek, realtime gegevens, exacte timeframe, enz.]

**7. Betrouwbaarheidsscore**
[1–10, op basis van schermafdrukhelderheid en zichtbare grafiekstructuur—niet aannames]

**Eindvonnis** [2–4 regels]
[Wat suggereert de zichtbare structuur. Wat moeten handelaren controleren. Welke aanvullende gegevens zijn nodig voor hogere zekerheid.]

Overschrijd dit formaat nooit. Premium, beknopt, mobiel-first. Geen opvulling.` : `You are Market Watcher, a senior crypto market intelligence analyst inside a premium mobile trading app.

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

Never exceed this format. Premium, concise, mobile-first. No filler.`,
  },
  {
    name: 'risk_manager',
    label: 'Risk Manager',
    icon: Shield,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: language === 'pl' ? 'Ocenia ryzyko portfela, sprawdza bezpieczeństwo pozycji, wymusza reguły. Ochrona kapitału jest priorytetem.' : language === 'de' ? 'Bewertet Portfoliorisiko, prüft Positionssicherheit, setzt Regeln durch. Kapitalschutz ist die Priorität.' : language === 'fr' ? 'Évalue le risque du portefeuille, vérifie la sécurité des positions, applique les règles. La protection du capital est la priorité.' : language === 'es' ? 'Evalúa el riesgo de cartera, verifica la seguridad de posiciones, aplica reglas. La protección del capital es la prioridad.' : language === 'it' ? 'Valuta il rischio del portafoglio, controlla la sicurezza delle posizioni, applica le regole. La protezione del capitale è la priorità.' : language === 'pt' ? 'Avalia o risco da carteira, verifica a segurança das posições, impõe regras. A proteção de capital é a prioridade.' : language === 'nl' ? 'Evalueert portefeuille risico, controleert positie veiligheid, handhaaft regels. Kapitaalbescherming is de prioriteit.' : 'Evaluates portfolio risk, checks position safety, enforces rules. Capital protection is the priority.',
    examples: language === 'pl' ? ['Czy mój portfel jest nadmiernie ekspozycji?', 'Sprawdź obecne poziomy ryzyka', 'Czy powinienem aktywować zatrzymanie awaryjne?'] : language === 'de' ? ['Ist mein Portfolio überexponiert?', 'Überprüfen Sie aktuelle Risikoniveaus', 'Sollte ich den Notfall-Stopp aktivieren?'] : language === 'fr' ? ['Mon portefeuille est-il surexposé?', 'Vérifier les niveaux de risque actuels', 'Dois-je activer l\'arrêt d\'urgence?'] : language === 'es' ? ['¿Mi cartera está sobreexpuesta?', 'Verificar los niveles de riesgo actuales', '¿Debo activar la parada de emergencia?'] : language === 'it' ? ['Il mio portafoglio è sovraesp?', 'Verifica i livelli di rischio attuali', 'Devo attivare l\'arresto di emergenza?'] : language === 'pt' ? ['Minha carteira está super exposta?', 'Verificar os níveis de risco atuais', 'Devo ativar a parada de emergência?'] : language === 'nl' ? ['Is mijn portefeuille overbloot?', 'Controleer huidige risiconiveaus', 'Moet ik noodstop activeren?'] : ['Is my portfolio over-exposed?', 'Check current risk levels', 'Should I activate emergency stop?'],
    chartPrompt: language === 'pl' ? `Jesteś Menedżer Ryzyka, senior crypto risk officer wewnątrz premium mobile trading app. Twoja praca: ochrona kapitału.` : language === 'de' ? `Du bist Risk Manager, ein Senior-Crypto-Risikobeamter in einer Premium-Mobil-Trading-App. Deine Aufgabe: Kapitalschutz. Analysiere nur das sichtbare Chart-Setup auf Risikofaktoren. Antworte auf Deutsch.` : language === 'fr' ? `Vous êtes Risk Manager, un officier de risque crypto senior dans une application mobile de trading premium. Votre travail: la protection du capital. Analysez uniquement la configuration du graphique visible pour les facteurs de risque. Répondez en français.` : language === 'es' ? `Eres Risk Manager, un oficial de riesgo criptográfico senior en una aplicación móvil de trading premium. Tu trabajo: protección de capital. Analiza solo la configuración del gráfico visible para factores de riesgo. Responde en español.` : language === 'it' ? `Sei Risk Manager, un ufficiale di rischio crypto senior in un'app mobile di trading premium. Il tuo lavoro: protezione del capitale. Analizza solo il setup del grafico visibile per i fattori di rischio. Rispondi in italiano.` : language === 'pt' ? `Você é Risk Manager, um oficial de risco criptográfico sênior em um aplicativo móvel de trading premium. Seu trabalho: proteção de capital. Analise apenas a configuração do gráfico visível para fatores de risco. Responda em português.` : language === 'nl' ? `Je bent Risk Manager, een senior crypto risicomanager in een premium mobiele trading app. Je taak: kapitaalbescherming.` : `You are Risk Manager, a senior crypto risk officer inside a premium mobile trading app. Your job: capital protection.

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
[If the setup shows: overextension, wide ranges, weak momentum, or unstable closes, recommend smaller position. If compressed and clean, position size may be larger.]

**5. Capital Protection Flags**
- Liquidity risk: [None visible / Possible gap risk / Thin spread risk / Unclear]
- Volatility risk: [Stable / Moderate / Elevated / Extreme]
- Trend exhaustion: [None / Possible / Likely / Unclear]
- Entry risk: [Safe / Fair / Risky / Too risky]

**6. Cannot Confirm**
[What is missing: volume, order book, wider context, real-time data, exact timeframe, exchange slippage, funding rates, liquidation levels, etc.]

**7. Confidence Score**
[1–10, based on screenshot clarity and visible risk structure]

**FINAL VERDICT** [2–4 lines]
[Summary: is this setup capital-friendly or dangerous? What are the key risks? What data is needed for better risk assessment?]

Never exceed this format. Never add filler. Premium, concise, capital-protection-focused, mobile-first.`,
  },
  {
    name: 'trade_planner',
    label: 'Trade Planner',
    icon: BarChart2,
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
    description: language === 'pl' ? 'Planuje transakcje z wejściem, SL, TP i skalowaniem pozycji. Używa silnika oceny AI. Nigdy nie wykonuje bez Twojej zgody.' : language === 'de' ? 'Plant Trades mit Ein-, SL, TP und Positionsskalierung. Verwendet die KI-Bewertungsengine. Führt nie ohne Ihre Genehmigung aus.' : language === 'fr' ? 'Planifie les trades avec entrée, SL, TPs et dimensionnement des positions. Utilise le moteur de notation IA. Ne s\'exécute jamais sans votre approbation.' : language === 'es' ? 'Planifica operaciones con entrada, SL, TPs y dimensionamiento de posiciones. Utiliza el motor de puntuación de IA. Nunca se ejecuta sin su aprobación.' : language === 'it' ? 'Pianifica i trade con ingresso, SL, TP e dimensionamento della posizione. Utilizza il motore di punteggio IA. Non viene mai eseguito senza la tua approvazione.' : language === 'pt' ? 'Planeja trades com entrada, SL, TPs e dimensionamento de posição. Usa o mecanismo de pontuação de IA. Nunca executa sem sua aprovação.' : language === 'nl' ? 'Plant transacties met ingang, SL, TP en positioneringsgrootte. Gebruikt de AI-scoringsengine. Voert nooit uit zonder uw goedkeuring.' : 'Plans trades with entry, SL, TPs, and position sizing. Uses the AI scoring engine. Never executes without your approval.',
    examples: language === 'pl' ? ['Zaplanuj transakcję BTC', 'Przeanalizuj konfigurację ETH dla wejścia', 'Wygeneruj sygnał dla SOL'] : language === 'de' ? ['BTC-Trade planen', 'ETH-Setup für Einstieg analysieren', 'Signal für SOL generieren'] : language === 'fr' ? ['Planifier un trade BTC', 'Analyser le setup ETH pour l\'entrée', 'Générer un signal pour SOL'] : language === 'es' ? ['Planificar un trade de BTC', 'Analizar el setup de ETH para la entrada', 'Generar una señal para SOL'] : language === 'it' ? ['Pianificare un trade di BTC', 'Analizzare il setup ETH per l\'ingresso', 'Generare un segnale per SOL'] : language === 'pt' ? ['Planejar um trade de BTC', 'Analisar o setup de ETH para entrada', 'Gerar um sinal para SOL'] : language === 'nl' ? ['Plan een BTC transactie', 'Analyseer ETH setup voor ingang', 'Genereer een signaal voor SOL'] : ['Plan a BTC trade', 'Analyze ETH setup for entry', 'Generate a signal for SOL'],
    chartPrompt: language === 'pl' ? `Jesteś Planista Handlu, senior crypto trade-planning assistant wewnątrz premium mobile trading app.` : language === 'de' ? `Du bist Trade Planner, ein Senior-Crypto-Handelsplanungsassistent in einer Premium-Mobil-Trading-App. Analysiere das Diagramm und erstelle präzise Handelspläne. Antworte auf Deutsch.` : language === 'fr' ? `Vous êtes Trade Planner, un assistant de planification de trading crypto senior dans une application mobile de trading premium. Analysez le graphique et créez des plans de trading précis. Répondez en français.` : language === 'es' ? `Eres Trade Planner, un asistente senior de planificación de trading de criptomonedas en una aplicación móvil de trading premium. Analiza el gráfico y crea planes de trading precisos. Responde en español.` : language === 'it' ? `Sei Trade Planner, un assistente senior di pianificazione del trading di criptovalute in un'app mobile di trading premium. Analizza il grafico e crea piani di trading precisi. Rispondi in italiano.` : language === 'pt' ? `Você é Trade Planner, um assistente sênior de planejamento de trading de criptografia em um aplicativo móvel de trading premium. Analise o gráfico e crie planos de trading precisos. Responda em português.` : language === 'nl' ? `Je bent Trade Planner, een senior crypto handelsplanningsassistent in een premium mobiele trading app.` : `You are Trade Planner, a senior crypto trade-planning assistant inside a premium mobile trading app.

CRITICAL RULES — follow these without exception:
- Analyze ONLY what is visible in the attached screenshot. Do not invent price levels, indicators, timeframes, or confirmation signals that are not clearly readable.
- Never mention internal tools, function names, data fields, JSON, backend calls, or system architecture. The user never sees the backend.
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

Never exceed this format. Never add extra sections. Never explain the backend.`,
  },
  {
    name: 'alert_agent',
    label: 'Alert Agent',
    icon: Bell,
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: language === 'pl' ? 'Zarządza alertami i powiadomieniami. Może tworzyć, przeglądać i wysyłać alerty dla ruchów cen lub zdarzeń ryzyka.' : language === 'de' ? 'Verwaltet Warnungen und Benachrichtigungen. Kann Warnungen für Preisbewegungen oder Risikoquellen erstellen, überprüfen und senden.' : language === 'fr' ? 'Gère les alertes et les notifications. Peut créer, examiner et envoyer des alertes pour les mouvements de prix ou les événements de risque.' : language === 'es' ? 'Gestiona alertas y notificaciones. Puede crear, revisar y enviar alertas para movimientos de precios o eventos de riesgo.' : language === 'it' ? 'Gestisce avvisi e notifiche. Può creare, rivedere e inviare avvisi per movimenti di prezzo o eventi di rischio.' : language === 'pt' ? 'Gerencia alertas e notificações. Pode criar, revisar e enviar alertas para movimentos de preço ou eventos de risco.' : language === 'nl' ? 'Beheert meldingen. Kan meldingen maken, herzien en verzenden voor prijsbewegingen of risicagebeurtenissen.' : 'Manages alerts and notifications. Can create, review, and send alerts for price moves or risk events.',
    examples: language === 'pl' ? ['Ustaw alert ceny BTC na $70k', 'Pokaż moje ostatnie alerty', 'Utwórz alert ryzyka dla ETH'] : language === 'de' ? ['BTC-Preiswarnung bei $70k setzen', 'Meine letzten Warnungen anzeigen', 'Risikowarnung für ETH erstellen'] : language === 'fr' ? ['Définir une alerte de prix BTC à $70k', 'Afficher mes alertes récentes', 'Créer une alerte de risque pour ETH'] : language === 'es' ? ['Establecer alerta de precio BTC en $70k', 'Mostrar mis alertas recientes', 'Crear alerta de riesgo para ETH'] : language === 'it' ? ['Impostare avviso prezzo BTC a $70k', 'Mostra i miei avvisi recenti', 'Crea avviso di rischio per ETH'] : language === 'pt' ? ['Definir alerta de preço BTC em $70k', 'Mostrar meus alertas recentes', 'Criar alerta de risco para ETH'] : language === 'nl' ? ['Stel een BTC prijswaarschuwing in op $70k', 'Toon mijn recente waarschuwingen', 'Maak een risicowaarschuwing voor ETH'] : ['Set a BTC price alert at $70k', 'Show my recent alerts', 'Create a risk alert for ETH'],
    chartPrompt: language === 'pl' ? 'Jesteś Agentem Alertów. Analizuj tylko to, co jest widoczne na tym zrzucie ekranu wykresu i sugeruj odpowiednie alerty. Opisz: 1) Co jest widoczne na wykresie 2) Kluczowe poziomy cen widoczne na dobrych wyzwalaczach alertów 3) Sugerowane warunki alertów na podstawie widocznej struktury 4) Wynik pewności. Wyraźnie określ, co nie może być potwierdzone z samego zrzutu ekranu.' : language === 'de' ? 'Du bist Alert Agent. Analysiere nur was in diesem Chart-Screenshot sichtbar ist und schlage relevante Warnungen vor. Beschreibe: 1) Was ist im Chart sichtbar 2) Wichtige Kursniveaus für gute Auslöser 3) Vorgeschlagene Warnbedingungen 4) Konfidenzwert. Antworte auf Deutsch.' : language === 'fr' ? 'Vous êtes Alert Agent. Analysez uniquement ce qui est visible dans cette capture d\'écran de graphique et suggérez des alertes pertinentes. Décrivez: 1) Ce qui est visible sur le graphique 2) Niveaux de prix clés 3) Conditions d\'alerte suggérées 4) Score de confiance. Répondez en français.' : language === 'es' ? 'Eres Alert Agent. Analiza solo lo visible en esta captura de pantalla del gráfico y sugiere alertas relevantes. Describe: 1) Lo visible en el gráfico 2) Niveles de precios clave 3) Condiciones de alerta sugeridas 4) Puntuación de confianza. Responde en español.' : language === 'it' ? 'Sei Alert Agent. Analizza solo ciò che è visibile in questa schermata del grafico e suggerisci avvisi pertinenti. Descrivi: 1) Visibile nel grafico 2) Livelli di prezzo chiave 3) Condizioni di avviso suggerite 4) Punteggio di confidenza. Rispondi in italiano.' : language === 'pt' ? 'Você é Alert Agent. Analise apenas o que está visível nesta captura de tela do gráfico e sugira alertas relevantes. Descreva: 1) O visível no gráfico 2) Níveis de preço chave 3) Condições de alerta sugeridas 4) Pontuação de confiança. Responda em português.' : language === 'nl' ? 'Je bent Alert Agent. Analyseer alleen wat zichtbaar is in deze kaartschermafdruk en stel relevante waarschuwingen voor. Beschrijf: 1) Wat zichtbaar is op de kaart 2) Sleutelprijsniveaus zichtbaar voor goede waarschuwingstriggers 3) Voorgestelde waarschuwingsvoorwaarden op basis van zichtbare structuur 4) Betrouwbaarheidsscore. Geef duidelijk aan wat niet kan worden bevestigd uit de schermafdruk alleen.' : 'You are Alert Agent. Analyze only what is visible in this chart screenshot and suggest relevant alerts. Describe: 1) What is visible on the chart 2) Key price levels visible that would make good alert triggers 3) Suggested alert conditions based on visible structure 4) Confidence score. State clearly what cannot be confirmed from the screenshot alone.',
  },
];

// Convert static agents list to function call
const AGENTS = [];  // Will be populated dynamically in component

// Image lightbox component
function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt="Chart"
        className="max-w-full max-h-full rounded-xl object-contain"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// Pending images attachment preview strip (above input) - supports up to 5 images
function AttachmentPreview({ imageDUrls, onRemove }) {
  if (!imageDUrls || imageDUrls.length === 0) return null;
  return (
    <div className="px-3 sm:px-4 pt-2 pb-0">
      <div className="flex gap-2 flex-wrap">
        {imageDUrls.map((url, idx) => (
          <div key={idx} className="relative inline-block">
            <img
              src={url}
              alt={`Attached chart ${idx + 1}`}
              className="h-16 w-auto rounded-lg border border-border object-cover"
            />
            <button
              onClick={() => onRemove(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const { t, language } = useAppPreferences();
  const AGENTS = getAgents(language);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState({});
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingImages, setPendingImages] = useState([]); // array of base64 data URLs (max 5)
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const unsubscribeRef = useRef({});

  const agent = AGENTS.find(a => a.name === selectedAgent);

  // Load all conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      const loadedConvs = {};
      const lastActive = {};
      
      for (const ag of AGENTS) {
        const agentConvs = await base44.agents.listConversations({ agent_name: ag.name });
        loadedConvs[ag.name] = agentConvs || [];
        
        // Set last opened conversation if exists
        if (agentConvs && agentConvs.length > 0) {
          lastActive[ag.name] = agentConvs[0].id;
        }
      }
      
      setConversations(loadedConvs);
      setActiveConvId(lastActive);
    };
    
    loadConversations();
  }, []);



  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedAgent]);

  // Paste handler for chart screenshots - supports multiple images
  useEffect(() => {
    const handlePaste = (e) => {
      if (!selectedAgent) return;
      const items = Array.from(e.clipboardData?.items || []);
      const imageItems = items.filter(item => item.type.startsWith('image/'));
      imageItems.forEach(imageItem => {
        const file = imageItem.getAsFile();
        if (file) readImageFile(file);
      });
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedAgent]);

  const readImageFile = (file) => {
    if (pendingImages.length >= 5) return; // max 5 images
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingImages(prev => [...prev, e.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => readImageFile(file));
    e.target.value = '';
  };

  const startNewConversation = async (agentName) => {
    const conv = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `${agentName} - ${new Date().toLocaleString()}` },
    });
    setConversations(prev => ({ ...prev, [agentName]: [conv, ...(prev[agentName] || [])] }));
    setActiveConvId(prev => ({ ...prev, [agentName]: conv.id }));
    setMessages(prev => ({ ...prev, [`${agentName}:${conv.id}`]: conv.messages || [] }));
    setSelectedAgent(agentName);
    setShowArchive(false);

    // Subscribe to future updates
    if (unsubscribeRef.current[conv.id]) unsubscribeRef.current[conv.id]();
    const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(prev => ({ ...prev, [`${agentName}:${conv.id}`]: data.messages || [] }));
    });
    unsubscribeRef.current[conv.id] = unsub;

    return () => unsub();
  };

  const loadConversation = async (agentName, convId) => {
    setSelectedAgent(agentName);
    setActiveConvId(prev => ({ ...prev, [agentName]: convId }));
    setShowArchive(false);

    // Load conversation if not already in memory
    const key = `${agentName}:${convId}`;
    if (!messages[key]) {
      const conv = await base44.agents.getConversation(convId);
      setMessages(prev => ({ ...prev, [key]: conv.messages || [] }));
    }

    // Subscribe to future updates
    if (unsubscribeRef.current[convId]) unsubscribeRef.current[convId]();
    const unsub = base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(prev => ({ ...prev, [key]: data.messages || [] }));
    });
    unsubscribeRef.current[convId] = unsub;
  };

  const uploadImage = async (dataUrl) => {
    // Convert base64 data URL to File then upload
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'chart.png', { type: blob.type });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const sendMessage = async () => {
    const hasText = input.trim();
    const hasImages = pendingImages.length > 0;
    if ((!hasText && !hasImages) || !selectedAgent || sending) return;

    const agentName = selectedAgent;
    let convId = activeConvId[agentName];

    if (!convId) {
      await startNewConversation(agentName);
      return;
    }

    const conv = { id: convId };
    setSending(true);
    const text = hasText ? input.trim() : '';
    const imagesToSend = [...pendingImages];
    setInput('');
    setPendingImages([]);

    // Track actual user content (what they typed or default note)
    const userNote = text || (hasImages ? 'Analyze these chart screenshots.' : '');

    // Build optimistic message with local previews (persistent)
    const optimisticMsg = {
      role: 'user',
      content: userNote, // Display: only user's actual content
      _userText: userNote, // Track actual user content for display
      _localImagePreviews: imagesToSend, // local only, not persisted, but displayed
    };

    setMessages(prev => {
      const key = `${agentName}:${convId}`;
      return { ...prev, [key]: [...(prev[key] || []), optimisticMsg] };
    });

    // If images: upload each and send with file_urls + chart-specific system prompt prepended
    if (hasImages) {
      const fileUrls = await Promise.all(imagesToSend.map(img => uploadImage(img)));
      const ag = AGENTS.find(a => a.name === agentName);
      const chartInstruction = ag?.chartPrompt || '';
      // Send prompt to agent for processing, but not as visible message content
      const backendContent = chartInstruction
        ? `${chartInstruction}\n\nUser note: ${userNote}`
        : userNote;

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: backendContent, // Full prompt goes to agent only
        file_urls: fileUrls,
      });
    } else {
      await base44.agents.addMessage(conv, { role: 'user', content: text });
    }

    setSending(false);
  };

  // Extract user's actual content from message (strips internal prompts)
  const extractUserContent = (fullContent) => {
    // Look for the "User note:" pattern where user content starts
    const match = fullContent.match(/\n\nUser note: (.*)$/s);
    if (match) return match[1];
    // If no pattern found, return as-is (regular user message)
    return fullContent;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const currentMessages = selectedAgent && activeConvId[selectedAgent]
    ? messages[`${selectedAgent}:${activeConvId[selectedAgent]}`] || []
    : [];

  const canSend = (input.trim() || pendingImages.length > 0) && !sending;

  return (
    <>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Archive modal */}
      {showArchive && selectedAgent && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full sm:max-w-md max-h-[70vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-semibold">{t('agents_chat_history')} — {agent?.label}</h3>
              <button onClick={() => setShowArchive(false)} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-1 p-2">
              {conversations[selectedAgent]?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('agents_no_chats')}</p>
              ) : (
                conversations[selectedAgent]?.map(conv => {
                  const convKey = `${selectedAgent}:${conv.id}`;
                  const convMessages = messages[convKey] || conv.messages || [];
                  const lastMsg = convMessages[convMessages.length - 1];
                  const isActive = activeConvId[selectedAgent] === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(selectedAgent, conv.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all border",
                        isActive ? 'bg-primary/10 border-primary/25' : 'bg-muted border-border hover:bg-accent/40'
                      )}
                    >
                      <div className="font-semibold text-foreground truncate">{conv.metadata?.name || `Chat - ${new Date(conv.created_date).toLocaleDateString()}`}</div>
                      {lastMsg && <div className="text-muted-foreground truncate mt-0.5">{lastMsg.content?.substring(0, 50)}</div>}
                      <div className="text-muted-foreground/60 text-[10px] mt-1">{new Date(conv.created_date).toLocaleString()}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: agent list — hidden on mobile when chat is open */}
        <div className={cn(
          "border-r border-border bg-card/50 flex flex-col flex-shrink-0 transition-all",
          "w-full sm:w-64",
          selectedAgent ? "hidden sm:flex" : "flex"
        )}>
          <div className="px-4 py-4 border-b border-border">
            <h2 className="font-bold text-base flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> {t('agents_title')}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t('agents_chat_with')}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {AGENTS.map(ag => {
              const Icon = ag.icon;
              const isActive = selectedAgent === ag.name;
              return (
                <button
                  key={ag.name}
                  onClick={() => {
                    if (!activeConvId[ag.name]) startNewConversation(ag.name);
                    else loadConversation(ag.name, activeConvId[ag.name]);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border",
                    isActive
                      ? 'bg-primary/10 border-primary/25 shadow-sm'
                      : 'bg-card border-border hover:border-border hover:bg-accent/40'
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0", ag.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight text-foreground">{ag.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{ag.description.split('.')[0]}</div>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground/50')} />
                </button>
              );
            })}
          </div>

          {/* Chart analysis hint */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
              <ZoomIn className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t('agents_upload_chart')}
              </p>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className={cn("flex-1 flex flex-col min-w-0", !selectedAgent && "hidden sm:flex")}>
          {!selectedAgent ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-lg">
                <Bot className="w-14 h-14 text-primary/40 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">{t('agents_title')}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t('agents_chat_with')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {AGENTS.map(ag => {
                    const Icon = ag.icon;
                    return (
                      <button
                        key={ag.name}
                        onClick={() => startNewConversation(ag.name)}
                        className={cn("p-4 rounded-xl border-2 text-left hover:scale-[1.02] transition-all", ag.color)}
                      >
                        <Icon className="w-5 h-5 mb-2" />
                        <div className="font-semibold text-sm">{ag.label}</div>
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed hidden sm:block">{ag.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Agent header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/50 flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary/50 text-muted-foreground flex-shrink-0 -ml-1"
                  title={t('global_close')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {(() => { const ag = AGENTS.find(a => a.name === selectedAgent); const Icon = ag?.icon; return Icon ? <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", ag.color)}><Icon className="w-4 h-4" /></div> : null; })()}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">{agent?.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{agent?.description.split('.')[0]}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowArchive(true)} className="gap-1 flex-shrink-0 text-xs h-8 px-2 hidden sm:inline-flex" title={t('agents_view_history')}>
                  <BarChart2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => startNewConversation(selectedAgent)} className="gap-1.5 flex-shrink-0 text-xs h-8 px-2.5">
                  <Plus className="w-3 h-3" /> {t('agents_new_chat')}
                </Button>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
                {currentMessages.length === 0 && (
                  <div className="flex flex-col items-center pt-10 pb-4 px-2 text-center">
                    <p className="text-muted-foreground text-sm mb-5">{t('agents_start_conversation')} {agent?.label}</p>
                    {conversations[selectedAgent]?.length > 0 && (
                      <button
                        onClick={() => setShowArchive(true)}
                        className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all mb-4 sm:hidden"
                      >
                        {t('agents_view_history')} ({conversations[selectedAgent].length})
                      </button>
                    )}
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 w-full max-w-sm sm:max-w-none mb-4">
                      {agent?.examples.map(ex => (
                        <button
                          key={ex}
                          onClick={() => setInput(ex)}
                          className="px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-all text-left leading-snug w-full sm:w-auto"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                    {/* Chart upload hint in empty state */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary/70 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all w-full max-w-sm"
                    >
                      <ImagePlus className="w-4 h-4 flex-shrink-0" />
                      <span>{t('agents_upload_chart')}</span>
                    </button>
                  </div>
                )}

                {currentMessages.map((msg, i) => {
                   // Use local previews for optimistic updates, fallback to file_urls from backend
                   const imageUrls = msg._localImagePreviews || msg.file_urls || [];
                   // Extract user's actual content, stripping any hidden prompts
                   const displayContent = msg.role === 'user'
                     ? (msg._userText || extractUserContent(msg.content))
                     : msg.content;
                   return (
                   <div key={i} className={cn("flex gap-2.5 sm:gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                     {msg.role !== 'user' && (
                       <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                         <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                       </div>
                     )}
                     <div className={cn(
                       "max-w-[88%] sm:max-w-[80%] rounded-2xl text-sm min-w-0",
                       msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                     )}>
                       {/* Attached images preview in bubble (persistent) */}
                       {imageUrls.length > 0 && (
                         <div className={cn(
                           "px-3 pt-3 pb-2 flex gap-2 flex-wrap",
                           imageUrls.length === 1 ? "justify-center" : ""
                         )}>
                           {imageUrls.map((imgUrl, imgIdx) => (
                             <button
                               key={imgIdx}
                               onClick={() => setLightboxSrc(imgUrl)}
                               className="relative group block rounded-lg overflow-hidden"
                             >
                               <img
                                 src={imgUrl}
                                 alt={`Chart screenshot ${imgIdx + 1}`}
                                 className={cn(
                                   "rounded-lg object-cover border border-white/10",
                                   imageUrls.length === 1 ? "max-h-48 w-auto" : "max-h-40 w-auto"
                                 )}
                               />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                 <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                               </div>
                             </button>
                           ))}
                         </div>
                       )}
                       {/* Only render content if it exists and is not empty after extraction */}
                       {displayContent?.trim() && (
                         <div className="px-3.5 sm:px-4 py-2.5 sm:py-3">
                           {msg.role === 'user' ? (
                             <p className="leading-relaxed break-words text-sm">{displayContent}</p>
                           ) : (
                             <ReactMarkdown
                               className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 break-words"
                               components={{
                                 code: ({ inline, children }) => inline
                                   ? <code className="px-1 py-0.5 rounded bg-secondary text-xs font-mono break-all">{children}</code>
                                   : <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-2 text-xs"><code className="font-mono whitespace-pre-wrap">{children}</code></pre>,
                                 p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                                 ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                                 ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                                 li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                 h3: ({ children }) => <h3 className="font-semibold text-sm mt-2 mb-1 text-foreground">{children}</h3>,
                                 strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                               }}
                             >
                               {displayContent}
                             </ReactMarkdown>
                           )}
                           {/* Tool calls */}
                           {msg.tool_calls?.length > 0 && (
                             <div className="mt-2 space-y-1">
                               {msg.tool_calls.map((tc, ti) => (
                                 <div key={ti} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 min-w-0">
                                   <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", tc.status === 'completed' ? 'bg-green-400' : tc.status === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-muted-foreground')} />
                                   <span className="font-mono truncate">{tc.name || t('global_no_data')}</span>
                                   <span className="text-muted-foreground flex-shrink-0">{tc.status}</span>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                    );
                 })}

                {sending && (
                  <div className="flex gap-2.5 sm:gap-3 justify-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl px-4 py-2.5 sm:py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">{t('agents_analyzing')}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Hidden file input - accept multiple files */}
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 multiple
                 className="hidden"
                 onChange={handleFileChange}
               />

              {/* Pending attachments preview */}
              <AttachmentPreview
                imageDUrls={pendingImages}
                onRemove={(idx) => setPendingImages(prev => prev.filter((_, i) => i !== idx))}
              />

              {/* Input bar */}
              <div
                className="px-3 sm:px-4 pt-2.5 pb-4 sm:py-4 border-t border-border bg-card/30"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                <div className="flex gap-2 items-center">
                  {/* Image attach button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title={t('agents_upload_chart')}
                  >
                    <ImagePlus className="w-4 h-4" />
                  </Button>

                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={pendingImages.length > 0 ? t('agents_add_note') : `${t('agents_ask')} ${agent?.label}…`}
                    className="flex-1 bg-secondary border-border text-sm h-10"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!canSend}
                    size="icon"
                    className={cn("flex-shrink-0 w-10 h-10", pendingImages.length > 0 && "bg-blue-500 hover:bg-blue-600")}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}