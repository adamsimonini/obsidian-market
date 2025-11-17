import { useMemo } from '@lynx-js/react';
import type { Market } from '../types/supabase';
import { useAleoState, type AleoMarketState } from './useAleoState';

// Combined market data (Supabase metadata + Aleo financial data)
export interface CombinedMarketData extends Market {
  aleoState: AleoMarketState | null;
  aleoLoading: boolean;
  aleoError: Error | null;
}

export function useMarketData(market: Market): CombinedMarketData {
  const {
    state: aleoState,
    loading: aleoLoading,
    error: aleoError,
  } = useAleoState(market.market_id_onchain);

  const combinedData = useMemo<CombinedMarketData>(
    () => ({
      ...market,
      aleoState,
      aleoLoading,
      aleoError,
    }),
    [market, aleoState, aleoLoading, aleoError],
  );

  return combinedData;
}
