/**
 * DEV-ONLY route: /dev/onchain
 *
 * Queries the Aleo testnet API for all on-chain markets in the
 * obsidian_market.aleo program and displays them alongside the
 * corresponding Supabase rows for a quick sanity check.
 *
 * Not linked anywhere in the UI — access directly via URL.
 */

import { createClient } from '@supabase/supabase-js';

const ALEO_API = 'https://api.explorer.provable.com/v1';
const NETWORK = 'testnet';
const PROGRAM = 'obsidian_market.aleo';
const MAX_MARKET_ID = 20; // scan IDs 1..20

// ── Types ────────────────────────────────────────────────────────────────

interface AleoMarket {
  id: string;
  creator: string;
  market_type: string;
  yes_reserves: string;
  no_reserves: string;
  status: string;
}

interface SupabaseRow {
  slug: string;
  market_id_onchain: string | null;
  yes_reserves: number;
  no_reserves: number;
  status: string;
  yes_price: number;
  no_price: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Parse the Aleo mapping response text into a structured object. */
function parseAleoMarket(raw: string): AleoMarket | null {
  // Response looks like:
  // "{ id: 1u64, creator: aleo1..., market_type: 1u8, yes_reserves: 70000000u64, ... }"
  if (!raw || raw === 'null') return null;

  const extract = (key: string): string => {
    const re = new RegExp(`${key}:\\s*([^,}]+)`);
    const m = raw.match(re);
    return m ? m[1].trim() : '';
  };

  return {
    id: extract('id'),
    creator: extract('creator'),
    market_type: extract('market_type'),
    yes_reserves: extract('yes_reserves'),
    no_reserves: extract('no_reserves'),
    status: extract('status'),
  };
}

function stripTypeSuffix(val: string): string {
  return val.replace(/u\d+$/, '');
}

function statusLabel(raw: string): string {
  const code = stripTypeSuffix(raw);
  const map: Record<string, string> = {
    '0': 'Open',
    '1': 'Closed',
    '2': 'Resolved',
    '3': 'Cancelled',
  };
  return map[code] ?? `Unknown (${raw})`;
}

function microToAleo(micro: string | number): string {
  const n = typeof micro === 'string' ? parseInt(stripTypeSuffix(micro), 10) : micro;
  if (isNaN(n)) return '—';
  return `${(n / 1_000_000).toFixed(2)} ALEO`;
}

// ── Data fetching ────────────────────────────────────────────────────────

async function fetchOnchainMarkets(): Promise<{ id: number; market: AleoMarket }[]> {
  const results: { id: number; market: AleoMarket }[] = [];

  // Fire all requests concurrently
  const promises = Array.from({ length: MAX_MARKET_ID }, (_, i) => {
    const id = i + 1;
    const url = `${ALEO_API}/${NETWORK}/program/${PROGRAM}/mapping/markets/${id}u64`;
    return fetch(url, { next: { revalidate: 0 } })
      .then((r) => r.text())
      .then((text) => ({ id, text }))
      .catch(() => ({ id, text: 'null' }));
  });

  const responses = await Promise.all(promises);

  for (const { id, text } of responses) {
    const parsed = parseAleoMarket(text);
    if (parsed) results.push({ id, market: parsed });
  }

  return results.sort((a, b) => a.id - b.id);
}

async function fetchSupabaseMarkets(): Promise<SupabaseRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('markets')
    .select('slug, market_id_onchain, yes_reserves, no_reserves, status, yes_price, no_price')
    .order('slug');

  return (data ?? []) as SupabaseRow[];
}

// ── Page ─────────────────────────────────────────────────────────────────

export default async function OnchainDevPage() {
  const [onchain, supabase] = await Promise.all([
    fetchOnchainMarkets(),
    fetchSupabaseMarkets(),
  ]);

  // Build a lookup from market_id_onchain → supabase row
  const dbByOnchainId = new Map<string, SupabaseRow>();
  for (const row of supabase) {
    if (row.market_id_onchain) {
      dbByOnchainId.set(row.market_id_onchain, row);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 font-mono text-sm">
      <div>
        <h1 className="mb-1 text-xl font-bold">On-Chain Markets (Dev)</h1>
        <p className="text-xs text-muted-foreground">
          Queried {MAX_MARKET_ID} IDs from{' '}
          <code className="rounded bg-muted px-1">{PROGRAM}</code> on {NETWORK}.
          Found <strong>{onchain.length}</strong> market(s).
        </p>
      </div>

      {/* ── On-chain markets ──────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Aleo Testnet State</h2>
        {onchain.length === 0 ? (
          <p className="text-muted-foreground">No on-chain markets found (IDs 1–{MAX_MARKET_ID}).</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">YES Reserves</th>
                  <th className="px-3 py-2">NO Reserves</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Creator</th>
                  <th className="px-3 py-2">DB Slug</th>
                </tr>
              </thead>
              <tbody>
                {onchain.map(({ id, market }) => {
                  const dbRow = dbByOnchainId.get(String(id));
                  return (
                    <tr key={id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2 font-bold">{id}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            stripTypeSuffix(market.status) === '0'
                              ? 'text-green-500'
                              : 'text-amber-500'
                          }
                        >
                          {statusLabel(market.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2">{microToAleo(market.yes_reserves)}</td>
                      <td className="px-3 py-2">{microToAleo(market.no_reserves)}</td>
                      <td className="px-3 py-2">{stripTypeSuffix(market.market_type)}</td>
                      <td className="px-3 py-2 text-xs">
                        {market.creator.slice(0, 12)}...{market.creator.slice(-6)}
                      </td>
                      <td className="px-3 py-2">
                        {dbRow ? (
                          <span className="text-green-500">{dbRow.slug}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Supabase markets ──────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Supabase Markets ({supabase.length})
        </h2>
        {supabase.length === 0 ? (
          <p className="text-muted-foreground">No Supabase rows found. Is Supabase running?</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">On-Chain ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">YES Reserves</th>
                  <th className="px-3 py-2">NO Reserves</th>
                  <th className="px-3 py-2">YES Price</th>
                  <th className="px-3 py-2">NO Price</th>
                </tr>
              </thead>
              <tbody>
                {supabase.map((row) => {
                  const linked = row.market_id_onchain !== null;
                  return (
                    <tr
                      key={row.slug}
                      className={`border-b last:border-0 hover:bg-muted/30 ${
                        !linked ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2 font-semibold">{row.slug}</td>
                      <td className="px-3 py-2">
                        {linked ? (
                          <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-green-500">
                            {row.market_id_onchain}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">NULL</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{microToAleo(row.yes_reserves)}</td>
                      <td className="px-3 py-2">{microToAleo(row.no_reserves)}</td>
                      <td className="px-3 py-2">{(row.yes_price * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2">{(row.no_price * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Raw JSON dump ─────────────────────────────────────────── */}
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
          Raw On-Chain JSON
        </summary>
        <pre className="mt-3 overflow-x-auto text-xs">
          {JSON.stringify(onchain, null, 2)}
        </pre>
      </details>
    </div>
  );
}
