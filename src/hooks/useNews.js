import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore.js';
import { sentimentScore, tagArticle, relevanceScore } from '../services/sentiment.js';

const REFRESH_MS = 60_000;

// Fallback mock articles if feeds fail entirely — so the UI never looks dead.
const FALLBACK = [
  {
    id: 'mock-1',
    source: 'Al Jazeera',
    title: 'Iran warns of “severe response” ahead of Trump Hormuz deadline',
    description:
      'Tehran rejects latest US ceasefire framework as deadline for reopening the Strait of Hormuz approaches.',
    link: '#',
    isoDate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    source: 'CNN World',
    title: 'Brent crude tops $110 as Hormuz closure enters sixth week',
    description:
      'Oil markets price in sustained supply shock as shipping insurers suspend Gulf coverage.',
    link: '#',
    isoDate: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    source: 'CNN Top',
    title: 'White House: mediators “pushing hard” for last-minute deal',
    description:
      'Pakistani, Qatari, and Omani channels active as 8pm ET deadline nears. Negotiation sources call chances slim.',
    link: '#',
    isoDate: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

function enrich(raw) {
  const text = `${raw.title} ${raw.description}`;
  const tags = tagArticle(text);
  const sentiment = sentimentScore(text);
  const relevance = relevanceScore(tags, sentiment);
  return { ...raw, tags, sentiment, relevance };
}

export function useNews() {
  const setArticles = useStore((s) => s.setArticles);
  const setFeedStatus = useStore((s) => s.setFeedStatus);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      setFeedStatus('loading');
      try {
        const res = await fetch('/.netlify/functions/news');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const enriched = (data.articles || []).map(enrich);
        if (!mounted.current) return;
        if (enriched.length === 0) {
          setArticles(FALLBACK.map(enrich));
          setFeedStatus('error', data.fetchedAt);
        } else {
          // Sort: relevance desc, then recency.
          enriched.sort((a, b) => {
            if (b.relevance !== a.relevance) return b.relevance - a.relevance;
            return new Date(b.isoDate) - new Date(a.isoDate);
          });
          setArticles(enriched);
          setFeedStatus('ok', data.fetchedAt);
        }
      } catch (e) {
        if (!mounted.current) return;
        setArticles(FALLBACK.map(enrich));
        setFeedStatus('error', new Date().toISOString());
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [setArticles, setFeedStatus]);
}
