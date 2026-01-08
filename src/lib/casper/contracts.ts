import { PublicKey } from "casper-js-sdk";
import { rpcClient } from "./client";
import {
  Vault,
  SystemTotals,
  PriceRound,
  GovernanceParams,
  LiquidationStats,
  ContractAddresses,
  STORAGE_KEYS,
} from "./types";
import {
  parseU256,
  parseU64,
  parseBool,
  formatCspr,
  formatCusd,
} from "./abi";

let contractAddresses: ContractAddresses | null = null;

export function setContractAddresses(addresses: ContractAddresses): void {
  contractAddresses = addresses;
}

export function getContractAddresses(): ContractAddresses {
  if (!contractAddresses) {
    throw new Error("Contract addresses not configured");
  }
  return contractAddresses;
}

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL_MS = 10_000; // 10 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

export function clearCache(): void {
  cache.clear();
}

async function queryContractState(
  contractHash: string,
  key: string
): Promise<unknown | null> {
  try {
    const result = await rpcClient.queryLatestGlobalState(
      contractHash,
      [key]
    );
    if (result.storedValue) {
      return result.storedValue;
    }
    return null;
  } catch (error) {
    console.error(`Failed to query ${key} from ${contractHash}:`, error);
    return null;
  }
}

async function queryContractDictionary(
  contractHash: string,
  dictionaryName: string,
  dictionaryKey: string
): Promise<unknown | null> {
  try {
    const result = await rpcClient.getDictionaryItemByIdentifier(null, {
      contractNamedKey: {
        key: contractHash,
        dictionaryName: dictionaryName,
        dictionaryItemKey: dictionaryKey,
      },
    });
    if (result.storedValue) {
      return result.storedValue;
    }
    return null;
  } catch (error) {
    console.error(
      `Failed to query dictionary ${dictionaryName}[${dictionaryKey}]:`,
      error
    );
    return null;
  }
}

export async function queryVault(owner: PublicKey): Promise<Vault | null> {
  const addresses = getContractAddresses();
  const accountHash = owner.accountHash().toPrefixedString();
  const cacheKey = `vault:${accountHash}`;

  const cached = getCached<Vault>(cacheKey);
  if (cached) return cached;

  try {
    const result = await queryContractDictionary(
      addresses.vaultManager,
      STORAGE_KEYS.VAULTS,
      accountHash
    );

    if (!result) return null;

    const storedValue = result as { CLValue?: { Map?: Map<string, unknown> } };
    if (!storedValue.CLValue?.Map) return null;

    const map = storedValue.CLValue.Map;
    const vault: Vault = {
      collateral: BigInt((map.get("collateral") as string) || "0"),
      debt: BigInt((map.get("debt") as string) || "0"),
      createdAt: Number((map.get("created_at") as string) || "0"),
      updatedAt: Number((map.get("updated_at") as string) || "0"),
    };

    if (vault.collateral > BigInt(0) || vault.debt > BigInt(0)) {
      setCache(cacheKey, vault);
      return vault;
    }

    return null;
  } catch (error) {
    console.error("Failed to query vault:", error);
    return null;
  }
}

export async function queryPrice(): Promise<PriceRound | null> {
  const addresses = getContractAddresses();
  const cacheKey = "price:latest";

  const cached = getCached<PriceRound>(cacheKey);
  if (cached) return cached;

  try {
    const priceResult = await queryContractState(
      addresses.vaultManager,
      STORAGE_KEYS.PRICE
    );
    const timestampResult = await queryContractState(
      addresses.vaultManager,
      STORAGE_KEYS.PRICE_TIMESTAMP
    );

    if (!priceResult) return null;

    const price: PriceRound = {
      price: BigInt((priceResult as { CLValue?: string })?.CLValue || "0"),
      timestamp: Number(
        (timestampResult as { CLValue?: string })?.CLValue || "0"
      ),
      roundId: 0,
    };

    setCache(cacheKey, price, 5000); // 5 second cache for price
    return price;
  } catch (error) {
    console.error("Failed to query price:", error);
    return null;
  }
}

export async function querySystemTotals(): Promise<SystemTotals | null> {
  const addresses = getContractAddresses();
  const cacheKey = "system:totals";

  const cached = getCached<SystemTotals>(cacheKey);
  if (cached) return cached;

  try {
    const [collateralResult, debtResult, countResult] = await Promise.all([
      queryContractState(addresses.vaultManager, STORAGE_KEYS.TOTAL_COLLATERAL),
      queryContractState(addresses.vaultManager, STORAGE_KEYS.TOTAL_DEBT),
      queryContractState(addresses.vaultManager, STORAGE_KEYS.VAULT_COUNT),
    ]);

    const totals: SystemTotals = {
      totalCollateral: BigInt(
        (collateralResult as { CLValue?: string })?.CLValue || "0"
      ),
      totalDebt: BigInt((debtResult as { CLValue?: string })?.CLValue || "0"),
      vaultCount: Number((countResult as { CLValue?: string })?.CLValue || "0"),
    };

    setCache(cacheKey, totals);
    return totals;
  } catch (error) {
    console.error("Failed to query system totals:", error);
    return null;
  }
}

