import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore.js';
import { useCountdown } from '../hooks/useCountdown.js';

// Tiny beep via WebAudio — no asset needed.
function beep(freq = 880, ms = 180) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, ms);
  } catch {}
}

export default function AlertBanner() {
  const deadlineISO = useStore((s) => s.deadlineISO);
  const escalation = useStore((s) => s.escalation);
  const mute = useStore((s) => s.mute);
  const { diff, state, breached } = useCountdown(deadlineISO);
  const lastBeepRef = useRef(0);
  const [dismissed, setDismissed] = useState(false);

  // T-1h chime once, repeating every 5 min near imminent
  useEffect(() => {
    if (mute) return;
    const now = Date.now();
    if (state === 'imminent' && now - lastBeepRef.current > 60_000) {
      beep(1200, 120);
      setTimeout(() => beep(900, 120), 200);
      lastBeepRef.current = now;
    }
    if (breached && now - lastBeepRef.current > 3000) {
      beep(300, 400);
      lastBeepRef.current = now;
    }
  }, [diff, state, breached, mute]);

  let banner = null;

  if (breached) {
    banner = {
      color: 'bg-terminal-red text-black',
      text: '⚠ DEADLINE BREACH // HORMUZ DEADLINE HAS PASSED — MONITORING FOR KINETIC RESPONSE',
      critical: true,
    };
  } else if (state === 'imminent') {
    banner = {
      color: 'bg-terminal-red/20 text-terminal-red border-terminal-red',
      text: '⚠ IMMINENT // T-MINUS ONE HOUR — ALL SIGNALS ELEVATED',
      critical: true,
    };
  } else if (escalation.probability >= 75) {
    banner = {
      color: 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber',
      text: `▲ HIGH ESCALATION PROBABILITY (${escalation.probability}%) — WORST-CASE SCENARIO ACTIVATED`,
    };
  }

  if (!banner || dismissed) {
    // Reset dismissal if we leave the state
    if (!banner && dismissed) setDismissed(false);
    return null;
  }

  return (
    <>
      {breached && <div className="breach-overlay" />}
      <div
        className={`border-b ${banner.color} font-mono text-xs font-bold px-4 py-2 flex items-center justify-between ${
          banner.critical ? 'animate-pulse-red' : ''
        }`}
        style={{ letterSpacing: '0.1em' }}
      >
        <div className="overflow-hidden flex-1">
          <span className={banner.critical ? 'animate-blink' : ''}>{banner.text}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 opacity-60 hover:opacity-100"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </>
  );
}
