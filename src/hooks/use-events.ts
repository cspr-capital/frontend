"use client";

import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "casper-js-sdk";
import {
  queryRecentEvents,
  filterMintEvents,
  filterLiquidatedEvents,
  filterDepositEvents,
  filterWithdrawEvents,
  filterRepaidEvents,
} from "@/lib/casper/events";
import { formatCusd, formatCspr } from "@/lib/casper/abi";

const EVENTS_QUERY_KEY = "contract-events";

function shortenAddress(address: string): string {
  const hash = address.replace("account-hash-", "").replace("contract-hash-", "");
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function formatTimeAgo(index: number): string {
  // Without timestamps in events, we can only show relative order
  // In a real app, you'd query block timestamps
  return `Event #${index}`;
}

export interface FormattedMint {
  id: string;
  address: string;
  amount: string;
  timestamp: string;
}

export interface FormattedLiquidation {
  id: string;
  address: string;
  collateralSeized: string;
  debtRepaid: string;
  timestamp: string;
}

export function useEvents() {
  const eventsQuery = useQuery({
    queryKey: [EVENTS_QUERY_KEY],
    queryFn: async () => {
      return queryRecentEvents(20);
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const mints = eventsQuery.data ? filterMintEvents(eventsQuery.data) : [];
  const liquidations = eventsQuery.data ? filterLiquidatedEvents(eventsQuery.data) : [];

  // Format for display
  const formattedMints: FormattedMint[] = mints.map((m) => ({
    id: m.id,
    address: shortenAddress(m.owner),
    amount: `${formatCusd(m.amount)} cUSD`,
    timestamp: formatTimeAgo(parseInt(m.id)),
  }));

  const formattedLiquidations: FormattedLiquidation[] = liquidations.map((l) => ({
    id: l.id,
    address: shortenAddress(l.liquidator),
    collateralSeized: `${formatCspr(l.collateralSeized)} CSPR`,
    debtRepaid: `${formatCusd(l.debtRepaid)} cUSD`,
    timestamp: formatTimeAgo(parseInt(l.id)),
  }));

  return {
    events: eventsQuery.data || [],
    mints: formattedMints,
    liquidations: formattedLiquidations,
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    refetch: eventsQuery.refetch,
  };
}

export type TransactionType = "deposit" | "withdraw" | "mint" | "repay";

export interface UserTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  timestamp: string;
  hash: string;
}

// Convert public key hex to account hash hex
function publicKeyToAccountHash(publicKeyHex: string): string | null {
  try {
    const pubKey = PublicKey.fromHex(publicKeyHex);
    return pubKey.accountHash().toHex().toLowerCase();
  } catch (e) {
    console.error("Failed to convert public key to account hash:", e);
    return null;
  }
}

export function useUserTransactions(userPublicKey: string | null) {
  const eventsQuery = useQuery({
    queryKey: [EVENTS_QUERY_KEY, "user", userPublicKey],
    queryFn: async () => {
      return queryRecentEvents(50); // Fetch more to find user's events
    },
    enabled: !!userPublicKey,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Convert public key to account hash for comparison
  const userAccountHash = userPublicKey ? publicKeyToAccountHash(userPublicKey) : null;

  const matchesUser = (eventOwner: string): boolean => {
    if (!userAccountHash) return false;
    // eventOwner format: "account-hash-xxxx" (lowercase)
    const eventHash = eventOwner.toLowerCase().replace("account-hash-", "");
    return eventHash === userAccountHash;
  };

  const transactions: UserTransaction[] = [];

  if (eventsQuery.data) {
    // Get all event types
    const deposits = filterDepositEvents(eventsQuery.data);
    const withdrawals = filterWithdrawEvents(eventsQuery.data);
    const mints = filterMintEvents(eventsQuery.data);
    const repayments = filterRepaidEvents(eventsQuery.data);

    // Filter by user and add to transactions
    deposits.filter((e) => matchesUser(e.owner)).forEach((e) => {
      transactions.push({
        id: e.id,
        type: "deposit",
        amount: `${formatCspr(e.amount)} CSPR`,
        timestamp: `Event #${e.id}`,
        hash: e.id, // We don't have deploy hash in events
      });
    });

    withdrawals.filter((e) => matchesUser(e.owner)).forEach((e) => {
      transactions.push({
        id: e.id,
        type: "withdraw",
        amount: `${formatCspr(e.amount)} CSPR`,
        timestamp: `Event #${e.id}`,
        hash: e.id,
      });
    });

    mints.filter((e) => matchesUser(e.owner)).forEach((e) => {
      transactions.push({
        id: e.id,
        type: "mint",
        amount: `${formatCusd(e.amount)} cUSD`,
        timestamp: `Event #${e.id}`,
        hash: e.id,
      });
    });

    repayments.filter((e) => matchesUser(e.owner)).forEach((e) => {
      transactions.push({
        id: e.id,
        type: "repay",
        amount: `${formatCusd(e.amount)} cUSD`,
        timestamp: `Event #${e.id}`,
        hash: e.id,
      });
    });

    // Sort by event index (most recent first)
    transactions.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }

  return {
    transactions,
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    refetch: eventsQuery.refetch,
  };
}
