import { PublicKey, byteHash } from "casper-js-sdk";
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

// State URefs for each contract (from deployed contracts' named keys)
// These are read from environment variables set in .env.local
const STATE_UREFS = {
  vaultManager: process.env.NEXT_PUBLIC_VAULT_MANAGER_STATE_UREF || "",
  liquidationModule: process.env.NEXT_PUBLIC_LIQUIDATION_MODULE_STATE_UREF || "",
  cusdToken: process.env.NEXT_PUBLIC_CUSD_TOKEN_STATE_UREF || "",
  oracleFeed: process.env.NEXT_PUBLIC_ORACLE_FEED_STATE_UREF || "",
  governance: process.env.NEXT_PUBLIC_GOVERNANCE_STATE_UREF || "",
};

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

// Odra field index for vaults Mapping in VaultManager
// Based on debugging: vaults Mapping is at index 1 (Odra indexes from 1, not 0)
const VAULT_MANAGER_VAULTS_INDEX = 1;

export async function queryVault(owner: PublicKey): Promise<Vault | null> {
  const accountHash = owner.accountHash().toHex();
  const cacheKey = `vault:${accountHash}`;

  const cached = getCached<Vault>(cacheKey);
  if (cached) {
    console.log("[queryVault] Returning cached vault for", accountHash);
    return cached;
  }

console.log("[queryVault] Querying vault for", accountHash);

try {
  // Query the vaults Mapping (index 0) with the owner's account hash
  const vaultBytes = await queryOdraMappingByAddress(
    STATE_UREFS.vaultManager,
    VAULT_MANAGER_VAULTS_INDEX,
    accountHash
  );

  if (!vaultBytes) {
    console.log(`[queryVault] No vault found for ${accountHash}`);
    return null;
  }

  console.log(`[queryVault] Found vault bytes:`, vaultBytes);
  const vault = parseVaultFromHex(vaultBytes);
  setCache(cacheKey, vault);
  return vault;
} catch (error) {
  console.error("Failed to query vault:", error);
  return null;
}
}

function parseVaultFromHex(hex: string): Vault {
  const bytes = hexToBytes(hex);
  let offset = 4; // Skip 4-byte outer wrapper

  const collateralLen = bytes[offset]; offset += 1;
  let collateral = BigInt(0);
  for (let i = 0; i < collateralLen && (offset + i) < bytes.length; i++) {
    collateral = collateral | (BigInt(bytes[offset + i]) << BigInt(i * 8));
  }
  offset += collateralLen;

  const debtLen = bytes[offset]; offset += 1;
  let debt = BigInt(0);
  for (let i = 0; i < debtLen && (offset + i) < bytes.length; i++) {
    debt = debt | (BigInt(bytes[offset + i]) << BigInt(i * 8));
  }
  offset += debtLen;

  const createdAt = readU64LE(bytes, offset); offset += 8;
  const updatedAt = readU64LE(bytes, offset);

  return { collateral, debt, createdAt, updatedAt };
}

export async function queryPrice(): Promise<PriceRound | null> {
  const cacheKey = "price:latest";

  const cached = getCached<PriceRound>(cacheKey);
  if (cached) return cached;

  try {
    // Query VaultManager's price (index 9) and price_timestamp (index 10)
    const [priceBytes, timestampBytes] = await Promise.all([
      queryOdraDictionary(STATE_UREFS.vaultManager, VM_INDICES.price),
      queryOdraDictionary(STATE_UREFS.vaultManager, VM_INDICES.price_timestamp),
    ]);

    console.log("[queryPrice] Raw bytes:", { priceBytes, timestampBytes });

    if (!priceBytes) {
      console.log("[queryPrice] No price bytes returned");
      return null;
    }

    // Parse U256 from bytes (little-endian, first byte is length)
    const priceValue = parseU256FromHex(priceBytes);
    const timestampValue = timestampBytes ? parseU64FromHex(timestampBytes) : 0;

    // Timestamp from Casper is in milliseconds, convert to seconds
    const timestampSeconds = Math.floor(timestampValue / 1000);

    const price: PriceRound = {
      price: priceValue,
      timestamp: timestampSeconds,
      roundId: 0,
    };

    setCache(cacheKey, price, 5000); // 5 second cache for price
    return price;
  } catch (error) {
    console.error("Failed to query price:", error);
    return null;
  }
}

