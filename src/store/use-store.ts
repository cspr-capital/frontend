import { create } from 'zustand'

interface WalletState {
    isConnected: boolean
    address: string | null
    publicKey: string | null
}

interface ContractAddresses {
    cUSD: string | null
    vaultManager: string | null
    oracleFeed: string | null
    liquidation: string | null
}

interface AppState {
    wallet: WalletState
    contracts: ContractAddresses
    setWallet: (wallet: Partial<WalletState>) => void
    setContracts: (contracts: Partial<ContractAddresses>) => void
    disconnect: () => void
}

export const useStore = create<AppState>((set) => ({
    wallet: {
        isConnected: false,
        address: null,
        publicKey: null,
    },
    contracts: {
        cUSD: null,
        vaultManager: null,
        oracleFeed: null,
        liquidation: null,
    },
    setWallet: (wallet) =>
        set((state) => ({
            wallet: { ...state.wallet, ...wallet },
        })),
    setContracts: (contracts) =>
        set((state) => ({
            contracts: { ...state.contracts, ...contracts },
        })),
    disconnect: () =>
        set({
            wallet: {
                isConnected: false,
                address: null,
                publicKey: null,
            },
        }),
}))
