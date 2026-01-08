"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey } from "casper-js-sdk";
import { queryLiquidationStats, clearCache } from "@/lib/casper/contracts";
import { buildLiquidateTransaction } from "@/lib/casper/transactions";
import { rpcClient } from "@/lib/casper/client";
import { useWallet } from "./use-wallet";
import { LiquidationStats } from "@/lib/casper/types";
import { formatCspr, formatCusd } from "@/lib/casper/abi";
import type { LiquidatableVault } from "@/components/liquidations/liquidatable-vault-list";

const LIQUIDATION_STATS_KEY = "liquidation-stats";
const LIQUIDATABLE_VAULTS_KEY = "liquidatable-vaults";

export function useLiquidations() {
  const { publicKey, signDeploy, isConnected } = useWallet();
  const queryClient = useQueryClient();

  const publicKeyObj = publicKey ? PublicKey.fromHex(publicKey) : null;

  const statsQuery = useQuery({
    queryKey: [LIQUIDATION_STATS_KEY],
    queryFn: async (): Promise<LiquidationStats | null> => {
      return queryLiquidationStats();
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // In production, this would query an indexer for liquidatable vaults
  // For now, we return an empty array as a placeholder
  const liquidatableVaultsQuery = useQuery({
    queryKey: [LIQUIDATABLE_VAULTS_KEY],
    queryFn: async (): Promise<LiquidatableVault[]> => {
      // TODO: Implement indexer query for liquidatable vaults
      // This requires scanning all vaults and checking their CR against LR
      return [];
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const invalidateLiquidationQueries = () => {
    clearCache();
    queryClient.invalidateQueries({ queryKey: [LIQUIDATION_STATS_KEY] });
    queryClient.invalidateQueries({ queryKey: [LIQUIDATABLE_VAULTS_KEY] });
    queryClient.invalidateQueries({ queryKey: ["system-totals"] });
    queryClient.invalidateQueries({ queryKey: ["vault"] });
  };

  const liquidate = useMutation({
    mutationFn: async ({
      vaultOwner,
      repayAmount,
    }: {
      vaultOwner: string;
      repayAmount: bigint;
    }) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");

      const ownerPubKey = PublicKey.fromHex(vaultOwner);
      const tx = buildLiquidateTransaction(
        publicKeyObj,
        ownerPubKey,
        repayAmount
      );
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateLiquidationQueries();
    },
  });

  // Formatted stats
  const formattedTotalDebtRepaid = statsQuery.data
    ? formatCusd(statsQuery.data.totalDebtRepaid)
    : "0";

  const formattedTotalCollateralSeized = statsQuery.data
    ? formatCspr(statsQuery.data.totalCollateralSeized)
    : "0";

  return {
    // Stats
    stats: statsQuery.data,
    totalLiquidations: statsQuery.data?.totalLiquidations ?? 0,
    formattedTotalDebtRepaid,
    formattedTotalCollateralSeized,

    // Liquidatable vaults
    liquidatableVaults: liquidatableVaultsQuery.data ?? [],
    liquidatableCount: liquidatableVaultsQuery.data?.length ?? 0,

    // Loading states
    isLoading: statsQuery.isLoading || liquidatableVaultsQuery.isLoading,
    isError: statsQuery.isError || liquidatableVaultsQuery.isError,

    // Mutation
    liquidate,
    isLiquidating: liquidate.isPending,
    liquidateError: liquidate.error,

    // Helpers
    refetch: invalidateLiquidationQueries,
    canLiquidate: isConnected && (liquidatableVaultsQuery.data?.length ?? 0) > 0,
  };
}
