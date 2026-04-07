import Header from './components/Header.jsx';
import Countdown from './components/Countdown.jsx';
import NewsFeed from './components/NewsFeed.jsx';
import EscalationGauge from './components/EscalationGauge.jsx';
import MarketPanel from './components/MarketPanel.jsx';
import StrategicMap from './components/StrategicMap.jsx';
import ScenarioPanel from './components/ScenarioPanel.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import { useNews } from './hooks/useNews.js';
import { useStore } from './store/useStore.js';

export default function App() {
  useNews();
  const articles = useStore((s) => s.articles);

  // Marquee: top 6 high-relevance headlines
  const tickerItems = articles
    .filter((a) => a.relevance > 0.3)
    .slice(0, 8)
    .map((a) => `[${a.source}] ${a.title}`)
    .join('   •••   ');

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      <Header />
      <AlertBanner />

      {/* Marquee ticker */}
      {tickerItems && (
        <div className="border-b border-terminal-border bg-black/40 overflow-hidden py-1">
          <div className="marquee font-mono text-[11px] text-terminal-amber">
            {tickerItems}
          </div>
        </div>
      )}

      {/* Main grid */}
      <main className="p-3 grid gap-3 grid-cols-1 lg:grid-cols-12 auto-rows-min">
        {/* Row 1: Countdown + Gauge + Scenario */}
        <div className="lg:col-span-4">
          <Countdown />
        </div>
        <div className="lg:col-span-4">
          <EscalationGauge />
        </div>
        <div className="lg:col-span-4">
          <ScenarioPanel />
        </div>

        {/* Row 2: Map + News */}
        <div className="lg:col-span-8">
          <StrategicMap />
        </div>
        <div className="lg:col-span-4 lg:row-span-2" style={{ maxHeight: '820px' }}>
          <NewsFeed />
        </div>

        {/* Row 3: Market */}
        <div className="lg:col-span-8">
          <MarketPanel />
        </div>
      </main>

      <footer className="px-4 py-3 text-[10px] font-mono text-terminal-dim border-t border-terminal-border">
        HORMUZ CRISIS TERMINAL // OSINT AGGREGATOR // NOT FOR OPERATIONAL USE //
        DATA: AL JAZEERA · CNN · TRADINGVIEW · SIMULATED RISK LAYER
      </footer>
    </div>
  );
}
