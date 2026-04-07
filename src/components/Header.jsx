import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore.js';
import { formatInTZ } from '../utils/time.js';

export default function Header() {
  const [now, setNow] = useState(new Date());
  const timezone = useStore((s) => s.timezone);
  const feedStatus = useStore((s) => s.feedStatus);
  const mute = useStore((s) => s.mute);
  const toggleMute = useStore((s) => s.toggleMute);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = now.toISOString().slice(11, 19) + 'Z';
  const local = formatInTZ(now.toISOString(), timezone);

  const statusColor = {
    ok: 'text-terminal-accent',
    loading: 'text-terminal-amber',
    error: 'text-terminal-red',
    idle: 'text-terminal-dim',
  }[feedStatus];

  return (
    <header className="border-b border-terminal-border bg-terminal-panel/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-terminal-red glow-red text-base font-bold tracking-widest">
              ◉ HORMUZ CRISIS TERMINAL
            </span>
            <span className="text-terminal-dim">v1.0</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-terminal-dim">
            <span>CLASSIFICATION: <span className="text-terminal-amber">OSINT</span></span>
            <span>·</span>
            <span>SOURCE: <span className="text-terminal-blue">MULTI-FEED</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center ${statusColor}`}>
            <span className="status-dot" style={{ background: 'currentColor' }} />
            FEED {feedStatus.toUpperCase()}
          </div>
          <div className="text-terminal-text">
            <span className="text-terminal-dim">UTC </span>
            {utc}
          </div>
          <div className="text-terminal-text hidden lg:inline">
            <span className="text-terminal-dim">LOCAL </span>
            {local}
          </div>
          <button
            onClick={toggleMute}
            className="border border-terminal-border px-2 py-0.5 hover:bg-terminal-border/40 text-terminal-dim"
            title="Toggle alert sounds"
          >
            {mute ? '🔇 MUTED' : '🔊 SOUND'}
          </button>
        </div>
      </div>
    </header>
  );
}
