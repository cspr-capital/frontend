import {
  ContractCallBuilder,
  SessionBuilder,
  Transaction,
  PublicKey,
  Args,
  CLValue,
  CLTypeUInt8,
  Key,
} from "casper-js-sdk";
import { getContractAddresses } from "./contracts";
import { ENTRY_POINTS, DECIMALS } from "./types";
import { NETWORK_NAME } from "./client";

const DEFAULT_TTL = 1800000; 

let proxyCallerWasmCache: Uint8Array | null = null;

/**
 * Load proxy_caller.wasm for payable contract calls.
 */
async function loadProxyCallerWasm(): Promise<Uint8Array> {
  if (proxyCallerWasmCache) {
    return proxyCallerWasmCache;
  }

  const response = await fetch('/proxy_caller.wasm');
  if (!response.ok) {
    throw new Error('Failed to load proxy_caller.wasm');
  }

  const arrayBuffer = await response.arrayBuffer();
  proxyCallerWasmCache = new Uint8Array(arrayBuffer);
  return proxyCallerWasmCache;
}

/**
 * Build a payable contract call transaction using proxy_caller.wasm.
 * This is required for Odra contracts with #[odra(payable)] entry points.
 *
 * @param sender - The public key of the sender
 * @param packageHash - The contract package hash (not contract hash)
 * @param entryPoint - The entry point name
 * @param entryPointArgs - The arguments for the entry point (can be empty)
 * @param attachedValue - The amount of CSPR to attach (in motes)
 * @param payment - The gas payment amount
 */
async function createPayableContractCall(
  sender: PublicKey,
  packageHash: string,
  entryPoint: string,
  entryPointArgs: Args,
  attachedValue: bigint,
  payment: number
): Promise<Transaction> {
  const wasmBytes = await loadProxyCallerWasm();

  const packageHashBytes = new Uint8Array(32);
  const cleanHash = packageHash.replace(/^hash-/, '');
  for (let i = 0; i < 32; i++) {
    packageHashBytes[i] = parseInt(cleanHash.slice(i * 2, i * 2 + 2), 16);
  }

  const argsBytes = entryPointArgs.toBytes();

  const proxyArgs = Args.fromMap({});
  proxyArgs.insert("package_hash", CLValue.newCLByteArray(packageHashBytes));
  proxyArgs.insert("entry_point", CLValue.newCLString(entryPoint));
  proxyArgs.insert("args", CLValue.newCLList(CLTypeUInt8, Array.from(argsBytes).map(b => CLValue.newCLUint8(b))));
  proxyArgs.insert("attached_value", CLValue.newCLUInt512(attachedValue.toString()));
  proxyArgs.insert("amount", CLValue.newCLUInt512(attachedValue.toString()));

  return new SessionBuilder()
    .from(sender)
    .wasm(wasmBytes)
    .runtimeArgs(proxyArgs)
    .chainName(NETWORK_NAME)
    .payment(payment)
    .ttl(DEFAULT_TTL)
    .build();
}
  
const PAYMENT_AMOUNTS = {
  OPEN_VAULT: 5_000_000_000, 
  CLOSE_VAULT: 10_000_000_000, 
  DEPOSIT: 3_000_000_000, 
  WITHDRAW: 10_000_000_000, 
  MINT: 5_000_000_000, 
  REPAY: 5_000_000_000, 
  TRANSFER: 3_000_000_000, 
  APPROVE: 2_000_000_000, 
  LIQUIDATE: 10_000_000_000, 
} as const;

function createContractCall(
  sender: PublicKey,
  contractHash: string,
  entryPoint: string,
  args: Args,
  payment: number
): Transaction {
  return new ContractCallBuilder()
    .from(sender)
    .byHash(contractHash)
    .entryPoint(entryPoint)
    .runtimeArgs(args)
    .chainName(NETWORK_NAME)
    .payment(payment)
    .ttl(DEFAULT_TTL)
    .build();
}

export function buildOpenVaultTransaction(sender: PublicKey): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});

  return createContractCall(
    sender,
    addresses.vaultManager,
    ENTRY_POINTS.OPEN_VAULT,
    args,
    PAYMENT_AMOUNTS.OPEN_VAULT
  );
}

export function buildCloseVaultTransaction(sender: PublicKey): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});

  return createContractCall(
    sender,
    addresses.vaultManager,
    ENTRY_POINTS.CLOSE_VAULT,
    args,
    PAYMENT_AMOUNTS.CLOSE_VAULT
  );
}

