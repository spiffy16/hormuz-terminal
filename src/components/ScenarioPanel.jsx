import { useStore } from '../store/useStore.js';
import { getScenario } from '../services/scoring.js';

const COLORS = {
  red: { text: 'text-terminal-red', border: 'border-terminal-red', glow: 'glow-red' },
  amber: { text: 'text-terminal-amber', border: 'border-terminal-amber', glow: 'glow-amber' },
  green: { text: 'text-terminal-accent', border: 'border-terminal-accent', glow: 'glow-green' },
};

export default function ScenarioPanel() {
  const probability = useStore((s) => s.escalation.probability);
  const active = getScenario(probability);
  const all = [getScenario(90), getScenario(55), getScenario(20)];

  return (
    <div className="panel">
      <div className="panel-header">
        <span>SCENARIO ENGINE</span>
        <span className="text-terminal-dim">P={probability}%</span>
      </div>
      <div className="p-3 space-y-2">
        {all.map((s) => {
          const isActive = s.label === active.label;
          const c = COLORS[s.color];
          return (
            <div
              key={s.label}
              className={`border p-3 transition-all ${
                isActive
                  ? `${c.border} bg-terminal-border/20`
                  : 'border-terminal-border opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`font-mono text-[10px] font-bold ${c.text} ${isActive ? c.glow : ''}`}>
                  {isActive && '▸ '}
                  {s.label}
                </div>
                {isActive && (
                  <span className="text-[9px] font-mono text-terminal-dim">ACTIVE</span>
                )}
              </div>
              <div className={`text-sm font-semibold mb-1 ${isActive ? 'text-terminal-text' : 'text-terminal-dim'}`}>
                {s.title}
              </div>
              {isActive && (
                <div className="text-[11px] text-terminal-text/80 leading-relaxed">
                  {s.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
