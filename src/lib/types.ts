export type SourceType =
  | 'reddit'
  | 'rss'
  | 'google_trends'
  | 'nitter'
  | 'youtube';

export type RegionCode = 'US' | 'GB' | 'CA' | 'AU' | 'IE' | 'DE' | 'FR' | 'NL' | 'SE';

export interface RawItem {
  id: string;
  title: string;
  url: string;
  source: SourceType;
  publishedAt?: string; // ISO string
  author?: string;
  score?: number; // upvotes/likes when available
  commentsCount?: number;
  viewsCount?: number;
  region?: RegionCode;
}

export type Category = 'AI' | 'Money Psychology' | 'Wealth Strategy' | 'Breaking News';

export interface Topic {
  topic: string;
  category: Category;
  whyItMatters: string;
  contentAngle: string;
  potentialGrowth: 'Low' | 'Medium' | 'High' | 'Explosive';
  suggestedTitle: string;
  thumbnailHooks: string[];
  seoKeywords: string[];
  score: number;
  sources: RawItem[];
}

export interface ResearchResponse {
  generatedAt: string; // ISO
  regions: RegionCode[];
  topics: Topic[];
  meta: {
    totalRawItems: number;
    uniqueTopics: number;
    generationMs: number;
  };
}

export interface FetcherOptions {
  regions: RegionCode[];
  now: Date;
}
