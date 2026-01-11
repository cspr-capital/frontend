"use client";

import { useQuery } from "@tanstack/react-query";
import {
  querySystemTotals,
  queryParams,
  queryTotalSupply,
  queryIsPaused,
} from "@/lib/casper/contracts";
import { SystemTotals, GovernanceParams } from "@/lib/casper/types";
import { formatCspr, formatCusd, formatBps } from "@/lib/casper/abi";

const SYSTEM_TOTALS_KEY = "system-totals";
const PARAMS_KEY = "governance-params";
const TOTAL_SUPPLY_KEY = "cusd-total-supply";
const PAUSE_STATUS_KEY = "pause-status";

export function useSystemStats() {
  const totalsQuery = useQuery({
    queryKey: [SYSTEM_TOTALS_KEY],
    queryFn: async (): Promise<SystemTotals | null> => {
      return querySystemTotals();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  });

  const paramsQuery = useQuery({
    queryKey: [PARAMS_KEY],
    queryFn: async (): Promise<GovernanceParams | null> => {
      return queryParams();
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  const totalSupplyQuery = useQuery({
    queryKey: [TOTAL_SUPPLY_KEY],
    queryFn: async (): Promise<bigint> => {
      return queryTotalSupply();
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const pauseStatusQuery = useQuery({
    queryKey: [PAUSE_STATUS_KEY],
    queryFn: async () => {
      return queryIsPaused();
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Formatted values
  const formattedTotalCollateral = totalsQuery.data
    ? formatCspr(totalsQuery.data.totalCollateral)
    : "0";

  const formattedTotalDebt = totalsQuery.data
    ? formatCusd(totalsQuery.data.totalDebt)
    : "0";

  const formattedTotalSupply = totalSupplyQuery.data
    ? formatCusd(totalSupplyQuery.data)
    : "0";

  const formattedMcr = paramsQuery.data
    ? formatBps(paramsQuery.data.mcrBps)
    : "-";

  const formattedLr = paramsQuery.data
    ? formatBps(paramsQuery.data.lrBps)
    : "-";

  const formattedBonus = paramsQuery.data
    ? formatBps(paramsQuery.data.liquidationBonusBps)
    : "-";

  return {
    // Raw data
    totals: totalsQuery.data,
    params: paramsQuery.data,
    totalSupply: totalSupplyQuery.data,
    pauseStatus: pauseStatusQuery.data,

    // Formatted values
    formattedTotalCollateral,
    formattedTotalDebt,
    formattedTotalSupply,
    formattedMcr,
    formattedLr,
    formattedBonus,
    vaultCount: totalsQuery.data?.vaultCount ?? 0,

    // Pause status
    isSystemPaused: pauseStatusQuery.data?.system ?? false,
    isMintPaused: pauseStatusQuery.data?.mint ?? false,
    isLiquidationsPaused: pauseStatusQuery.data?.liquidations ?? false,

    // Loading states
    isLoading:
      totalsQuery.isLoading ||
      paramsQuery.isLoading ||
      totalSupplyQuery.isLoading,
    isError: totalsQuery.isError || paramsQuery.isError,

    // Refetch functions
    refetchTotals: totalsQuery.refetch,
    refetchParams: paramsQuery.refetch,
    refetchAll: () => {
      totalsQuery.refetch();
      paramsQuery.refetch();
      totalSupplyQuery.refetch();
      pauseStatusQuery.refetch();
    },
  };
}
