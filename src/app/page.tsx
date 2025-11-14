"use client";

import { useEffect, useMemo, useState } from "react";

type Topic = {
  topic: string;
  category: string;
  whyItMatters: string;
  contentAngle: string;
  potentialGrowth: string;
  suggestedTitle: string;
  thumbnailHooks: string[];
  seoKeywords: string[];
  score: number;
  sources: { url: string; source: string; title: string }[];
};

type ResearchResponse = {
  generatedAt: string;
  regions: string[];
  topics: Topic[];
  meta: { totalRawItems: number; uniqueTopics: number; generationMs: number };
};

const regionOptions = ["US", "GB", "CA", "AU", "DE"];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResearchResponse | null>(null);
  const [regions, setRegions] = useState<string[]>(["US", "GB", "CA", "AU", "DE"]);

  const regionsParam = useMemo(() => regions.join(","), [regions]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/research?regions=${regionsParam}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ResearchResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Build Your System ? AI Research Agent</h1>
            <p className="text-sm text-zinc-500">Trending topics for long-form videos (AI ? Money ? Psychology)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {regionOptions.map(r => (
                <label key={r} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="accent-black"
                    checked={regions.includes(r)}
                    onChange={() => {
                      setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
                    }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Refreshing?' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {!data && !loading ? (
          <div className="text-sm text-zinc-600">No data yet.</div>
        ) : null}

        {data && (
          <div className="mb-6 text-sm text-zinc-600">
            <span>Regions: {data.regions.join(', ')}</span>
            <span className="mx-2">?</span>
            <span>Generated: {new Date(data.generatedAt).toLocaleString()}</span>
            <span className="mx-2">?</span>
            <span>Raw items: {data.meta.totalRawItems}</span>
            <span className="mx-2">?</span>
            <span>Unique topics: {data.meta.uniqueTopics}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {data?.topics.slice(0, 30).map((t, idx) => (
            <article key={idx} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-zinc-900 px-2 py-1 text-xs font-medium text-white">{t.category}</span>
                  <span className="text-xs text-zinc-500">Score {t.score.toFixed(2)} ? {t.potentialGrowth}</span>
                </div>
              </div>
              <h2 className="mb-2 text-lg font-semibold leading-snug">{t.topic}</h2>
              <div className="mb-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
                <div>
                  <div className="font-semibold">Why It Matters</div>
                  <p>{t.whyItMatters}</p>
                </div>
                <div>
                  <div className="font-semibold">Content Angle</div>
                  <p>{t.contentAngle}</p>
                </div>
              </div>
              <div className="mb-3 text-sm">
                <div className="font-semibold">Suggested Video Title</div>
                <div className="rounded-md border bg-zinc-50 p-2">{t.suggestedTitle}</div>
              </div>
              <div className="mb-3 text-sm">
                <div className="font-semibold">Thumbnail Hooks</div>
                <div className="flex flex-wrap gap-2">
                  {t.thumbnailHooks.map((h, i) => (
                    <span key={i} className="rounded-full border px-2 py-1 text-xs">{h}</span>
                  ))}
                </div>
              </div>
              <div className="mb-3 text-sm">
                <div className="font-semibold">SEO Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {t.seoKeywords.map((k, i) => (
                    <span key={i} className="rounded-md bg-zinc-100 px-2 py-1 text-xs">{k}</span>
                  ))}
                </div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Sources</div>
                <ul className="list-disc pl-5">
                  {t.sources.slice(0, 6).map((s, i) => (
                    <li key={i} className="truncate">
                      <a className="text-blue-600 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                        [{s.source}] {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {loading && (
          <div className="mt-6 text-sm text-zinc-600">Loading?</div>
        )}
      </main>
    </div>
  );
}