function parseU256FromHex(hex: string): bigint {
  if (!hex || hex.length < 10) return BigInt(0);
  const bytes = hexToBytes(hex);
  if (bytes.length < 5) return BigInt(0);

  const u256Length = bytes[4];
  if (u256Length === 0) return BigInt(0);

  let value = BigInt(0);
  for (let i = 0; i < u256Length && (5 + i) < bytes.length; i++) {
    value = value | (BigInt(bytes[5 + i]) << BigInt(i * 8));
  }

  return value;
}

function parseU64FromHex(hex: string): number {
  if (!hex || hex.length < 8) return 0;
  const bytes = hexToBytes(hex);
  if (bytes.length < 4) return 0;

  const outerLength = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
  if (outerLength === 0 || bytes.length < 4 + outerLength) return 0;

  let value = BigInt(0);
  for (let i = 0; i < outerLength && i < 8; i++) {
    value = value | (BigInt(bytes[4 + i]) << BigInt(i * 8));
  }

  return Number(value);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export async function querySystemTotals(): Promise<SystemTotals | null> {
  const cacheKey = "system:totals";

  const cached = getCached<SystemTotals>(cacheKey);
  if (cached) return cached;

  try {
    // Query VaultManager's totals using Odra indices
    const [collateralBytes, debtBytes, countBytes] = await Promise.all([
      queryOdraDictionary(STATE_UREFS.vaultManager, VM_INDICES.total_collateral),
      queryOdraDictionary(STATE_UREFS.vaultManager, VM_INDICES.total_debt),
      queryOdraDictionary(STATE_UREFS.vaultManager, VM_INDICES.vault_count),
    ]);

    console.log("[querySystemTotals] Raw bytes:", { collateralBytes, debtBytes, countBytes });

    const totals: SystemTotals = {
      totalCollateral: collateralBytes ? parseU256FromHex(collateralBytes) : BigInt(0),
      totalDebt: debtBytes ? parseU256FromHex(debtBytes) : BigInt(0),
      vaultCount: countBytes ? parseU64FromHex(countBytes) : 0,
    };

    setCache(cacheKey, totals);
    return totals;
  } catch (error) {
    console.error("Failed to query system totals:", error);
    return null;
  }
}

// Odra storage indices for VaultManager fields (accounting for Mapping offset)
const VM_INDICES = {
  total_collateral: 2,
  total_debt: 3,
  vault_count: 4,
  cusd_token: 5,
  oracle_feed: 6,
  governance: 7,
  liquidation_module: 8,
  price: 9,
  price_timestamp: 10,
  mcr_bps: 11,
  max_price_staleness: 12,
  debt_floor: 13,
  debt_ceiling: 14,
};

// Odra storage indices for Governance fields (1-based indexing!)
const GOV_INDICES = {
  owner: 1,
  // guardians: 2 (Mapping)
  guardian_count: 3,
  params: 4,          // GovernanceParams struct
  vault_manager: 5,
  cusd_token: 6,
  oracle_feed: 7,
  liquidation_module: 8,
  system_paused: 9,
  mint_paused: 10,
  liquidations_paused: 11,
};

// Odra storage indices for CusdToken fields (1-based indexing!)
const CUSD_INDICES = {
  name: 1,
  symbol: 2,
  decimals: 3,
  total_supply: 4,
  balances: 5,        // Mapping
  allowances: 6,      // Mapping
  owner: 7,
  minter: 8,
  liquidation_module: 9,
};

// Odra storage indices for LiquidationModule
const LIQ_INDICES = {
  liquidation_bonus_bps: 2,
};

export async function queryParams(): Promise<GovernanceParams | null> {
  const cacheKey = "governance:params";

  const cached = getCached<GovernanceParams>(cacheKey);
  if (cached) return cached;

  try {
    // Query Governance contract's params struct (contains all parameters)
    const paramsBytes = await queryOdraDictionary(STATE_UREFS.governance, GOV_INDICES.params);

    console.log("[queryParams] Raw paramsBytes:", paramsBytes);

    if (!paramsBytes) {
      console.log("[queryParams] No params bytes returned from Governance");
      return null;
    }

    // Parse GovernanceParams struct from bytes
    // Struct format: [4-byte outer wrapper][u64 mcr_bps][u64 lr_bps][u64 liquidation_bonus_bps][u64 max_price_staleness][U256 debt_floor][U256 debt_ceiling]
    const params = parseGovernanceParams(paramsBytes);

    console.log("[queryParams] Parsed:", {
      mcrBps: params.mcrBps,
      mcrPercent: params.mcrBps / 100 + "%",
      lrBps: params.lrBps,
      lrPercent: params.lrBps / 100 + "%",
      liquidationBonusBps: params.liquidationBonusBps,
      liquidationBonusPercent: params.liquidationBonusBps / 100 + "%",
      maxPriceStaleness: params.maxPriceStaleness,
      debtFloor: params.debtFloor.toString(),
      debtCeiling: params.debtCeiling.toString()
    });

    setCache(cacheKey, params, 60000);
    return params;
  } catch (error) {
    console.error("Failed to query params:", error);
    return null;
  }
}

function parseGovernanceParams(hex: string): GovernanceParams {
  const bytes = hexToBytes(hex);
  let offset = 4; // Skip 4-byte outer wrapper

  const mcrBps = readU64LE(bytes, offset); offset += 8;
  const lrBps = readU64LE(bytes, offset); offset += 8;
  const liquidationBonusBps = readU64LE(bytes, offset); offset += 8;
  const maxPriceStaleness = readU64LE(bytes, offset); offset += 8;

  const debtFloorLen = bytes[offset]; offset += 1;
  let debtFloor = BigInt(0);
  for (let i = 0; i < debtFloorLen && (offset + i) < bytes.length; i++) {
    debtFloor = debtFloor | (BigInt(bytes[offset + i]) << BigInt(i * 8));
  }
  offset += debtFloorLen;

  const debtCeilingLen = bytes[offset]; offset += 1;
  let debtCeiling = BigInt(0);
  for (let i = 0; i < debtCeilingLen && (offset + i) < bytes.length; i++) {
    debtCeiling = debtCeiling | (BigInt(bytes[offset + i]) << BigInt(i * 8));
  }

  return {
    mcrBps,
    lrBps,
    liquidationBonusBps,
    maxPriceStaleness,
    debtFloor,
    debtCeiling,
  };
}

// Read u64 from bytes at offset (little-endian)
function readU64LE(bytes: Uint8Array, offset: number): number {
  let value = BigInt(0);
  for (let i = 0; i < 8 && (offset + i) < bytes.length; i++) {
    value = value | (BigInt(bytes[offset + i]) << BigInt(i * 8));
  }
  return Number(value);
}

// Query Odra dictionary using blake2b hash of index
async function queryOdraDictionary(
  stateUref: string,
  fieldIndex: number
): Promise<string | null> {
  try {
    // Create u32 big-endian bytes for the index
    const indexBytes = new Uint8Array(4);
    const view = new DataView(indexBytes.buffer);
    view.setUint32(0, fieldIndex, false); // big-endian

    // Compute blake2b-256 hash
    const hash = byteHash(indexBytes);
    const key = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`[queryOdraDictionary] index=${fieldIndex}, key=${key.substring(0, 16)}...`);

    // First get latest state root hash
    const stateRootResponse = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_get_state_root_hash',
        params: []
      })
    });
    const stateRootResult = await stateRootResponse.json();
    const stateRootHash = stateRootResult.result?.state_root_hash;

    if (!stateRootHash) {
      console.error('[queryOdraDictionary] Failed to get state root hash');
      return null;
    }

    // Query via API proxy (works around CORS)
    const response = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'state_get_dictionary_item',
        params: {
          state_root_hash: stateRootHash,
          dictionary_identifier: {
            URef: {
              seed_uref: stateUref,
              dictionary_item_key: key
            }
          }
        }
      })
    });

    const result = await response.json();
    console.log(`[queryOdraDictionary] index=${fieldIndex} response:`, result);

    if (result.result?.stored_value?.CLValue?.bytes) {
      return result.result.stored_value.CLValue.bytes;
    }
    if (result.error) {
      console.warn(`[queryOdraDictionary] index=${fieldIndex} error:`, result.error);
    }
    return null;
  } catch (error) {
    console.error(`Failed to query Odra dictionary index ${fieldIndex}:`, error);
    return null;
  }
}

