import { fetchWithTimeout } from './http';
import { RawItem } from './types';

const DEFAULT_SUBS = [
  'personalfinance',
  'financialindependence',
  'investing',
  'stocks',
  'wallstreetbets',
  'Entrepreneur',
  'SideProject',
  'artificial',
  'MachineLearning',
  'ChatGPT',
];

export async function fetchRedditHot(limit = 20, subreddits: string[] = DEFAULT_SUBS): Promise<RawItem[]> {
  const urls = subreddits.map(s => `https://www.reddit.com/r/${s}/hot.json?limit=${limit}`);
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) return [] as RawItem[];
      const json = await res.json();
      const children = json?.data?.children || [];
      return children.map((c: any) => {
        const d = c.data;
        const id = `reddit:${d.id}`;
        return {
          id,
          title: d.title as string,
          url: `https://www.reddit.com${d.permalink}`,
          source: 'reddit' as const,
          publishedAt: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : undefined,
          author: d.author,
          score: d.score,
          commentsCount: d.num_comments,
        } satisfies RawItem;
      }) as RawItem[];
    } catch {
      return [] as RawItem[];
    }
  }));
  return results.flat();
}
