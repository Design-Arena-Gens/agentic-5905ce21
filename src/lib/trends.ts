import { fetchRssFeed } from './rss';
import { RawItem, RegionCode } from './types';

const REGION_TO_GEO: Record<RegionCode, string> = {
  US: 'US',
  GB: 'GB',
  CA: 'CA',
  AU: 'AU',
  IE: 'IE',
  DE: 'DE',
  FR: 'FR',
  NL: 'NL',
  SE: 'SE',
};

export async function fetchGoogleDailyTrends(regions: RegionCode[]): Promise<RawItem[]> {
  const urls = regions.map(r => ({ r, url: `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${REGION_TO_GEO[r]}` }));
  const results = await Promise.all(urls.map(async ({ r, url }) => {
    try {
      const items = await fetchRssFeed(url, 'google_trends', r);
      return items.map(it => ({ ...it, source: 'google_trends' as const }));
    } catch {
      return [] as RawItem[];
    }
  }));
  return results.flat();
}