export async function queryBalance(owner: PublicKey): Promise<bigint> {
  const accountHash = owner.accountHash().toHex();
  const cacheKey = `balance:${accountHash}`;

  const cached = getCached<bigint>(cacheKey);
  if (cached !== null) return cached;

  try {
    // Query CusdToken's balances Mapping with account hash key
    const balanceBytes = await queryOdraMappingByAddress(
      STATE_UREFS.cusdToken,
      CUSD_INDICES.balances,
      accountHash
    );

    if (!balanceBytes) {
      console.log("[queryBalance] No balance found for", accountHash);
      return BigInt(0);
    }

    const balance = parseU256FromHex(balanceBytes);
    console.log("[queryBalance] Parsed:", balance.toString());
    setCache(cacheKey, balance);
    return balance;
  } catch (error) {
    console.error("Failed to query balance:", error);
    return BigInt(0);
  }
}

// Query Odra Mapping by Address key
// Odra stores Mapping items in the state dictionary with composite keys:
// key = blake2b(field_index_u32_be || serialized_address)
// For Address, serialization is: 1-byte tag (0x01 for Account) + 32-byte hash
async function queryOdraMappingByAddress(
  stateUref: string,
  fieldIndex: number,
  accountHashHex: string
): Promise<string | null> {
  try {
    // Get state root hash first
    const stateRootResponse = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_get_state_root_hash',
        params: []
      })
    });
    const stateRootResult = await stateRootResponse.json();
    const stateRootHash = stateRootResult.result?.state_root_hash;

    if (!stateRootHash) {
      console.error('[queryOdraMappingByAddress] Failed to get state root hash');
      return null;
    }

    // Build the composite key: [index as u32 BE] + [serialized Address]
    // Address serialization in Odra: 1-byte tag + 32-byte hash
    // Odra Address serialization: 0x00 = Account, 0x01 = Contract (package hash)
    const indexBytes = new Uint8Array(4);
    new DataView(indexBytes.buffer).setUint32(0, fieldIndex, false); // big-endian

    const cleanHash = accountHashHex.replace(/^(account-hash-)?/, '');
    const hashBytes = hexToBytes(cleanHash);

    // Serialize Address: tag (0x00 for Account) + 32-byte hash
    const addressBytes = new Uint8Array(1 + hashBytes.length);
    addressBytes[0] = 0x00; // Address::Account tag (confirmed via debugging)
    addressBytes.set(hashBytes, 1);

    // Concatenate: index + serialized address
    const combined = new Uint8Array(4 + addressBytes.length);
    combined.set(indexBytes, 0);
    combined.set(addressBytes, 4);

    // Compute blake2b-256 hash
    const keyHash = byteHash(combined);
    const key = Array.from(keyHash).map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`[queryOdraMappingByAddress] index=${fieldIndex}, accountHash=${cleanHash.substring(0, 16)}..., key=${key.substring(0, 16)}...`);
    console.log(`[queryOdraMappingByAddress] Combined bytes (first 20):`, Array.from(combined.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(''));

    // Query dictionary
    const response = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'state_get_dictionary_item',
        params: {
          state_root_hash: stateRootHash,
          dictionary_identifier: {
            URef: {
              seed_uref: stateUref,
              dictionary_item_key: key
            }
          }
        }
      })
    });

    const result = await response.json();
    console.log('[queryOdraMappingByAddress] Result:', result);

    if (result.result?.stored_value?.CLValue?.bytes) {
      return result.result.stored_value.CLValue.bytes;
    }
    if (result.error) {
      // Dictionary key not found is expected for users without vaults/balance
      if (!result.error.message?.includes('dictionary item not found') &&
        !result.error.message?.includes('value was not found')) {
        console.warn(`[queryOdraMappingByAddress] error:`, result.error);
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to query Odra Mapping:`, error);
    return null;
  }
}

export async function queryTotalSupply(): Promise<bigint> {
  const cacheKey = "cusd:totalSupply";

  const cached = getCached<bigint>(cacheKey);
  if (cached !== null) return cached;

  try {
    // Query CusdToken's total_supply using Odra dictionary
    const supplyBytes = await queryOdraDictionary(
      STATE_UREFS.cusdToken,
      CUSD_INDICES.total_supply
    );

    if (!supplyBytes) {
      console.log("[queryTotalSupply] No bytes returned");
      return BigInt(0);
    }

    const supply = parseU256FromHex(supplyBytes);
    console.log("[queryTotalSupply] Parsed:", supply.toString());
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
  const cacheKey = "governance:paused";

  const cached = getCached<{
    system: boolean;
    mint: boolean;
    liquidations: boolean;
  }>(cacheKey);
  if (cached) return cached;

  try {
    // Query Governance's pause flags using Odra dictionary
    const [systemBytes, mintBytes, liqBytes] = await Promise.all([
      queryOdraDictionary(STATE_UREFS.governance, GOV_INDICES.system_paused),
      queryOdraDictionary(STATE_UREFS.governance, GOV_INDICES.mint_paused),
      queryOdraDictionary(STATE_UREFS.governance, GOV_INDICES.liquidations_paused),
    ]);

    // Parse bool values - format: [4-byte outer length][1-byte bool value]
    const paused = {
      system: parseBoolFromHex(systemBytes),
      mint: parseBoolFromHex(mintBytes),
      liquidations: parseBoolFromHex(liqBytes),
    };

    console.log("[queryIsPaused] Parsed:", paused);
    setCache(cacheKey, paused, 5000);
    return paused;
  } catch (error) {
    console.error("Failed to query pause status:", error);
    return { system: false, mint: false, liquidations: false };
  }
}

function parseBoolFromHex(hex: string | null): boolean {
  if (!hex || hex.length < 10) return false;
  const bytes = hexToBytes(hex);
  if (bytes.length < 5) return false;
  return bytes[4] === 1;
}

export async function queryCollateralRatio(
  owner: PublicKey
): Promise<number | null> {
  const [vault, price] = await Promise.all([queryVault(owner), queryPrice()]);

  if (!vault || !price || vault.debt === BigInt(0)) {
    return null;
  }

  // collateral_value (9 dec) = collateral (9 dec) * price (9 dec) / 10^9
  // ratio_bps = collateral_value * 10000 * 10^9 / debt (18 dec)
  const collateralValue =
    (vault.collateral * price.price) / BigInt(10 ** 9);
  const scaledValue =
    collateralValue * BigInt(10000) * BigInt(10 ** 9);
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

  // collateralValue (9 decimals) = collateral (9 dec) * price (9 dec) / 10^9
  // maxDebt (18 decimals) = collateralValue * 10^9 * 10000 / mcr_bps
  // max_mintable = max_debt - current_debt
  const collateralValue =
    (vault.collateral * price.price) / BigInt(10 ** 9);
  const maxDebt =
    (collateralValue * BigInt(10000) * BigInt(10 ** 9)) /
    BigInt(params.mcrBps);

  if (maxDebt > vault.debt) {
    return maxDebt - vault.debt;
  }

  return BigInt(0);
}

// Debug function to explore VaultManager state and try different vault query approaches
export async function debugVaultManager(accountHashHex: string): Promise<void> {
  console.log("=== DEBUG: VaultManager Exploration ===");
  console.log("Account hash:", accountHashHex);

  const stateUref = STATE_UREFS.vaultManager;
  console.log("State URef:", stateUref);

  // Verify we can read state - query vault_count
  const vaultCountBytes = await queryOdraDictionary(stateUref, VM_INDICES.vault_count);
  const vaultCount = vaultCountBytes ? parseU64FromHex(vaultCountBytes) : 0;
  console.log("Vault count:", vaultCount);

  // Prepare key formats
  const cleanHash = accountHashHex.replace(/^(account-hash-)?/, '');
  const hashBytes = hexToBytes(cleanHash);

  // Key format: index (u32 BE) + Address.to_bytes() = 0x00000000 + 0x00 + account_hash
  const combined = new Uint8Array(4 + 1 + hashBytes.length);
  new DataView(combined.buffer).setUint32(0, 0, false); // index 0
  combined[4] = 0x00; // Key::Account tag
  combined.set(hashBytes, 5);

  const hashedKey = byteHash(combined);
  const keyHex = Array.from(hashedKey).map(b => b.toString(16).padStart(2, '0')).join('');
  const base64Key = btoa(String.fromCharCode(...combined));

  console.log("\nKey computation:");
  console.log("  Input bytes:", Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join(''));
  console.log("  Blake2b hash:", keyHex);
  console.log("  Base64:", base64Key);

  // Try SDK's getDictionaryItem with different key formats
  console.log("\n--- Testing SDK getDictionaryItem ---");

  const keysToTry = [
    { key: keyHex, label: "hashed (hex)" },
    { key: base64Key, label: "raw (base64)" },
    { key: cleanHash, label: "account hash" },
  ];

  for (const { key, label } of keysToTry) {
    try {
      const result = await rpcClient.getDictionaryItem(null, stateUref, key);
      console.log(`SDK [${label}]: SUCCESS!`, result);
    } catch (e: unknown) {
      console.log(`SDK [${label}]: ${(e as Error).message || 'failed'}`);
    }
  }

  console.log("=== END DEBUG ===");
}

// Query native CSPR balance for an account
export async function queryCsprBalance(owner: PublicKey): Promise<bigint> {
  const accountHash = owner.accountHash().toHex();
  const cacheKey = `cspr-balance:${accountHash}`;

  const cached = getCached<bigint>(cacheKey);
  if (cached !== null) return cached;

  try {
    // Query account balance using Casper RPC
    const response = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'query_balance',
        params: {
          purse_identifier: {
            main_purse_under_public_key: owner.toHex()
          }
        }
      })
    });

    const result = await response.json();
    console.log('[queryCsprBalance] Result:', result);

    if (result.result?.balance) {
      const balance = BigInt(result.result.balance);
      setCache(cacheKey, balance, 5000); // 5 second cache
      return balance;
    }

    // Fallback: try query_balance_details
    const detailsResponse = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'state_get_balance',
        params: {
          purse_uref: null,
          state_root_hash: null,
          purse_identifier: {
            main_purse_under_public_key: owner.toHex()
          }
        }
      })
    });

    const detailsResult = await detailsResponse.json();
    console.log('[queryCsprBalance] Details result:', detailsResult);

    if (detailsResult.result?.balance_value) {
      const balance = BigInt(detailsResult.result.balance_value);
      setCache(cacheKey, balance, 5000);
      return balance;
    }

    console.log('[queryCsprBalance] No balance found');
    return BigInt(0);
  } catch (error) {
    console.error('Failed to query CSPR balance:', error);
    return BigInt(0);
  }
}
