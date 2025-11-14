import { Category, RawItem, RegionCode, ResearchResponse, Topic } from './types';

function normalizeTitleForKey(title: string): string {
  const t = title
    .toLowerCase()
    .replace(/\s*\|.*$/g, '')
    .replace(/\s*-\s*[^-]+$/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

const CATEGORY_RULES: { category: Category; keywords: string[] }[] = [
  { category: 'AI', keywords: ['ai', 'artificial intelligence', 'gpt', 'chatgpt', 'llm', 'openai', 'anthropic', 'google gemini', 'deepseek', 'midjourney', 'autogen', 'rag', 'agent'] },
  { category: 'Money Psychology', keywords: ['psychology', 'behavior', 'dopamine', 'habits', 'mindset', 'fear', 'greed', 'bias', 'motivation', 'discipline', 'framing', 'decision', 'heuristic'] },
  { category: 'Wealth Strategy', keywords: ['invest', 'investment', 'portfolio', 'etf', 'stock', 'dividend', 'real estate', 'side hustle', 'income', 'tax', 'retirement', '401k', 'roth', 'budget', 'saving', 'high yield', 'index fund', 'asset allocation'] },
  { category: 'Breaking News', keywords: ['breaking', 'announces', 'launches', 'acquires', 'bankruptcy', 'regulation', 'lawsuit', 'interest rate', 'cpi', 'fed', 'jobs report', 'inflation', 'market crash', 'surge', 'plunge'] },
];

function inferCategory(title: string): Category {
  const t = title.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => t.includes(k))) {
      return rule.category;
    }
  }
  // Heuristic: default to Wealth Strategy if money-related, else AI if AI token exists, else Breaking News
  if (/(money|finance|wealth|invest|stock|portfolio|retire|budget)/.test(t)) return 'Wealth Strategy';
  if (/(ai|gpt|chatgpt|llm|openai)/.test(t)) return 'AI';
  return 'Breaking News';
}

function hoursSince(dateIso?: string): number {
  if (!dateIso) return 9999;
  const d = new Date(dateIso).getTime();
  if (isNaN(d)) return 9999;
  return (Date.now() - d) / (1000 * 60 * 60);
}

function recencyWeight(dateIso?: string): number {
  const h = hoursSince(dateIso);
  if (h < 6) return 1.0;
  if (h < 24) return 0.8;
  if (h < 72) return 0.5;
  if (h < 168) return 0.3; // one week
  return 0.1;
}

function baseSourceWeight(item: RawItem): number {
  switch (item.source) {
    case 'reddit': return 1.2 + Math.min((item.score || 0) / 500, 1) + Math.min((item.commentsCount || 0) / 200, 1);
    case 'google_trends': return 1.3;
    case 'youtube': return 1.1 + Math.min((item.viewsCount || 0) / 50000, 1);
    case 'nitter': return 0.9;
    case 'rss': return 1.0;
    default: return 1.0;
  }
}

function scoreItem(item: RawItem): number {
  return baseSourceWeight(item) * recencyWeight(item.publishedAt);
}

function estimateGrowth(score: number, mentions: number): Topic['potentialGrowth'] {
  const s = score + mentions * 0.4;
  if (s > 3.2) return 'Explosive';
  if (s > 2.4) return 'High';
  if (s > 1.6) return 'Medium';
  return 'Low';
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function generateWhy(title: string, category: Category): string {
  switch (category) {
    case 'AI':
      return `Signals the next wave of AI tools impacting how people plan, earn, and invest.`;
    case 'Money Psychology':
      return `Touches core behavioral levers that determine whether systems stick long-term.`;
    case 'Wealth Strategy':
      return `Actionable strategy viewers can operationalize with systems, not hacks.`;
    case 'Breaking News':
      return `Immediate implications for markets, consumer behavior, and system design.`;
  }
}

function generateAngle(title: string, category: Category): string {
  if (/tax|irs|401k|roth|retire|account/i.test(title)) {
    return 'Systematize tax-advantaged flows with AI-powered checklists.';
  }
  if (/budget|habit|dopamine|discipline|habit/i.test(title)) {
    return 'Turn psychology into daily automations that remove willpower.';
  }
  if (/etf|index|portfolio|rebalance|dividend/i.test(title)) {
    return 'Evidence-based portfolio rules with AI for monitoring and alerts.';
  }
  if (/chatgpt|gpt|agent|automation|zapier|notion|excel|sheet/i.test(title)) {
    return 'Practical build: agents that read, decide, and act on money tasks.';
  }
  return category === 'AI' ? 'Translate AI capability into compounding money systems.' : 'Convert news into durable wealth processes.';
}

function generateTitle(topic: string, category: Category): string {
  const base = topic.replace(/^(breaking:|news:)/i, '').trim();
  switch (category) {
    case 'AI': return `I Built an AI System That ${base}`;
    case 'Money Psychology': return `The Psychology System Behind: ${base}`;
    case 'Wealth Strategy': return `The Wealth System: ${base}`;
    case 'Breaking News': return `Urgent: ${base} (What Your System Must Change)`;
  }
}

function generateHooks(topic: string, category: Category): string[] {
  return unique([
    'Before vs After System',
    '3-Step Flow Diagram',
    'Red Flags vs Green Flags',
    'AI Agent in Action',
    category === 'Breaking News' ? 'Timer + Urgency' : 'KPI Dashboard',
  ]);
}

function generateKeywords(topic: string): string[] {
  const base = topic.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  return unique([
    ...base.slice(0, 6),
    'ai personal finance',
    'money psychology',
    'wealth building',
    'financial freedom',
  ]).slice(0, 12);
}

export function processToTopics(items: RawItem[], regions: RegionCode[], startedAt: number): ResearchResponse {
  const scored = items.map(i => ({ item: i, score: scoreItem(i) }));

  // Group by normalized title key (simple clustering)
  const groups = new Map<string, { title: string; items: RawItem[]; scoreSum: number }>();
  for (const { item, score } of scored) {
    const key = normalizeTitleForKey(item.title);
    const g = groups.get(key) || { title: item.title, items: [], scoreSum: 0 };
    g.items.push(item);
    g.scoreSum += score;
    // Prefer longer, clearer title
    if (item.title.length > g.title.length) g.title = item.title;
    groups.set(key, g);
  }

  // Build topics
  const topics: Topic[] = [];
  for (const [, g] of groups) {
    const category = inferCategory(g.title);
    const mentions = g.items.length;
    const score = g.scoreSum + Math.min(mentions * 0.35, 1.2);
    const why = generateWhy(g.title, category);
    const angle = generateAngle(g.title, category);
    const potential = estimateGrowth(score, mentions);
    const title = generateTitle(g.title, category);
    const hooks = generateHooks(g.title, category);
    const keywords = generateKeywords(g.title);

    topics.push({
      topic: g.title,
      category,
      whyItMatters: why,
      contentAngle: angle,
      potentialGrowth: potential,
      suggestedTitle: title,
      thumbnailHooks: hooks,
      seoKeywords: keywords,
      score,
      sources: g.items,
    });
  }

  // Sort by score desc
  topics.sort((a, b) => b.score - a.score);

  const end = Date.now();
  return {
    generatedAt: new Date(end).toISOString(),
    regions,
    topics,
    meta: {
      totalRawItems: items.length,
      uniqueTopics: topics.length,
      generationMs: end - startedAt,
    },
  };
}
