// Default deadline: Trump's 8 PM ET Tuesday April 7, 2026 deadline for Iran
// to reopen Strait of Hormuz. 8 PM EDT = 00:00 UTC April 8, 2026 = 02:00 SAST.
export const DEFAULT_DEADLINE_ISO = '2026-04-08T00:00:00Z';

export function diffParts(targetMs, nowMs) {
  const diff = targetMs - nowMs;
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);
  const minutes = Math.floor((absDiff % 3600000) / 60000);
  const seconds = Math.floor((absDiff % 60000) / 1000);
  const millis = absDiff % 1000;
  return { diff, days, hours, minutes, seconds, millis, breached: diff <= 0 };
}

export function pad(n, w = 2) {
  return String(n).padStart(w, '0');
}

export function relativeTime(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.round((now - then) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function formatInTZ(iso, tz) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString();
  }
}

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

// Escalation state from time remaining
export function timeState(diffMs) {
  if (diffMs <= 0) return 'breach';
  if (diffMs <= 3600_000) return 'imminent'; // < 1 hour
  if (diffMs <= 6 * 3600_000) return 'critical'; // < 6 hours
  if (diffMs <= 24 * 3600_000) return 'elevated'; // < 24 hours
  return 'normal';
}
