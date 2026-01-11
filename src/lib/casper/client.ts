import { RpcClient, HttpHandler } from "casper-js-sdk";

// Use local API proxy to avoid CORS issues in browser
const CASPER_NODE_URL = typeof window !== 'undefined'
  ? '/api/rpc'  // Browser: use Next.js API proxy
  : (process.env.NEXT_PUBLIC_CASPER_NODE_URL || "https://node.mainnet.casper.network/rpc");

const httpHandler = new HttpHandler(CASPER_NODE_URL);
export const rpcClient = new RpcClient(httpHandler);

export const NETWORK_NAME =
  process.env.NEXT_PUBLIC_CASPER_NETWORK || "casper";
