"use client";

import { useQuery } from "@tanstack/react-query";
import { queryPrice, queryParams } from "@/lib/casper/contracts";
import { PriceRound, GovernanceParams, DECIMALS } from "@/lib/casper/types";
import { formatPrice } from "@/lib/casper/abi";

const PRICE_QUERY_KEY = "oracle-price";
const PARAMS_KEY = "governance-params";

export function useOracle() {
  const priceQuery = useQuery({
    queryKey: [PRICE_QUERY_KEY],
    queryFn: async (): Promise<PriceRound | null> => {
      return queryPrice();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000,
  });

  const paramsQuery = useQuery({
    queryKey: [PARAMS_KEY],
    queryFn: async (): Promise<GovernanceParams | null> => {
      return queryParams();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const priceUsd = priceQuery.data
    ? Number(priceQuery.data.price) / 10 ** DECIMALS.PRICE
    : null;

  const formattedPrice = priceQuery.data
    ? formatPrice(priceQuery.data.price)
    : null;

  const lastUpdated = priceQuery.data
    ? new Date(priceQuery.data.timestamp * 1000)
    : null;

  // Use maxPriceStaleness from contract params
  const maxStaleness = paramsQuery.data?.maxPriceStaleness ?? 0;
  const isFresh = priceQuery.data && maxStaleness > 0
    ? Date.now() / 1000 - priceQuery.data.timestamp < maxStaleness
    : false;

  return {
    price: priceQuery.data?.price ?? null,
    priceUsd,
    formattedPrice,
    timestamp: priceQuery.data?.timestamp ?? null,
    roundId: priceQuery.data?.roundId ?? null,
    lastUpdated,
    isFresh,
    maxPriceStaleness: maxStaleness,
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    error: priceQuery.error,
    refetch: priceQuery.refetch,
  };
}
