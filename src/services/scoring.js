// AI Escalation Probability Engine
// Transparent linear model over:
//  - aggregate negative sentiment in news
//  - volume of relevant articles
//  - proximity to deadline
//  - manual override slider (0..1)

const WEIGHTS = {
  sentiment: 0.35,
  volume: 0.20,
  timePressure: 0.35,
  manual: 0.10,
};

// History for trend arrow
let history = [];

export function computeEscalation({ articles = [], diffMs = Infinity, manualOverride = 0 }) {
  // 1. Sentiment component (0..1, where 1 = maximally negative)
  const relevant = articles.filter((a) => a.relevance > 0.25);
  const avgSent = relevant.length
    ? relevant.reduce((s, a) => s + (a.sentiment?.score ?? 0), 0) / relevant.length
    : 0;
  // Map -1..1 -> 1..0
  const sentimentComponent = Math.max(0, Math.min(1, (1 - avgSent) / 2));

  // 2. Volume component: saturates around 20 relevant articles
  const volumeComponent = Math.min(relevant.length / 20, 1);

  // 3. Time pressure: logarithmic toward deadline
  let timeComponent;
  if (diffMs <= 0) timeComponent = 1;
  else {
    // 48h away ~ 0.1; 1h ~ 0.85; 10m ~ 0.97
    const hoursOut = diffMs / 3600000;
    timeComponent = Math.max(0, Math.min(1, 1 - Math.log10(hoursOut + 1) / 2));
  }

  // 4. Manual override
  const manualComponent = Math.max(0, Math.min(1, manualOverride));

  const raw =
    WEIGHTS.sentiment * sentimentComponent +
    WEIGHTS.volume * volumeComponent +
    WEIGHTS.timePressure * timeComponent +
    WEIGHTS.manual * manualComponent;

  const probability = Math.round(raw * 100);

  // Track for trend
  history.push({ t: Date.now(), probability });
  if (history.length > 30) history.shift();

  let trend = 'flat';
  if (history.length >= 3) {
    const prev = history[history.length - 3].probability;
    const diff = probability - prev;
    if (diff > 2) trend = 'up';
    else if (diff < -2) trend = 'down';
  }

  return {
    probability,
    trend,
    components: {
      sentiment: sentimentComponent,
      volume: volumeComponent,
      timePressure: timeComponent,
      manual: manualComponent,
    },
    relevantCount: relevant.length,
    avgSentiment: avgSent,
  };
}

export function resetHistory() {
  history = [];
}

export function getScenario(probability) {
  if (probability >= 75) {
    return {
      label: 'WORST CASE',
      color: 'red',
      title: 'Kinetic escalation',
      body:
        'Deadline passes without deal. US executes infrastructure strikes on Iranian power plants and bridges. Hormuz closure extends 3–6 weeks. Brent spikes past $130/bbl. Regional shipping insurance rates triple. Tail risk: direct Iranian retaliation against Gulf state energy assets drags GCC partners into active conflict.',
    };
  }
  if (probability >= 45) {
    return {
      label: 'BASE CASE',
      color: 'amber',
      title: 'Brinkmanship with last-minute extension',
      body:
        'Deadline either slips or is replaced by a short-term confidence-building framework (e.g., 45-day ceasefire proposal). Limited tit-for-tat strikes continue. Hormuz remains partially disrupted. Brent holds $105–115/bbl. Oil markets price elevated volatility for weeks.',
    };
  }
  return {
    label: 'BEST CASE',
    color: 'green',
    title: 'Off-ramp secured',
    body:
      'Mediators (Oman / Qatar / Pakistan) broker a verification protocol for Hormuz transit. Iran signals phased reopening in exchange for pause on infrastructure targeting. Brent retraces toward $95/bbl. Shipping risk premiums ease but refinery repair timelines keep physical supply tight for months.',
  };
}