export async function buildDepositTransaction(
  sender: PublicKey,
  amount: bigint
): Promise<Transaction> {
  const addresses = getContractAddresses();

  if (!addresses.vaultManagerPackage) {
    throw new Error("VaultManager package hash not configured. Required for payable calls.");
  }

  const args = Args.fromMap({});

  const gasPayment = 10_000_000_000; 

  return createPayableContractCall(
    sender,
    addresses.vaultManagerPackage,
    ENTRY_POINTS.DEPOSIT_COLLATERAL,
    args,
    amount, 
    gasPayment
  );
}

export function buildWithdrawTransaction(
  sender: PublicKey,
  amount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});
  args.insert("amount", CLValue.newCLUInt256(amount.toString()));

  return createContractCall(
    sender,
    addresses.vaultManager,
    ENTRY_POINTS.WITHDRAW_COLLATERAL,
    args,
    PAYMENT_AMOUNTS.WITHDRAW
  );
}

export function buildMintTransaction(
  sender: PublicKey,
  amount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});
  args.insert("amount", CLValue.newCLUInt256(amount.toString()));

  return createContractCall(
    sender,
    addresses.vaultManager,
    ENTRY_POINTS.MINT_CUSD,
    args,
    PAYMENT_AMOUNTS.MINT
  );
}

export function buildRepayTransaction(
  sender: PublicKey,
  amount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});
  args.insert("amount", CLValue.newCLUInt256(amount.toString()));

  return createContractCall(
    sender,
    addresses.vaultManager,
    ENTRY_POINTS.REPAY_CUSD,
    args,
    PAYMENT_AMOUNTS.REPAY
  );
}

export function buildTransferTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  amount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const recipientKey = recipient.accountHash();
  const args = Args.fromMap({});
  args.insert(
    "recipient",
    CLValue.newCLKey(
      Key.newKey(recipientKey.toPrefixedString())
    )
  );
  args.insert("amount", CLValue.newCLUInt256(amount.toString()));

  return createContractCall(
    sender,
    addresses.cusdToken,
    ENTRY_POINTS.TRANSFER,
    args,
    PAYMENT_AMOUNTS.TRANSFER
  );
}

export function buildApproveTransaction(
  sender: PublicKey,
  spender: PublicKey,
  amount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const spenderKey = spender.accountHash();
  const args = Args.fromMap({});
  args.insert(
    "spender",
    CLValue.newCLKey(
      Key.newKey(spenderKey.toPrefixedString())
    )
  );
  args.insert("amount", CLValue.newCLUInt256(amount.toString()));

  return createContractCall(
    sender,
    addresses.cusdToken,
    ENTRY_POINTS.APPROVE,
    args,
    PAYMENT_AMOUNTS.APPROVE
  );
}

export function buildLiquidateTransaction(
  sender: PublicKey,
  vaultOwner: PublicKey,
  repayAmount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const ownerKey = vaultOwner.accountHash();
  const args = Args.fromMap({});
  args.insert(
    "vault_owner",
    CLValue.newCLKey(
      Key.newKey(ownerKey.toPrefixedString())
    )
  );
  args.insert("repay_amount", CLValue.newCLUInt256(repayAmount.toString()));

  return createContractCall(
    sender,
    addresses.liquidationModule,
    ENTRY_POINTS.LIQUIDATE,
    args,
    PAYMENT_AMOUNTS.LIQUIDATE
  );
}

/**
 * Build a submit_price transaction for the OracleFeed contract.
 * Only authorized signers can call this.
 *
 * @param sender - The public key of the authorized signer
 * @param priceUsd - The price in USD (e.g., 0.004989)
 */
export function buildSubmitPriceTransaction(
  sender: PublicKey,
  priceUsd: number
): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});

  const priceWith9Decimals = Math.round(priceUsd * 1e9);
  args.insert("price", CLValue.newCLUInt256(priceWith9Decimals.toString()));

  return createContractCall(
    sender,
    addresses.oracleFeed,
    ENTRY_POINTS.SUBMIT_PRICE,
    args,
    3_000_000_000 
  );
}

export function estimateGas(
  operation: keyof typeof PAYMENT_AMOUNTS
): number {
  return PAYMENT_AMOUNTS[operation];
}

export function formatPayment(motes: number): string {
  const cspr = motes / 10 ** DECIMALS.CSPR;
  return `${cspr} CSPR`;
}
