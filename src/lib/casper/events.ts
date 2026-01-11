const VM_CONTRACT_HASH = process.env.NEXT_PUBLIC_VAULT_MANAGER_HASH || "";

interface ParsedEvent {
  type: string;
  data: Record<string, unknown>;
  index: number;
}

export interface MintEvent {
  id: string;
  owner: string;
  amount: bigint;
  totalDebt: bigint;
  crAfter: number;
}

export interface RepaidEvent {
  id: string;
  owner: string;
  amount: bigint;
  totalDebt: bigint;
}

export interface LiquidatedEvent {
  id: string;
  vaultOwner: string;
  liquidator: string;
  debtRepaid: bigint;
  collateralSeized: bigint;
}

export interface DepositEvent {
  id: string;
  owner: string;
  amount: bigint;
  totalCollateral: bigint;
}

export interface WithdrawEvent {
  id: string;
  owner: string;
  amount: bigint;
  totalCollateral: bigint;
}

async function rpcCall(method: string, params: unknown) {
  // Use Next.js API route to avoid CORS issues
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return response.json();
}

async function getContractNamedKeys(contractHash: string) {
  const stateRootResult = await rpcCall("chain_get_state_root_hash", []);
  const stateRootHash = stateRootResult.result?.state_root_hash;

  const result = await rpcCall("query_global_state", {
    state_identifier: { StateRootHash: stateRootHash },
    key: `hash-${contractHash}`,
    path: [],
  });

  const contract = result.result?.stored_value?.Contract;
  return { namedKeys: contract?.named_keys || [], stateRootHash };
}

