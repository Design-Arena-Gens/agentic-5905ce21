import { fetchWithTimeout, normalizeUrl } from './http';
import { RawItem } from './types';
import { fetchRssFeed } from './rss';

const FALLBACK_CHANNEL_RSS: string[] = [
  // Finance & productivity creators
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCR-cNbnvQasJ0_Hz7Hf6q3Q', // Graham Stephan
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCGy7SkBjcIAgTiwkXEtPnYg', // Andrei Jikh
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCoOae5nYA7VqaXzerajD0lg', // Ali Abdaal
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCV6KDgJskWaEckne5aPA0aQ', // CNBC Television
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCial0fmkkrgU9UG3f0LxzGw', // Bloomberg Technology
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCzUV5283-l5cJR6gwbPq8Kw', // The Plain Bagel
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCK-4XiD3Rx7M1Jd7sPQX9-w', // Two Cents PBS
];

export async function fetchYouTube(query = 'AI personal finance', maxResults = 15): Promise<RawItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    // Fallback to channel RSS
    const results = await Promise.all(FALLBACK_CHANNEL_RSS.map(url => fetchRssFeed(url, 'youtube')));
    return results.flat().map(it => ({ ...it, source: 'youtube' as const }));
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('order', 'date');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('relevanceLanguage', 'en');
  url.searchParams.set('regionCode', 'US');
  url.searchParams.set('key', key);

  try {
    const res = await fetchWithTimeout(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    const items = (data.items || []).map((it: any) => {
      const id = it.id?.videoId;
      const snippet = it.snippet || {};
      const videoUrl = `https://www.youtube.com/watch?v=${id}`;
      return {
        id: `youtube:${id}`,
        title: snippet.title || '',
        url: normalizeUrl(videoUrl),
        source: 'youtube' as const,
        publishedAt: snippet.publishedAt,
        author: snippet.channelTitle,
      } as RawItem;
    }).filter((x: RawItem) => x.title && x.url);
    return items;
  } catch {
    return [];
  }
}
