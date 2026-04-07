# HORMUZ CRISIS TERMINAL

Real-time geopolitical intelligence dashboard. Bloomberg Terminal × military HUD × Doomsday Clock, focused on the Strait of Hormuz crisis.

**Default deadline:** Tue 7 Apr 2026, 20:00 ET (= Wed 8 Apr 2026, 02:00 SAST) — Trump's ultimatum to Iran to reopen the Strait. Configurable in UI (click `config` on the countdown panel).

---

## Modules

1. **Smart Doomsday Countdown** — timezone-aware, escalation states (nominal → elevated → critical → imminent → breach), jitter near zero, confidence bar.
2. **Multi-source News Feed** — Al Jazeera + CNN RSS, auto-refresh 60s, keyword tagging, sentiment scoring, relevance ranking.
3. **Market & Risk Layer** — Brent (TradingView `TVC:UKOIL` embed), simulated VIX + shipping-risk tickers correlated to escalation.
4. **AI Escalation Probability Engine** — linear model over sentiment, article volume, time pressure, manual override. Gauge meter + trend arrow + component breakdown.
5. **Strategic Map** — stylised SVG of the Strait, animated vessel tracks, chokepoint indicator that flashes with escalation state.
6. **Alert & Event System** — T-1h imminent alert, T-0 breach overlay + audio, >75% probability banner. Mute toggle in header.
7. **Scenario Engine** — best / base / worst case, dynamically highlights the active scenario based on escalation probability.

---

## Tech stack

- **React 18** + **Vite** (fast dev, Netlify-friendly build)
- **Tailwind CSS** (dark terminal theme, scanlines, glow effects)
- **Zustand** (global state)
- **Netlify Functions** (RSS proxy — bypasses CORS on AJ/CNN)
- **TradingView** embed widget (Brent crude chart)
- No heavy ML — keyword + polarity dictionary for sentiment

---

## Local development

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173`. For the RSS proxy to work locally you need the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

`netlify dev` runs the functions + Vite together on `http://localhost:8888`. Without it, the feed will fall back to the built-in mock articles (the UI will still work — you'll see `FEED ERROR` in the header and 3 seed headlines).

---

## Netlify deployment

### Option A — Git-based (recommended)

1. Push this directory to a GitHub/GitLab repo.
2. In Netlify: **Add new site → Import from Git** → pick the repo.
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Deploy. Done.

### Option B — CLI

```bash
npm install -g netlify-cli
netlify login
netlify init        # create a new site
netlify deploy --build --prod
```

### Verifying the feed

After deploy, hit `https://<your-site>.netlify.app/.netlify/functions/news` — you should see a JSON payload with `articles` and `fetchedAt`. If it returns 500, check the Netlify function logs; most likely the source RSS is temporarily blocking the bot user-agent — the UI will gracefully fall back to mock data.

---

## File structure

```
hormuz-terminal/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml
├── netlify/functions/
│   └── news.js              # RSS proxy (AJ + CNN)
└── src/
    ├── main.jsx
    ├── App.jsx              # grid layout
    ├── index.css            # terminal theme + scanlines
    ├── components/
    │   ├── Header.jsx
    │   ├── AlertBanner.jsx
    │   ├── Countdown.jsx
    │   ├── NewsFeed.jsx
    │   ├── EscalationGauge.jsx
    │   ├── MarketPanel.jsx
    │   ├── TradingViewChart.jsx
    │   ├── StrategicMap.jsx
    │   └── ScenarioPanel.jsx
    ├── hooks/
    │   ├── useCountdown.js
    │   └── useNews.js
    ├── services/
    │   ├── sentiment.js     # keyword + polarity dictionary
    │   └── scoring.js       # escalation model + scenario engine
    ├── store/
    │   └── useStore.js      # zustand global state
    └── utils/
        └── time.js
```

---

## Extending the AI scoring model

The current escalation engine (`src/services/scoring.js`) is a deliberately transparent linear model:

```
probability = 0.35·sentiment + 0.20·volume + 0.35·timePressure + 0.10·manual
```

All components are normalised to `[0, 1]`. History is kept in-memory for the trend arrow (last 30 samples).

### Straightforward upgrades

1. **Weight tuning** — edit `WEIGHTS` in `scoring.js`. If you want time pressure to dominate in the final hour, bump it to `0.5` and drop volume.
2. **Decay on stale articles** — in `sentiment.js`, weight each article by `exp(-age_hours / 6)` when aggregating, so 12-hour-old stories count half.
3. **Source credibility weighting** — attach a `credibility` score in `useNews.js` enrichment (e.g. Reuters > CNN > social), multiply into `relevanceScore`.
4. **Entity extraction** — upgrade `tagArticle` to use a named-entity dictionary (Iran military units, specific GCC states, named officials) and weight articles that mention kinetic actors higher.
5. **LLM classifier** — route each article title through a serverless function calling the Anthropic API with a classification prompt (`{escalation: low|medium|high, kinetic: bool}`) and cache by article id. Replace the keyword sentiment with the structured output. This gives you a proper AI engine while keeping the frontend unchanged — the store still just consumes `articles[].sentiment` and `articles[].relevance`.
6. **Market-feedback loop** — ingest real Brent / VIX data (Finnhub, Twelve Data) via another Netlify function, feed `brentChange` and `vixChange` as a fifth component in `computeEscalation`.
7. **Deadline-relative decay** — after breach, reset `timePressure = 1` and let sentiment drive the probability. Optionally add a "breach momentum" component that decays over 24h.

### Swapping the map to Mapbox

`StrategicMap.jsx` is self-contained SVG. To swap:

```bash
npm install mapbox-gl
```

Add `VITE_MAPBOX_TOKEN=pk.xxx` to `.env`, then replace the SVG with a `mapbox-gl` instance centered on `[56.25, 26.57]` (Strait of Hormuz). Keep the vessel animation loop — just project coords with `map.project()`.

---

## Notes

- **Not for operational use.** This is an OSINT visualisation, not a decision-support system. The escalation probability is a toy model.
- **No API keys required** for the default build. TradingView widget and RSS proxy work out of the box.
- **Graceful degradation** — if feeds fail, scoring uses fallback mocks; the UI never goes blank.
- **Mobile responsive** — grid collapses to single column under `lg`.

Performance: first paint ~300ms on cache, full interactive <2s on 4G.
