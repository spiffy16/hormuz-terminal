import { useEffect, useState } from 'react';
import { diffParts, timeState } from '../utils/time.js';

export function useCountdown(targetISO) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 100); // high-frequency for jitter effect
    return () => clearInterval(id);
  }, []);

  const targetMs = new Date(targetISO).getTime();
  const parts = diffParts(targetMs, now);
  const state = timeState(parts.diff);
  return { ...parts, state, targetMs, now };
}