async function queryDictItem(stateRootHash: string, seedUref: string, key: string) {
  const result = await rpcCall("state_get_dictionary_item", {
    state_root_hash: stateRootHash,
    dictionary_identifier: {
      URef: { seed_uref: seedUref, dictionary_item_key: key },
    },
  });
  return result.result?.stored_value?.CLValue;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function readString(bytes: Uint8Array, offset: number): [string, number] {
  const length = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
  const strBytes = bytes.slice(offset + 4, offset + 4 + length);
  const str = new TextDecoder().decode(strBytes);
  return [str, offset + 4 + length];
}

function readU256(bytes: Uint8Array, offset: number): [bigint, number] {
  const length = bytes[offset];
  let value = BigInt(0);
  for (let i = 0; i < length; i++) {
    value += BigInt(bytes[offset + 1 + i]) << BigInt(8 * i);
  }
  return [value, offset + 1 + length];
}

function readU64(bytes: Uint8Array, offset: number): [number, number] {
  let value = 0;
  for (let i = 0; i < 8; i++) {
    value += bytes[offset + i] * Math.pow(256, i);
  }
  return [value, offset + 8];
}

function readAddress(bytes: Uint8Array, offset: number): [string, number] {
  const tag = bytes[offset];
  const hashBytes = bytes.slice(offset + 1, offset + 33);
  const hash = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");
  const prefix = tag === 0 ? "account-hash-" : "contract-hash-";
  return [prefix + hash, offset + 33];
}

function parseEventBytes(bytes: Uint8Array, index: number): ParsedEvent | null {
  try {
    // Skip first 4 bytes (length prefix)
    let offset = 4;

    // Read event name
    const [eventName, newOffset] = readString(bytes, offset);
    offset = newOffset;

    const data: Record<string, unknown> = {};

    if (eventName === "event_Minted") {
      const [owner, o1] = readAddress(bytes, offset);
      const [amount, o2] = readU256(bytes, o1);
      const [totalDebt, o3] = readU256(bytes, o2);
      const [crAfter, _] = readU64(bytes, o3);
      data.owner = owner;
      data.amount = amount;
      data.totalDebt = totalDebt;
      data.crAfter = crAfter;
    } else if (eventName === "event_Repaid") {
      const [owner, o1] = readAddress(bytes, offset);
      const [amount, o2] = readU256(bytes, o1);
      const [totalDebt, _] = readU256(bytes, o2);
      data.owner = owner;
      data.amount = amount;
      data.totalDebt = totalDebt;
    } else if (eventName === "event_Liquidated") {
      const [vaultOwner, o1] = readAddress(bytes, offset);
      const [liquidator, o2] = readAddress(bytes, o1);
      const [debtRepaid, o3] = readU256(bytes, o2);
      const [collateralSeized, _] = readU256(bytes, o3);
      data.vaultOwner = vaultOwner;
      data.liquidator = liquidator;
      data.debtRepaid = debtRepaid;
      data.collateralSeized = collateralSeized;
    } else if (eventName === "event_CollateralDeposited") {
      const [owner, o1] = readAddress(bytes, offset);
      const [amount, o2] = readU256(bytes, o1);
      const [totalCollateral, _] = readU256(bytes, o2);
      data.owner = owner;
      data.amount = amount;
      data.totalCollateral = totalCollateral;
    } else if (eventName === "event_CollateralWithdrawn") {
      const [owner, o1] = readAddress(bytes, offset);
      const [amount, o2] = readU256(bytes, o1);
      const [totalCollateral, _] = readU256(bytes, o2);
      data.owner = owner;
      data.amount = amount;
      data.totalCollateral = totalCollateral;
    }

    return {
      type: eventName.replace("event_", ""),
      data,
      index,
    };
  } catch (e) {
    console.error("Failed to parse event:", e);
    return null;
  }
}

export async function queryRecentEvents(limit: number = 20): Promise<ParsedEvent[]> {
  try {
    const { namedKeys, stateRootHash } = await getContractNamedKeys(VM_CONTRACT_HASH);

    const eventsUref = namedKeys.find((nk: { name: string }) => nk.name === "__events")?.key;
    const eventsLengthUref = namedKeys.find((nk: { name: string }) => nk.name === "__events_length")?.key;

    if (!eventsUref || !eventsLengthUref) {
      return [];
    }

    // Query events length
    const lengthResult = await rpcCall("query_global_state", {
      state_identifier: { StateRootHash: stateRootHash },
      key: eventsLengthUref,
      path: [],
    });

    const eventsLength = lengthResult.result?.stored_value?.CLValue?.parsed;
    if (!eventsLength || eventsLength === 0) {
      return [];
    }

    // Query recent events
    const startIdx = Math.max(0, eventsLength - limit);
    const events: ParsedEvent[] = [];

    for (let i = eventsLength - 1; i >= startIdx; i--) {
      const eventData = await queryDictItem(stateRootHash, eventsUref, String(i));
      if (eventData?.bytes) {
        const bytes = hexToBytes(eventData.bytes);
        const parsed = parseEventBytes(bytes, i);
        if (parsed) {
          events.push(parsed);
        }
      }
    }

    return events;
  } catch (e) {
    console.error("Failed to query events:", e);
    return [];
  }
}

export function filterMintEvents(events: ParsedEvent[]): MintEvent[] {
  return events
    .filter((e) => e.type === "Minted")
    .map((e) => ({
      id: String(e.index),
      owner: e.data.owner as string,
      amount: e.data.amount as bigint,
      totalDebt: e.data.totalDebt as bigint,
      crAfter: e.data.crAfter as number,
    }));
}

export function filterLiquidatedEvents(events: ParsedEvent[]): LiquidatedEvent[] {
  return events
    .filter((e) => e.type === "Liquidated")
    .map((e) => ({
      id: String(e.index),
      vaultOwner: e.data.vaultOwner as string,
      liquidator: e.data.liquidator as string,
      debtRepaid: e.data.debtRepaid as bigint,
      collateralSeized: e.data.collateralSeized as bigint,
    }));
}

export function filterDepositEvents(events: ParsedEvent[]): DepositEvent[] {
  return events
    .filter((e) => e.type === "CollateralDeposited")
    .map((e) => ({
      id: String(e.index),
      owner: e.data.owner as string,
      amount: e.data.amount as bigint,
      totalCollateral: e.data.totalCollateral as bigint,
    }));
}

export function filterWithdrawEvents(events: ParsedEvent[]): WithdrawEvent[] {
  return events
    .filter((e) => e.type === "CollateralWithdrawn")
    .map((e) => ({
      id: String(e.index),
      owner: e.data.owner as string,
      amount: e.data.amount as bigint,
      totalCollateral: e.data.totalCollateral as bigint,
    }));
}

export function filterRepaidEvents(events: ParsedEvent[]): RepaidEvent[] {
  return events
    .filter((e) => e.type === "Repaid")
    .map((e) => ({
      id: String(e.index),
      owner: e.data.owner as string,
      amount: e.data.amount as bigint,
      totalDebt: e.data.totalDebt as bigint,
    }));
}
