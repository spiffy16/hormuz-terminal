// Netlify serverless function: fetch + parse RSS feeds server-side to bypass CORS.
// Returns normalised JSON for the frontend.

const FEEDS = [
  { source: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { source: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { source: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews' },
  { source: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
];

function stripTags(s = '') {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function pick(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? stripTags(m[1]) : '';
}

function parseRSS(xml, source) {
  const items = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRe) || [];
  for (const block of matches.slice(0, 25)) {
    const title = pick(block, 'title');
    const link = pick(block, 'link');
    const description = pick(block, 'description');
    const pubDate = pick(block, 'pubDate') || pick(block, 'dc:date') || new Date().toISOString();
    const isoDate = (() => {
      const d = new Date(pubDate);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })();
    if (title) {
      items.push({
        id: `${source}-${link || title}`,
        source,
        title,
        link,
        description: description.slice(0, 400),
        isoDate,
      });
    }
  }
  return items;
}

export async function handler() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async ({ source, url }) => {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'HormuzTerminal/1.0' },
        });
        if (!res.ok) throw new Error(`${source} ${res.status}`);
        const xml = await res.text();
        return parseRSS(xml, source);
      })
    );

    const articles = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r) => String(r.reason));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=45',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ articles, failed, fetchedAt: new Date().toISOString() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err), articles: [] }),
    };
  }
}
