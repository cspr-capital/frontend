import {
  ContractCallBuilder,
  Transaction,
  PublicKey,
  Args,
  CLValue,
  Key,
} from "casper-js-sdk";
import { getContractAddresses } from "./contracts";
import { ENTRY_POINTS, DECIMALS } from "./types";
import { NETWORK_NAME } from "./client";

const DEFAULT_TTL = 1800000; // 30 minutes

// Payment amounts for different operations (in motes)
const PAYMENT_AMOUNTS = {
  OPEN_VAULT: 5_000_000_000, // 5 CSPR
  CLOSE_VAULT: 3_000_000_000, // 3 CSPR
  DEPOSIT: 3_000_000_000, // 3 CSPR
  WITHDRAW: 3_000_000_000, // 3 CSPR
  MINT: 5_000_000_000, // 5 CSPR
  REPAY: 5_000_000_000, // 5 CSPR
  TRANSFER: 3_000_000_000, // 3 CSPR
  APPROVE: 2_000_000_000, // 2 CSPR
  LIQUIDATE: 10_000_000_000, // 10 CSPR
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
    .buildFor1_5();
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

export function buildDepositTransaction(
  sender: PublicKey,
  amount: bigint
): Transaction {
  const addresses = getContractAddresses();
  const args = Args.fromMap({});
  args.insert("amount", CLValue.newCLUInt512(amount.toString()));

  return createContractCall(
    sender,
    addresses.vaultManager,
    ENTRY_POINTS.DEPOSIT_COLLATERAL,
    args,
    PAYMENT_AMOUNTS.DEPOSIT
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

// Helper to estimate gas for an operation
export function estimateGas(
  operation: keyof typeof PAYMENT_AMOUNTS
): number {
  return PAYMENT_AMOUNTS[operation];
}

// Helper to format payment amount for display
export function formatPayment(motes: number): string {
  const cspr = motes / 10 ** DECIMALS.CSPR;
  return `${cspr} CSPR`;
}
