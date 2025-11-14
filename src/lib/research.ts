import { FetcherOptions, RawItem, RegionCode, ResearchResponse } from './types';
import { fetchRedditHot } from './reddit';
import { fetchGoogleDailyTrends } from './trends';
import { fetchNitterSearchRss } from './nitter';
import { fetchYouTube } from './youtube';
import { fetchFinanceAndAiRss } from './finance_ai_sources';
import { processToTopics } from './processor';

export const DEFAULT_REGIONS: RegionCode[] = ['US', 'GB', 'CA', 'AU', 'DE'];

export async function runResearch({ regions, now }: FetcherOptions): Promise<ResearchResponse> {
  const startedAt = Date.now();

  const tasks: Promise<RawItem[]>[] = [
    fetchRedditHot(20),
    fetchGoogleDailyTrends(regions),
    fetchNitterSearchRss(),
    fetchYouTube('AI personal finance', 20),
    fetchFinanceAndAiRss(),
  ];

  const results = await Promise.allSettled(tasks);
  const items: RawItem[] = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  // Filter English-ish and title length reasonable
  const filtered = items.filter(i => i.title && i.title.length >= 6 && i.title.length <= 200);

  // Deduplicate by id and url
  const seen = new Set<string>();
  const uniq: RawItem[] = [];
  for (const it of filtered) {
    const key = `${it.source}:${it.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(it);
  }

  return processToTopics(uniq, regions, startedAt);
}
