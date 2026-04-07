import { useStore } from '../store/useStore.js';
import { relativeTime } from '../utils/time.js';

const SENTIMENT_STYLES = {
  positive: { dot: '#00ff9d', label: 'POS' },
  neutral: { dot: '#4fc3f7', label: 'NEU' },
  negative: { dot: '#ff3b47', label: 'NEG' },
};

export default function NewsFeed() {
  const articles = useStore((s) => s.articles);
  const feedStatus = useStore((s) => s.feedStatus);
  const lastFetchedAt = useStore((s) => s.lastFetchedAt);

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span>INTEL FEED // MULTI-SOURCE</span>
        <span className="text-terminal-dim">
          {articles.length} items {lastFetchedAt && `· ${relativeTime(lastFetchedAt)}`}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-terminal-border">
        {feedStatus === 'loading' && articles.length === 0 && (
          <div className="p-4 text-terminal-dim text-xs font-mono">ACQUIRING FEEDS…</div>
        )}
        {articles.map((a) => {
          const sent = SENTIMENT_STYLES[a.sentiment?.label || 'neutral'];
          return (
            <a
              key={a.id}
              href={a.link}
              target="_blank"
              rel="noreferrer"
              className="block p-3 hover:bg-terminal-border/20 transition-colors"
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-terminal-dim mb-1">
                <span className="text-terminal-blue">{a.source}</span>
                <span>·</span>
                <span>{relativeTime(a.isoDate)}</span>
                <span>·</span>
                <span
                  className="font-bold"
                  style={{ color: sent.dot }}
                  title={`sentiment score ${a.sentiment?.score?.toFixed(2)}`}
                >
                  {sent.label}
                </span>
                {a.relevance > 0.5 && (
                  <>
                    <span>·</span>
                    <span className="text-terminal-red font-bold">HIGH-REL</span>
                  </>
                )}
              </div>
              <div className="text-sm text-terminal-text leading-snug">{a.title}</div>
              {a.tags?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.tags.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-mono px-1 border border-terminal-border text-terminal-dim uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </a>
          );
        })}
        {articles.length === 0 && feedStatus !== 'loading' && (
          <div className="p-4 text-terminal-dim text-xs font-mono">NO FEED DATA.</div>
        )}
      </div>
    </div>
  );
}
