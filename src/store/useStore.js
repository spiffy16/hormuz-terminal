import { create } from 'zustand';
import { DEFAULT_DEADLINE_ISO, detectTimezone } from '../utils/time.js';

export const useStore = create((set) => ({
  deadlineISO: DEFAULT_DEADLINE_ISO,
  setDeadlineISO: (iso) => set({ deadlineISO: iso }),

  timezone: detectTimezone(),
  setTimezone: (tz) => set({ timezone: tz }),

  manualOverride: 0,
  setManualOverride: (v) => set({ manualOverride: v }),

  articles: [],
  setArticles: (a) => set({ articles: a }),

  feedStatus: 'idle', // idle | loading | ok | error
  lastFetchedAt: null,
  setFeedStatus: (s, at) => set({ feedStatus: s, lastFetchedAt: at ?? null }),

  escalation: { probability: 0, trend: 'flat', components: {}, relevantCount: 0 },
  setEscalation: (e) => set({ escalation: e }),

  mute: false,
  toggleMute: () => set((s) => ({ mute: !s.mute })),

  // Mock market state (updated by MarketPanel)
  market: {
    brent: 110.5,
    brentChange: 2.1,
    vix: 34.2,
    vixChange: 1.8,
    shippingRisk: 82,
    shippingChange: 6,
  },
  setMarket: (m) => set({ market: m }),
}));