export async function queryParams(): Promise<GovernanceParams | null> {
  const addresses = getContractAddresses();
  const cacheKey = "governance:params";

  const cached = getCached<GovernanceParams>(cacheKey);
  if (cached) return cached;

  try {
    const [mcrResult, debtFloorResult, debtCeilingResult] = await Promise.all([
      queryContractState(addresses.vaultManager, STORAGE_KEYS.MCR_BPS),
      queryContractState(addresses.vaultManager, STORAGE_KEYS.DEBT_FLOOR),
      queryContractState(addresses.vaultManager, STORAGE_KEYS.DEBT_CEILING),
    ]);

    const params: GovernanceParams = {
      mcrBps: Number((mcrResult as { CLValue?: string })?.CLValue || "17000"),
      lrBps: 15000, // Default LR
      liquidationBonusBps: 1000, // Default bonus
      maxPriceStaleness: 3600, // Default staleness
      debtFloor: BigInt(
        (debtFloorResult as { CLValue?: string })?.CLValue ||
          "50000000000000000000"
      ),
      debtCeiling: BigInt(
        (debtCeilingResult as { CLValue?: string })?.CLValue ||
          "1000000000000000000000000"
      ),
    };

    setCache(cacheKey, params, 60000); // 1 minute cache for params
    return params;
  } catch (error) {
    console.error("Failed to query params:", error);
    return null;
  }
}

export async function queryBalance(owner: PublicKey): Promise<bigint> {
  const addresses = getContractAddresses();
  const accountHash = owner.accountHash().toPrefixedString();
  const cacheKey = `balance:${accountHash}`;

  const cached = getCached<bigint>(cacheKey);
  if (cached !== null) return cached;

  try {
    const result = await queryContractDictionary(
      addresses.cusdToken,
      STORAGE_KEYS.BALANCES,
      accountHash
    );

    if (!result) return BigInt(0);

    const balance = BigInt(
      (result as { CLValue?: string })?.CLValue || "0"
    );
    setCache(cacheKey, balance);
    return balance;
  } catch (error) {
    console.error("Failed to query balance:", error);
    return BigInt(0);
  }
}

export async function queryTotalSupply(): Promise<bigint> {
  const addresses = getContractAddresses();
  const cacheKey = "cusd:totalSupply";

  const cached = getCached<bigint>(cacheKey);
  if (cached !== null) return cached;

  try {
    const result = await queryContractState(
      addresses.cusdToken,
      STORAGE_KEYS.TOTAL_SUPPLY
    );

    const supply = BigInt((result as { CLValue?: string })?.CLValue || "0");
    setCache(cacheKey, supply);
    return supply;
  } catch (error) {
    console.error("Failed to query total supply:", error);
    return BigInt(0);
  }
}

export async function queryLiquidationStats(): Promise<LiquidationStats | null> {
  const addresses = getContractAddresses();
  const cacheKey = "liquidation:stats";

  const cached = getCached<LiquidationStats>(cacheKey);
  if (cached) return cached;

  try {
    // Query liquidation module stats
    // This is a simplified version - actual implementation depends on contract structure
    const stats: LiquidationStats = {
      totalLiquidations: 0,
      totalDebtRepaid: BigInt(0),
      totalCollateralSeized: BigInt(0),
    };

    setCache(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error("Failed to query liquidation stats:", error);
    return null;
  }
}

export async function queryIsPaused(): Promise<{
  system: boolean;
  mint: boolean;
  liquidations: boolean;
}> {
  const addresses = getContractAddresses();
  const cacheKey = "governance:paused";

  const cached = getCached<{
    system: boolean;
    mint: boolean;
    liquidations: boolean;
  }>(cacheKey);
  if (cached) return cached;

  try {
    const [systemResult, mintResult, liqResult] = await Promise.all([
      queryContractState(addresses.governance, STORAGE_KEYS.SYSTEM_PAUSED),
      queryContractState(addresses.governance, STORAGE_KEYS.MINT_PAUSED),
      queryContractState(
        addresses.governance,
        STORAGE_KEYS.LIQUIDATIONS_PAUSED
      ),
    ]);

    const paused = {
      system: (systemResult as { CLValue?: boolean })?.CLValue === true,
      mint: (mintResult as { CLValue?: boolean })?.CLValue === true,
      liquidations: (liqResult as { CLValue?: boolean })?.CLValue === true,
    };

    setCache(cacheKey, paused, 5000);
    return paused;
  } catch (error) {
    console.error("Failed to query pause status:", error);
    return { system: false, mint: false, liquidations: false };
  }
}

export async function queryCollateralRatio(
  owner: PublicKey
): Promise<number | null> {
  const [vault, price] = await Promise.all([queryVault(owner), queryPrice()]);

  if (!vault || !price || vault.debt === BigInt(0)) {
    return null;
  }

  // collateral_value = collateral * price / 10^9
  // ratio_bps = collateral_value * 10000 * 10^10 / debt
  const collateralValue =
    (vault.collateral * price.price) / BigInt(10 ** 9);
  const scaledValue =
    collateralValue * BigInt(10000) * BigInt(10 ** 10);
  const ratioBps = scaledValue / vault.debt;

  return Number(ratioBps);
}

export async function queryMaxMintable(owner: PublicKey): Promise<bigint> {
  const [vault, price, params] = await Promise.all([
    queryVault(owner),
    queryPrice(),
    queryParams(),
  ]);

  if (!vault || !price || !params) {
    return BigInt(0);
  }

  // collateral_value = collateral * price / 10^9
  // max_debt = collateral_value * 10000 * 10^10 / mcr_bps
  // max_mintable = max_debt - current_debt
  const collateralValue =
    (vault.collateral * price.price) / BigInt(10 ** 9);
  const maxDebt =
    (collateralValue * BigInt(10000) * BigInt(10 ** 10)) /
    BigInt(params.mcrBps);

  if (maxDebt > vault.debt) {
    return maxDebt - vault.debt;
  }

  return BigInt(0);
}
