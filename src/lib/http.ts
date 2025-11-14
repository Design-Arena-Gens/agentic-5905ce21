const DEFAULT_TIMEOUT_MS = 15000;

export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'user-agent': 'BuildYourSystemResearchBot/1.0 (+https://agentic-5905ce21.vercel.app)',
        ...(init.headers || {}),
      },
      cache: 'no-store',
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export function safeJson<T = any>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}
