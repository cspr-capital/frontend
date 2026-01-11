export interface Vault {
  collateral: bigint;
  debt: bigint;
  createdAt: number;
  updatedAt: number;
}

export interface SystemTotals {
  totalCollateral: bigint;
  totalDebt: bigint;
  vaultCount: number;
}

export interface PriceRound {
  price: bigint;
  timestamp: number;
  roundId: number;
}

export interface GovernanceParams {
  mcrBps: number;
  lrBps: number;
  liquidationBonusBps: number;
  maxPriceStaleness: number;
  debtFloor: bigint;
  debtCeiling: bigint;
}

export interface LiquidationStats {
  totalLiquidations: number;
  totalDebtRepaid: bigint;
  totalCollateralSeized: bigint;
}

export interface LiquidatableVault {
  owner: string;
  collateral: bigint;
  debt: bigint;
  collateralRatio: number;
}

export interface ContractAddresses {
  vaultManager: string;
  cusdToken: string;
  oracleFeed: string;
  liquidationModule: string;
  governance: string;
  // Package hashes (needed for payable calls via proxy_caller)
  vaultManagerPackage?: string;
  cusdTokenPackage?: string;
  oracleFeedPackage?: string;
  liquidationModulePackage?: string;
  governancePackage?: string;
}

export const ENTRY_POINTS = {
  // VaultManager
  OPEN_VAULT: "open_vault",
  CLOSE_VAULT: "close_vault",
  DEPOSIT_COLLATERAL: "deposit_collateral",
  WITHDRAW_COLLATERAL: "withdraw_collateral",
  MINT_CUSD: "mint_cusd",
  REPAY_CUSD: "repay_cusd",
  GET_VAULT: "get_vault",
  GET_SYSTEM_TOTALS: "get_system_totals",
  GET_COLLATERAL_RATIO: "get_collateral_ratio",
  GET_MAX_MINTABLE: "get_max_mintable",
  GET_MAX_WITHDRAWABLE: "get_max_withdrawable",
  IS_LIQUIDATABLE: "is_liquidatable",
  GET_PRICE: "get_price",
  GET_MCR: "get_mcr",
  GET_DEBT_FLOOR: "get_debt_floor",
  GET_DEBT_CEILING: "get_debt_ceiling",

  // CusdToken
  BALANCE_OF: "balance_of",
  TOTAL_SUPPLY: "total_supply",
  TRANSFER: "transfer",
  APPROVE: "approve",
  ALLOWANCE: "allowance",

  // OracleFeed
  GET_LATEST_PRICE: "get_latest_price",
  GET_PRICE_ROUND: "get_price_round",
  IS_PRICE_FRESH: "is_price_fresh",
  SUBMIT_PRICE: "submit_price",

  // LiquidationModule
  LIQUIDATE: "liquidate",
  GET_STATS: "get_stats",
  CALCULATE_SEIZE: "calculate_seize",

  // Governance
  GET_PARAMS: "get_params",
  IS_SYSTEM_PAUSED: "is_system_paused",
  IS_MINT_PAUSED: "is_mint_paused",
  IS_LIQUIDATIONS_PAUSED: "is_liquidations_paused",
} as const;

export const STORAGE_KEYS = {
  // VaultManager storage
  VAULTS: "vaults",
  TOTAL_COLLATERAL: "total_collateral",
  TOTAL_DEBT: "total_debt",
  VAULT_COUNT: "vault_count",
  PRICE: "price",
  PRICE_TIMESTAMP: "price_timestamp",
  MCR_BPS: "mcr_bps",
  LR_BPS: "lr_bps",
  DEBT_FLOOR: "debt_floor",
  DEBT_CEILING: "debt_ceiling",
  MAX_PRICE_STALENESS: "max_price_staleness",
  // CusdToken storage
  BALANCES: "balances",
  TOTAL_SUPPLY: "total_supply",
  // OracleFeed storage
  LATEST_ROUND: "latest_round",
  // Governance storage
  PARAMS: "params",
  SYSTEM_PAUSED: "system_paused",
  MINT_PAUSED: "mint_paused",
  LIQUIDATIONS_PAUSED: "liquidations_paused",
  // LiquidationModule storage
  LIQUIDATION_BONUS_BPS: "liquidation_bonus_bps",
} as const;

export const DECIMALS = {
  CSPR: 9,
  CUSD: 18,
  PRICE: 9, 
  BPS: 4,
} as const;

export const BPS_SCALE = BigInt(10_000);
