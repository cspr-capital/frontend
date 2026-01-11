"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey, Transaction } from "casper-js-sdk";
import {
  queryVault,
  queryCollateralRatio,
  queryMaxMintable,
  queryBalance,
  queryCsprBalance,
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

// Helper to sign and submit a transaction (Casper 2.0 format)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function signAndSubmitTransaction(
  tx: Transaction,
  publicKey: string,
  signDeploy: (deployJson: string) => Promise<any>
) {
  const txJson = JSON.stringify(tx.toJSON());
  console.log("[signAndSubmit] Sending to wallet...", tx.toJSON());

  const signResult = await signDeploy(txJson);
  console.log("[signAndSubmit] Sign result:", signResult);

  if (signResult.cancelled) {
    throw new Error("Transaction was cancelled by user");
  }

  if (!signResult.signature) {
    throw new Error("No signature returned from wallet");
  }

  // Add the signature to the transaction
  const pubKey = PublicKey.fromHex(publicKey);

  // The signature needs the algorithm tag prefix
  // Ed25519 = 0x01, Secp256K1 = 0x02
  const tag = publicKey.startsWith("01") ? 0x01 : 0x02;
  const taggedSignature = new Uint8Array(signResult.signature.length + 1);
  taggedSignature[0] = tag;
  taggedSignature.set(signResult.signature, 1);

  console.log("[signAndSubmit] Tagged signature:", taggedSignature);
  tx.setSignature(taggedSignature, pubKey);

  console.log("[signAndSubmit] Submitting transaction to network...");
  const result = await rpcClient.putTransaction(tx);
  console.log("[signAndSubmit] Result:", result);

  return result;
}

const VAULT_QUERY_KEY = "vault";
const BALANCE_QUERY_KEY = "cusd-balance";
const CSPR_BALANCE_QUERY_KEY = "cspr-balance";

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

  const csprBalanceQuery = useQuery({
    queryKey: [CSPR_BALANCE_QUERY_KEY, publicKey],
    queryFn: async (): Promise<bigint> => {
      if (!publicKeyObj) return BigInt(0);
      return queryCsprBalance(publicKeyObj);
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
    queryClient.invalidateQueries({ queryKey: [CSPR_BALANCE_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: ["system-totals"] });
  };

  const openVault = useMutation({
    mutationFn: async () => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildOpenVaultTransaction(publicKeyObj);
      const signedTx = await signAndSubmitTransaction(tx, publicKey, signDeploy);
      return signedTx;
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const closeVault = useMutation({
    mutationFn: async () => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildCloseVaultTransaction(publicKeyObj);
      return signAndSubmitTransaction(tx, publicKey, signDeploy);
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const deposit = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      // buildDepositTransaction is async because it loads proxy_caller.wasm
      const tx = await buildDepositTransaction(publicKeyObj, amount);
      return signAndSubmitTransaction(tx, publicKey, signDeploy);
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const withdraw = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildWithdrawTransaction(publicKeyObj, amount);
      return signAndSubmitTransaction(tx, publicKey, signDeploy);
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const mint = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildMintTransaction(publicKeyObj, amount);
      return signAndSubmitTransaction(tx, publicKey, signDeploy);
    },
    onSuccess: () => {
      invalidateVaultQueries();
    },
  });

  const repay = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!publicKeyObj || !publicKey) throw new Error("Wallet not connected");
      const tx = buildRepayTransaction(publicKeyObj, amount);
      return signAndSubmitTransaction(tx, publicKey, signDeploy);
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
    csprBalance: csprBalanceQuery.data,
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
