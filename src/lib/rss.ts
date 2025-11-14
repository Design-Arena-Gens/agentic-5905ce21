import Parser from 'rss-parser';
import { RawItem, RegionCode } from './types';
import { normalizeUrl } from './http';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'user-agent': 'BuildYourSystemResearchBot/1.0 (+https://agentic-5905ce21.vercel.app)'
  }
});

export async function fetchRssFeed(url: string, sourceLabel: string, region?: RegionCode): Promise<RawItem[]> {
  const feed = await parser.parseURL(url);
  const items: RawItem[] = (feed.items || []).map((it, idx) => ({
    id: `${sourceLabel}:${it.id || it.guid || it.link || idx}`,
    title: (it.title || '').trim(),
    url: normalizeUrl(it.link || ''),
    source: 'rss' as const,
    publishedAt: it.isoDate || it.pubDate || undefined,
    author: it.creator || it.author || undefined,
    region,
  })).filter(x => x.title && x.url);
  return items;
}
