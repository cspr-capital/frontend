import { RpcClient, HttpHandler } from "casper-js-sdk";

const CASPER_NODE_URL =
  process.env.NEXT_PUBLIC_CASPER_NODE_URL ||
  "https://rpc.mainnet.casperlabs.io/rpc";

const httpHandler = new HttpHandler(CASPER_NODE_URL);
export const rpcClient = new RpcClient(httpHandler);

export const NETWORK_NAME =
  process.env.NEXT_PUBLIC_CASPER_NETWORK || "casper";
