import { NextRequest } from 'next/server';
import { DEFAULT_REGIONS, runResearch } from '@/lib/research';
import { RegionCode } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionParam = searchParams.get('regions');
    const regions: RegionCode[] = (regionParam ? regionParam.split(',') : DEFAULT_REGIONS)
      .map(r => r.trim().toUpperCase())
      .filter(Boolean) as RegionCode[];

    const data = await runResearch({ regions, now: new Date() });

    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'failed', message: String(err?.message || err) }), { status: 500 });
  }
}
