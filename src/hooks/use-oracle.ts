"use client";

import { useQuery } from "@tanstack/react-query";
import { queryPrice } from "@/lib/casper/contracts";
import { PriceRound, DECIMALS } from "@/lib/casper/types";
import { formatPrice } from "@/lib/casper/abi";

const PRICE_QUERY_KEY = "oracle-price";

export function useOracle() {
  const priceQuery = useQuery({
    queryKey: [PRICE_QUERY_KEY],
    queryFn: async (): Promise<PriceRound | null> => {
      return queryPrice();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000,
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

  const isFresh = priceQuery.data
    ? Date.now() / 1000 - priceQuery.data.timestamp < 3600 // 1 hour
    : false;

  return {
    price: priceQuery.data?.price ?? null,
    priceUsd,
    formattedPrice,
    timestamp: priceQuery.data?.timestamp ?? null,
    roundId: priceQuery.data?.roundId ?? null,
    lastUpdated,
    isFresh,
    isLoading: priceQuery.isLoading,
    isError: priceQuery.isError,
    error: priceQuery.error,
    refetch: priceQuery.refetch,
  };
}
