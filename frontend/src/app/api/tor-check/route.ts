import { NextRequest, NextResponse } from 'next/server';

const TOR_EXIT_LIST_URL = 'https://check.torproject.org/torbulkexitlist';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Module-level cache — persists across warm serverless invocations
let cachedExitNodes: Set<string> | null = null;
let cacheTimestamp = 0;

async function getExitNodes(): Promise<Set<string>> {
  const now = Date.now();

  if (cachedExitNodes && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedExitNodes;
  }

  try {
    const res = await fetch(TOR_EXIT_LIST_URL, {
      next: { revalidate: 3600 }, // Next.js fetch cache — 1 hour
    });

    if (!res.ok) {
      // If fetch fails but we have a stale cache, use it
      if (cachedExitNodes) return cachedExitNodes;
      throw new Error(`Failed to fetch exit list: ${res.status}`);
    }

    const text = await res.text();
    const ips = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    cachedExitNodes = new Set(ips);
    cacheTimestamp = now;
    return cachedExitNodes;
  } catch (err) {
    // Return stale cache if available, empty set otherwise
    if (cachedExitNodes) return cachedExitNodes;
    console.error('Tor exit list fetch failed:', err);
    return new Set();
  }
}

function getClientIp(req: NextRequest): string | null {
  // Vercel sets x-real-ip; standard proxies use x-forwarded-for
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return null;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);

  if (!ip) {
    return NextResponse.json({ tor: false, reason: 'no-ip' });
  }

  const exitNodes = await getExitNodes();
  const isTor = exitNodes.has(ip);

  return NextResponse.json({ tor: isTor });
}
