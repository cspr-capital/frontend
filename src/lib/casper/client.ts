import { HttpHandler, CasperServiceByJsonRPC } from 'casper-js-sdk'

const CASPER_NODE_URL = process.env.NEXT_PUBLIC_CASPER_NODE_URL || 'https://rpc.mainnet.casperlabs.io/rpc'

export const casperService = new CasperServiceByJsonRPC(
    new HttpHandler(CASPER_NODE_URL)
)

export const NETWORK_NAME = process.env.NEXT_PUBLIC_CASPER_NETWORK || 'casper'
