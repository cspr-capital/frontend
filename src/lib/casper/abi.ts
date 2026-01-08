import { CLValue, PublicKey, Args, Key } from "casper-js-sdk";
import {
  Vault,
  SystemTotals,
  PriceRound,
  GovernanceParams,
  LiquidationStats,
  DECIMALS,
} from "./types";

export function buildU256(value: bigint): CLValue {
  return CLValue.newCLUInt256(value.toString());
}

export function buildU512(value: bigint): CLValue {
  return CLValue.newCLUInt512(value.toString());
}

export function buildU64(value: number | bigint): CLValue {
  return CLValue.newCLUint64(value.toString());
}

export function buildKeyFromPublicKey(publicKey: PublicKey): CLValue {
  const accountHash = publicKey.accountHash();
  const key = Key.newKey(accountHash.toPrefixedString());
  return CLValue.newCLKey(key);
}

export function buildWithdrawArgs(amount: bigint): Args {
  const args = Args.fromMap({});
  args.insert("amount", buildU256(amount));
  return args;
}

export function buildMintArgs(amount: bigint): Args {
  const args = Args.fromMap({});
  args.insert("amount", buildU256(amount));
  return args;
}

export function buildRepayArgs(amount: bigint): Args {
  const args = Args.fromMap({});
  args.insert("amount", buildU256(amount));
  return args;
}

export function buildTransferArgs(recipient: PublicKey, amount: bigint): Args {
  const args = Args.fromMap({});
  args.insert("recipient", buildKeyFromPublicKey(recipient));
  args.insert("amount", buildU256(amount));
  return args;
}

export function buildApproveArgs(spender: PublicKey, amount: bigint): Args {
  const args = Args.fromMap({});
  args.insert("spender", buildKeyFromPublicKey(spender));
  args.insert("amount", buildU256(amount));
  return args;
}

export function buildLiquidateArgs(
  vaultOwner: PublicKey,
  repayAmount: bigint
): Args {
  const args = Args.fromMap({});
  args.insert("vault_owner", buildKeyFromPublicKey(vaultOwner));
  args.insert("repay_amount", buildU256(repayAmount));
  return args;
}

export function buildSubmitPriceArgs(price: bigint): Args {
  const args = Args.fromMap({});
  args.insert("price", buildU256(price));
  return args;
}

export function buildOwnerArg(owner: PublicKey): Args {
  const args = Args.fromMap({});
  args.insert("owner", buildKeyFromPublicKey(owner));
  return args;
}

export function parseU256(clValue: CLValue): bigint {
  if (clValue.ui256) {
    return BigInt(clValue.ui256.toString());
  }
  throw new Error("Expected U256 value");
}

export function parseU512(clValue: CLValue): bigint {
  if (clValue.ui512) {
    return BigInt(clValue.ui512.toString());
  }
  throw new Error("Expected U512 value");
}

export function parseU64(clValue: CLValue): number {
  if (clValue.ui64) {
    return Number(clValue.ui64.toString());
  }
  throw new Error("Expected U64 value");
}

export function parseBool(clValue: CLValue): boolean {
  if (clValue.bool !== undefined) {
    return clValue.bool.getValue();
  }
  throw new Error("Expected Bool value");
}

export function parseVaultFromMap(data: Map<string, CLValue>): Vault {
  return {
    collateral: parseU256(data.get("collateral")!),
    debt: parseU256(data.get("debt")!),
    createdAt: parseU64(data.get("created_at")!),
    updatedAt: parseU64(data.get("updated_at")!),
  };
}

export function parseSystemTotalsFromMap(
  data: Map<string, CLValue>
): SystemTotals {
  return {
    totalCollateral: parseU256(data.get("total_collateral")!),
    totalDebt: parseU256(data.get("total_debt")!),
    vaultCount: parseU64(data.get("vault_count")!),
  };
}

export function parsePriceRoundFromMap(data: Map<string, CLValue>): PriceRound {
  return {
    price: parseU256(data.get("price")!),
    timestamp: parseU64(data.get("timestamp")!),
    roundId: parseU64(data.get("round_id")!),
  };
}

export function parseGovernanceParamsFromMap(
  data: Map<string, CLValue>
): GovernanceParams {
  return {
    mcrBps: parseU64(data.get("mcr_bps")!),
    lrBps: parseU64(data.get("lr_bps")!),
    liquidationBonusBps: parseU64(data.get("liquidation_bonus_bps")!),
    maxPriceStaleness: parseU64(data.get("max_price_staleness")!),
    debtFloor: parseU256(data.get("debt_floor")!),
    debtCeiling: parseU256(data.get("debt_ceiling")!),
  };
}

export function parseLiquidationStatsFromMap(
  data: Map<string, CLValue>
): LiquidationStats {
  return {
    totalLiquidations: parseU64(data.get("total_liquidations")!),
    totalDebtRepaid: parseU256(data.get("total_debt_repaid")!),
    totalCollateralSeized: parseU256(data.get("total_collateral_seized")!),
  };
}

export function formatCspr(motes: bigint): string {
  const divisor = BigInt(10) ** BigInt(DECIMALS.CSPR);
  const whole = motes / divisor;
  const fraction = motes % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(DECIMALS.CSPR, "0");
  return `${whole}.${fractionStr.replace(/0+$/, "")}`;
}

export function formatCusd(amount: bigint): string {
  const divisor = BigInt(10) ** BigInt(DECIMALS.CUSD);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(DECIMALS.CUSD, "0");
  return `${whole}.${fractionStr.replace(/0+$/, "").slice(0, 6)}`;
}

export function formatPrice(price: bigint): string {
  const divisor = BigInt(10) ** BigInt(DECIMALS.PRICE);
  const whole = price / divisor;
  const fraction = price % divisor;
  if (fraction === BigInt(0)) {
    return `$${whole}`;
  }
  const fractionStr = fraction.toString().padStart(DECIMALS.PRICE, "0");
  return `$${whole}.${fractionStr.replace(/0+$/, "")}`;
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function formatCollateralRatio(ratioBps: number): string {
  if (ratioBps === 0xffffffff || ratioBps === Number.MAX_SAFE_INTEGER) {
    return "∞";
  }
  return `${(ratioBps / 100).toFixed(2)}%`;
}

export function parseCsprInput(input: string): bigint {
  const parts = input.split(".");
  const whole = BigInt(parts[0] || "0");
  let fraction = BigInt(0);
  if (parts[1]) {
    const fractionStr = parts[1]
      .padEnd(DECIMALS.CSPR, "0")
      .slice(0, DECIMALS.CSPR);
    fraction = BigInt(fractionStr);
  }
  return whole * BigInt(10) ** BigInt(DECIMALS.CSPR) + fraction;
}

export function parseCusdInput(input: string): bigint {
  const parts = input.split(".");
  const whole = BigInt(parts[0] || "0");
  let fraction = BigInt(0);
  if (parts[1]) {
    const fractionStr = parts[1]
      .padEnd(DECIMALS.CUSD, "0")
      .slice(0, DECIMALS.CUSD);
    fraction = BigInt(fractionStr);
  }
  return whole * BigInt(10) ** BigInt(DECIMALS.CUSD) + fraction;
}

export function buildStorageKey(prefix: string, key: string): string {
  return `${prefix}_${key}`;
}

export function buildVaultStorageKey(ownerAccountHash: string): string {
  return buildStorageKey("vaults", ownerAccountHash);
}

export function buildBalanceStorageKey(ownerAccountHash: string): string {
  return buildStorageKey("balances", ownerAccountHash);
}
