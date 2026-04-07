import { useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { computeEscalation } from '../services/scoring.js';
import { useCountdown } from '../hooks/useCountdown.js';

export default function EscalationGauge() {
  const articles = useStore((s) => s.articles);
  const deadlineISO = useStore((s) => s.deadlineISO);
  const manualOverride = useStore((s) => s.manualOverride);
  const setManualOverride = useStore((s) => s.setManualOverride);
  const setEscalation = useStore((s) => s.setEscalation);
  const escalation = useStore((s) => s.escalation);

  const { diff } = useCountdown(deadlineISO);

  useEffect(() => {
    const result = computeEscalation({ articles, diffMs: diff, manualOverride });
    setEscalation(result);
    const id = setInterval(() => {
      const r = computeEscalation({ articles, diffMs: diff, manualOverride });
      setEscalation(r);
    }, 5000);
    return () => clearInterval(id);
  }, [articles, diff, manualOverride, setEscalation]);

  const { probability, trend, components, relevantCount } = escalation;

  // Gauge arc
  const R = 70;
  const CIRC = Math.PI * R; // half circle
  const filled = (probability / 100) * CIRC;

  const color =
    probability >= 75 ? '#ff3b47' : probability >= 45 ? '#ffb020' : '#00ff9d';
  const glow = probability >= 75 ? 'glow-red' : probability >= 45 ? 'glow-amber' : 'glow-green';

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor =
    trend === 'up' ? 'text-terminal-red' : trend === 'down' ? 'text-terminal-accent' : 'text-terminal-dim';

  return (
    <div className="panel">
      <div className="panel-header">
        <span>ESCALATION PROBABILITY // AI ENGINE</span>
        <span className="text-terminal-dim">n={relevantCount}</span>
      </div>
      <div className="p-4">
        <div className="relative flex justify-center">
          <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
            {/* background arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              stroke="#1a2332"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            {/* filled arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${filled * 1.6} 999`}
              style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 0.8s ease' }}
            />
            {/* tick marks */}
            {[0, 25, 50, 75, 100].map((p) => {
              const angle = Math.PI - (p / 100) * Math.PI;
              const x1 = 100 + Math.cos(angle) * 72;
              const y1 = 110 - Math.sin(angle) * 72;
              const x2 = 100 + Math.cos(angle) * 82;
              const y2 = 110 - Math.sin(angle) * 82;
              return (
                <line
                  key={p}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#3a4a5f"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <div className={`font-mono text-5xl font-bold tabular-nums ${glow}`} style={{ color }}>
              {probability}
              <span className="text-2xl">%</span>
            </div>
            <div className={`font-mono text-xs ${trendColor}`}>
              TREND {trendIcon}
            </div>
          </div>
        </div>

        {/* component breakdown */}
        <div className="mt-4 space-y-1.5 text-[10px] font-mono">
          {[
            ['SENTIMENT', components.sentiment],
            ['VOLUME', components.volume],
            ['TIME PRESSURE', components.timePressure],
            ['MANUAL', components.manual],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-terminal-dim w-24">{label}</span>
              <div className="flex-1 h-1 bg-terminal-border">
                <div
                  className="h-full transition-all"
                  style={{ width: `${(val || 0) * 100}%`, background: color }}
                />
              </div>
              <span className="text-terminal-text w-8 text-right">
                {Math.round((val || 0) * 100)}
              </span>
            </div>
          ))}
        </div>

        {/* manual override slider */}
        <div className="mt-4 border-t border-terminal-border pt-3">
          <label className="text-[10px] font-mono text-terminal-dim flex justify-between mb-1">
            <span>MANUAL OVERRIDE</span>
            <span>{Math.round(manualOverride * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={manualOverride * 100}
            onChange={(e) => setManualOverride(Number(e.target.value) / 100)}
            className="w-full accent-terminal-accent"
          />
        </div>
      </div>
    </div>
  );
}
