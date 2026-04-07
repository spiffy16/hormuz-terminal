import { useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import TradingViewChart from './TradingViewChart.jsx';

function Ticker({ label, value, unit, change, invert = false }) {
  const positive = change >= 0;
  // For risk indices, positive change is bad (red).
  const isBad = invert ? positive : !positive;
  const color = isBad ? '#ff3b47' : '#00ff9d';
  const arrow = positive ? '▲' : '▼';
  return (
    <div className="border border-terminal-border p-2 flex-1 min-w-[110px]">
      <div className="text-[9px] font-mono text-terminal-dim uppercase tracking-wider">{label}</div>
      <div className="text-lg font-mono tabular-nums text-terminal-text">
        {value}
        <span className="text-xs text-terminal-dim ml-1">{unit}</span>
      </div>
      <div className="text-[10px] font-mono" style={{ color }}>
        {arrow} {Math.abs(change).toFixed(2)}{unit === '%' ? '' : ''}
      </div>
    </div>
  );
}

export default function MarketPanel() {
  const market = useStore((s) => s.market);
  const setMarket = useStore((s) => s.setMarket);
  const escalation = useStore((s) => s.escalation);

  // Simulate drift correlated with escalation probability.
  useEffect(() => {
    const id = setInterval(() => {
      const p = (escalation.probability || 0) / 100;
      const jitter = (scale) => (Math.random() - 0.5) * scale;
      const bias = (p - 0.5) * 0.4; // up bias as escalation rises
      setMarket({
        brent: Math.max(60, market.brent + bias + jitter(0.3)),
        brentChange: market.brentChange * 0.9 + (bias + jitter(0.15)),
        vix: Math.max(12, market.vix + bias * 1.5 + jitter(0.4)),
        vixChange: market.vixChange * 0.9 + (bias * 1.2 + jitter(0.2)),
        shippingRisk: Math.min(100, Math.max(0, market.shippingRisk + bias * 2 + jitter(0.5))),
        shippingChange: market.shippingChange * 0.85 + (bias * 2 + jitter(0.4)),
      });
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escalation.probability]);

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span>MARKET // RISK LAYER</span>
        <span className="text-terminal-dim">LIVE · SIM</span>
      </div>
      <div className="p-3 flex flex-wrap gap-2">
        <Ticker label="BRENT CRUDE" value={market.brent.toFixed(2)} unit="USD" change={market.brentChange} />
        <Ticker label="VIX PROXY" value={market.vix.toFixed(1)} unit="" change={market.vixChange} invert />
        <Ticker label="SHIPPING RISK" value={market.shippingRisk.toFixed(0)} unit="/100" change={market.shippingChange} invert />
      </div>
      <div className="border-t border-terminal-border flex-1" style={{ minHeight: 340 }}>
        <TradingViewChart />
      </div>
    </div>
  );
}
