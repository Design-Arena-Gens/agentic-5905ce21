import { fetchRssFeed } from './rss';
import { RawItem } from './types';

const FEEDS: { url: string; label: string }[] = [
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', label: 'theverge-ai' },
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', label: 'techcrunch-ai' },
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', label: 'cnbc-finance' },
  { url: 'https://www.ft.com/companies/financials?format=rss', label: 'ft-finance' },
  { url: 'https://www.ft.com/technology?format=rss', label: 'ft-tech' },
  { url: 'https://www.wsj.com/xml/rss/3_7031.xml', label: 'wsj-markets' },
  { url: 'https://www.reuters.com/finance/rss', label: 'reuters-finance' },
  { url: 'https://www.reuters.com/technology/ai/rss', label: 'reuters-ai' },
  { url: 'https://feeds.feedburner.com/bloomberg/markets', label: 'bloomberg-markets' },
];

export async function fetchFinanceAndAiRss(): Promise<RawItem[]> {
  const results = await Promise.all(FEEDS.map(async (f) => {
    try {
      return await fetchRssFeed(f.url, f.label);
    } catch {
      return [] as RawItem[];
    }
  }));
  return results.flat();
}
