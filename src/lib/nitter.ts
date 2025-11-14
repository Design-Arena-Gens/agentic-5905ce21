import { fetchRssFeed } from './rss';
import { RawItem } from './types';

const DEFAULT_QUERIES = [
  'AI finance',
  'personal finance AI',
  'money psychology',
  'wealth building',
  'financial freedom',
  'investment AI',
  'LLM trading',
];

const NITTER_BASES = [
  'https://nitter.net',
  'https://nitter.lacontrevoie.fr',
];

export async function fetchNitterSearchRss(queries: string[] = DEFAULT_QUERIES): Promise<RawItem[]> {
  const urls: string[] = [];
  for (const base of NITTER_BASES) {
    for (const q of queries) {
      urls.push(`${base}/search/rss?f=tweets&q=${encodeURIComponent(q)}`);
    }
  }
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const items = await fetchRssFeed(url, 'nitter');
      return items.map(i => ({ ...i, source: 'nitter' as const }));
    } catch {
      return [] as RawItem[];
    }
  }));
  return results.flat();
}
