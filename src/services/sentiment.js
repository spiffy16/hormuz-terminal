// Lightweight keyword + sentiment dictionary (no ML).

const POSITIVE = [
  'ceasefire', 'agreement', 'deal', 'truce', 'peace', 'diplomacy', 'negotiate',
  'resolution', 'de-escalate', 'withdraw', 'release', 'reopened', 'progress',
  'breakthrough', 'accord', 'compromise', 'mediate',
];

const NEGATIVE = [
  'strike', 'attack', 'bomb', 'kill', 'dead', 'casualt', 'war', 'missile',
  'airstrike', 'blast', 'escalat', 'threat', 'retaliat', 'invade', 'destroy',
  'breach', 'siege', 'fire', 'explos', 'crisis', 'conflict', 'clash', 'surge',
  'warn', 'reject', 'fail', 'collapse', 'sanction', 'shut', 'blockade', 'ultimatum',
  'deadline', 'ominous', 'civilization will die', 'war crime', 'rubble',
];

const KEYWORDS = {
  iran: /\biran(ian)?\b/i,
  hormuz: /\bhormuz|strait\b/i,
  oil: /\boil|brent|crude|barrel|opec|refinery|tanker\b/i,
  military: /\bmilitary|troops|army|navy|forces|airstrike|strike|missile|f-?15|bomb\b/i,
  trump: /\btrump|white house|potus\b/i,
  israel: /\bisrael|idf|netanyahu\b/i,
  diplomacy: /\bceasefire|negotiat|diplomat|mediat|truce\b/i,
};

export function tagArticle(text = '') {
  const t = text.toLowerCase();
  const tags = [];
  for (const [key, re] of Object.entries(KEYWORDS)) {
    if (re.test(t)) tags.push(key);
  }
  return tags;
}

export function sentimentScore(text = '') {
  const t = text.toLowerCase();
  let pos = 0;
  let neg = 0;
  for (const w of POSITIVE) if (t.includes(w)) pos++;
  for (const w of NEGATIVE) if (t.includes(w)) neg++;
  const total = pos + neg;
  if (total === 0) return { label: 'neutral', score: 0, pos, neg };
  const score = (pos - neg) / total; // -1 .. 1
  let label = 'neutral';
  if (score < -0.2) label = 'negative';
  else if (score > 0.2) label = 'positive';
  return { label, score, pos, neg };
}

export function relevanceScore(tags = [], sentiment = { score: 0 }) {
  // Core crisis tags get high weight.
  const core = ['iran', 'hormuz', 'oil', 'military'];
  const hits = tags.filter((t) => core.includes(t)).length;
  const tagScore = Math.min(hits / core.length, 1); // 0..1
  // Negative news about the crisis is more "relevant" to escalation watching.
  const sentBoost = sentiment.score < 0 ? Math.abs(sentiment.score) * 0.3 : 0;
  return Math.min(tagScore + sentBoost, 1);
}
