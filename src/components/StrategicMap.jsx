import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore.js';

// Stylised SVG of the Strait of Hormuz region.
// Coordinates are abstract (not real lat/lng) — designed to look like a tactical display.

const VESSELS_INIT = [
  { id: 1, x: 50, y: 180, vx: 0.6, type: 'tanker' },
  { id: 2, x: 120, y: 160, vx: 0.4, type: 'tanker' },
  { id: 3, x: 200, y: 145, vx: 0.5, type: 'tanker' },
  { id: 4, x: 320, y: 130, vx: -0.3, type: 'cargo' },
  { id: 5, x: 420, y: 115, vx: -0.5, type: 'tanker' },
  { id: 6, x: 500, y: 105, vx: -0.4, type: 'tanker' },
  { id: 7, x: 600, y: 90, vx: -0.6, type: 'cargo' },
];

export default function StrategicMap() {
  const [vessels, setVessels] = useState(VESSELS_INIT);
  const escalation = useStore((s) => s.escalation);

  useEffect(() => {
    const id = setInterval(() => {
      setVessels((vs) =>
        vs.map((v) => {
          let nx = v.x + v.vx;
          if (nx > 680) nx = 20;
          if (nx < 20) nx = 680;
          return { ...v, x: nx };
        })
      );
    }, 120);
    return () => clearInterval(id);
  }, []);

  const chokeColor =
    escalation.probability >= 75 ? '#ff3b47' : escalation.probability >= 45 ? '#ffb020' : '#00ff9d';

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span>STRATEGIC MAP // STRAIT OF HORMUZ</span>
        <span className="text-terminal-dim">{vessels.length} TRACKS</span>
      </div>
      <div className="p-2 flex-1 relative">
        <svg viewBox="0 0 700 260" className="w-full h-full" style={{ background: '#05070a' }}>
          {/* grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f1823" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="chokeGlow">
              <stop offset="0%" stopColor={chokeColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={chokeColor} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="700" height="260" fill="url(#grid)" />

          {/* landmasses — stylised */}
          {/* Iran (top) */}
          <path
            d="M 0 0 L 700 0 L 700 60 Q 600 80 500 70 Q 420 65 380 90 Q 340 110 280 95 Q 200 80 120 95 Q 60 105 0 90 Z"
            fill="#0a1420"
            stroke="#1a2332"
            strokeWidth="1"
          />
          {/* Arabian peninsula (bottom) */}
          <path
            d="M 0 260 L 700 260 L 700 210 Q 620 200 560 215 Q 500 225 440 200 Q 400 180 360 195 Q 300 215 240 200 Q 160 180 80 200 Q 30 210 0 200 Z"
            fill="#0a1420"
            stroke="#1a2332"
            strokeWidth="1"
          />

          {/* labels */}
          <text x="340" y="30" fill="#3a4a5f" fontSize="10" fontFamily="monospace" textAnchor="middle">
            IRAN
          </text>
          <text x="340" y="250" fill="#3a4a5f" fontSize="10" fontFamily="monospace" textAnchor="middle">
            UAE · OMAN
          </text>

          {/* shipping lane */}
          <path
            d="M 20 180 Q 180 150 340 130 T 680 90"
            fill="none"
            stroke="#1a3a4f"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 20 180 Q 180 150 340 130 T 680 90"
            fill="none"
            stroke="#4fc3f7"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.5"
          />

          {/* chokepoint indicator */}
          <circle cx="360" cy="125" r="40" fill="url(#chokeGlow)">
            <animate attributeName="r" values="30;45;30" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle
            cx="360"
            cy="125"
            r="8"
            fill="none"
            stroke={chokeColor}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 6px ${chokeColor})` }}
          >
            <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <text x="360" y="165" fill={chokeColor} fontSize="9" fontFamily="monospace" textAnchor="middle">
            CHOKE POINT
          </text>

          {/* vessels */}
          {vessels.map((v) => {
            const color = v.type === 'tanker' ? '#ffb020' : '#4fc3f7';
            return (
              <g key={v.id}>
                <circle cx={v.x} cy={v.y} r="3" fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
                <circle cx={v.x} cy={v.y} r="6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" />
              </g>
            );
          })}

          {/* scale bar */}
          <line x1="600" y1="245" x2="680" y2="245" stroke="#3a4a5f" strokeWidth="1" />
          <text x="640" y="240" fill="#3a4a5f" fontSize="8" fontFamily="monospace" textAnchor="middle">
            ~50 NM
          </text>
        </svg>
      </div>
      <div className="px-3 py-2 border-t border-terminal-border text-[10px] font-mono text-terminal-dim flex justify-between">
        <span>● TANKER</span>
        <span>● CARGO</span>
        <span style={{ color: chokeColor }}>● CHOKE-STATE</span>
      </div>
    </div>
  );
}
