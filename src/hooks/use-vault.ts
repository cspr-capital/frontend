"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey } from "casper-js-sdk";
import {
  queryVault,
  queryCollateralRatio,
  queryMaxMintable,
  queryBalance,
  clearCache,
} from "@/lib/casper/contracts";
import {
  buildOpenVaultTransaction,
  buildCloseVaultTransaction,
  buildDepositTransaction,
  buildWithdrawTransaction,
  buildMintTransaction,
  buildRepayTransaction,
} from "@/lib/casper/transactions";
import { rpcClient } from "@/lib/casper/client";
import { useWallet } from "./use-wallet";
import { Vault } from "@/lib/casper/types";

const VAULT_QUERY_KEY = "vault";
const BALANCE_QUERY_KEY = "cusd-balance";

export function useVault() {
  const { publicKey, signDeploy, isConnected } = useWallet();
  const queryClient = useQueryClient();

  const publicKeyObj = publicKey ? PublicKey.fromHex(publicKey) : null;

  const vaultQuery = useQuery({
    queryKey: [VAULT_QUERY_KEY, publicKey],
    queryFn: async (): Promise<Vault | null> => {
      if (!publicKeyObj) return null;
      return queryVault(publicKeyObj);
    },
    enabled: !!publicKey && isConnected,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const collateralRatioQuery = useQuery({
    queryKey: ["collateral-ratio", publicKey],
    queryFn: async (): Promise<number | null> => {
      if (!publicKeyObj) return null;
      return queryCollateralRatio(publicKeyObj);
    },
    enabled: !!publicKey && isConnected && !!vaultQuery.data,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const maxMintableQuery = useQuery({
    queryKey: ["max-mintable", publicKey],
    queryFn: async (): Promise<bigint> => {
      if (!publicKeyObj) return BigInt(0);
      return queryMaxMintable(publicKeyObj);
    },
    enabled: !!publicKey && isConnected && !!vaultQuery.data,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const balanceQuery = useQuery({
    queryKey: [BALANCE_QUERY_KEY, publicKey],
    queryFn: async (): Promise<bigint> => {
      if (!publicKeyObj) return BigInt(0);
      return queryBalance(publicKeyObj);
    },
    enabled: !!publicKey && isConnected,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const invalidateVaultQueries = () => {
    clearCache();
    queryClient.invalidateQueries({ queryKey: [VAULT_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: ["collateral-ratio"] });
    queryClient.invalidateQueries({ queryKey: ["max-mintable"] });
    queryClient.invalidateQueries({ queryKey: [BALANCE_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: ["system-totals"] });
  };

  const openVault = useMutation({
    mutationFn: async () => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildOpenVaultTransaction(publicKeyObj);
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const closeVault = useMutation({
    mutationFn: async () => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildCloseVaultTransaction(publicKeyObj);
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const deposit = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildDepositTransaction(publicKeyObj, amount);
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const withdraw = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildWithdrawTransaction(publicKeyObj, amount);
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const mint = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildMintTransaction(publicKeyObj, amount);
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const repay = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildRepayTransaction(publicKeyObj, amount);
      const deployJson = JSON.stringify(tx.toJSON());
      const { deploy } = await signDeploy(deployJson);
      const result = await rpcClient.putDeploy(JSON.parse(deploy));
      return result;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  return {
    // Queries
    vault: vaultQuery.data,
    collateralRatio: collateralRatioQuery.data,
    maxMintable: maxMintableQuery.data,
    cusdBalance: balanceQuery.data,
    isLoading:
      vaultQuery.isLoading ||
      collateralRatioQuery.isLoading ||
      maxMintableQuery.isLoading,
    isError: vaultQuery.isError,
    error: vaultQuery.error,
    hasVault: !!vaultQuery.data,

    // Mutations
    openVault,
    closeVault,
    deposit,
    withdraw,
    mint,
    repay,

    // Helpers
    refetch: invalidateVaultQueries,
  };
}
