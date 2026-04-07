import { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown.js';
import { useStore } from '../store/useStore.js';
import { pad, formatInTZ } from '../utils/time.js';

const STATE_STYLES = {
  normal: { color: 'text-terminal-accent', glow: 'glow-green', label: 'NOMINAL', bar: 'bg-terminal-accent' },
  elevated: { color: 'text-terminal-blue', glow: 'glow-green', label: 'ELEVATED', bar: 'bg-terminal-blue' },
  critical: { color: 'text-terminal-amber', glow: 'glow-amber', label: 'CRITICAL', bar: 'bg-terminal-amber' },
  imminent: { color: 'text-terminal-red', glow: 'glow-red', label: 'IMMINENT', bar: 'bg-terminal-red' },
  breach: { color: 'text-terminal-red', glow: 'glow-red', label: 'DEADLINE BREACH', bar: 'bg-terminal-red' },
};

export default function Countdown() {
  const deadlineISO = useStore((s) => s.deadlineISO);
  const setDeadlineISO = useStore((s) => s.setDeadlineISO);
  const timezone = useStore((s) => s.timezone);
  const setTimezone = useStore((s) => s.setTimezone);
  const [editing, setEditing] = useState(false);

  const { days, hours, minutes, seconds, state, breached, diff } = useCountdown(deadlineISO);
  const style = STATE_STYLES[state];

  // Confidence: higher as we approach and have data
  const confidence = Math.max(60, 100 - Math.min(40, (Math.abs(diff) / 3600000) * 2));

  // Pulse intensity: faster near zero
  const pulseSpeed =
    state === 'imminent' ? '0.6s' : state === 'critical' ? '1.2s' : state === 'elevated' ? '2s' : '3s';

  return (
    <div className="panel">
      <div className="panel-header">
        <span>COUNTDOWN // HORMUZ DEADLINE</span>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-terminal-dim hover:text-terminal-accent"
        >
          {editing ? 'close' : 'config'}
        </button>
      </div>

      <div className="p-4">
        {editing && (
          <div className="mb-4 space-y-2 border border-terminal-border p-3 text-[11px] font-mono">
            <label className="block">
              <span className="text-terminal-dim">DEADLINE (ISO / UTC)</span>
              <input
                type="text"
                value={deadlineISO}
                onChange={(e) => setDeadlineISO(e.target.value)}
                className="mt-1 w-full bg-black/60 border border-terminal-border px-2 py-1 text-terminal-text"
              />
            </label>
            <label className="block">
              <span className="text-terminal-dim">TIMEZONE (IANA)</span>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 w-full bg-black/60 border border-terminal-border px-2 py-1 text-terminal-text"
              />
            </label>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className={`text-xs font-mono ${style.color}`}>
            <span className="status-dot" style={{ background: 'currentColor', animation: `pulse ${pulseSpeed} infinite` }} />
            STATE: {style.label}
          </div>
          <div className="text-[10px] font-mono text-terminal-dim">
            T{breached ? '+' : '−'}
          </div>
        </div>

        <div
          className={`font-mono text-center tabular-nums ${style.color} ${style.glow} ${state === 'imminent' || state === 'breach' ? 'drift' : ''}`}
          style={{ fontSize: 'clamp(2rem, 7vw, 4.5rem)', lineHeight: 1, letterSpacing: '0.05em' }}
        >
          {pad(days)}:{pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-terminal-dim uppercase">
          <div>Days</div>
          <div>Hours</div>
          <div>Min</div>
          <div>Sec</div>
        </div>

        <div className="mt-4 text-[11px] font-mono text-terminal-dim space-y-1">
          <div className="flex justify-between">
            <span>TARGET UTC</span>
            <span className="text-terminal-text">{deadlineISO}</span>
          </div>
          <div className="flex justify-between">
            <span>TARGET LOCAL</span>
            <span className="text-terminal-text">{formatInTZ(deadlineISO, timezone)}</span>
          </div>
          <div className="flex justify-between">
            <span>TZ</span>
            <span className="text-terminal-text">{timezone}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-mono text-terminal-dim mb-1">
            <span>CONFIDENCE BAR</span>
            <span>{Math.round(confidence)}%</span>
          </div>
          <div className="h-1.5 bg-terminal-border relative overflow-hidden">
            <div
              className={`h-full ${style.bar} transition-all duration-500`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
