'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/use-store'

declare global {
    interface Window {
        CasperWalletProvider?: () => CasperWalletProvider
    }
}

interface CasperWalletProvider {
    requestConnection: () => Promise<boolean>
    disconnectFromSite: () => Promise<boolean>
    getActivePublicKey: () => Promise<string>
    signMessage: (message: string, publicKey: string) => Promise<string>
    sign: (deployJson: string, publicKey: string) => Promise<{ deploy: string }>
    isConnected: () => Promise<boolean>
}

function getCasperWalletProvider(): CasperWalletProvider | null {
    if (typeof window === 'undefined') return null
    if (!window.CasperWalletProvider) return null
    return window.CasperWalletProvider()
}

export function useWallet() {
    const { wallet, setWallet, disconnect: clearWallet } = useStore()

    const isWalletExtensionAvailable = useCallback(() => {
        return getCasperWalletProvider() !== null
    }, [])

    const connect = useCallback(async () => {
        const provider = getCasperWalletProvider()
        if (!provider) {
            throw new Error('Casper Wallet extension not found. Please install it from https://www.casperwallet.io/')
        }

        const connected = await provider.requestConnection()
        if (!connected) {
            throw new Error('Connection request was rejected')
        }

        const publicKey = await provider.getActivePublicKey()
        const address = publicKey.slice(0, 8) + '...' + publicKey.slice(-6)

        setWallet({
            isConnected: true,
            publicKey,
            address,
        })

        return publicKey
    }, [setWallet])

    const disconnect = useCallback(async () => {
        const provider = getCasperWalletProvider()
        if (provider) {
            await provider.disconnectFromSite()
        }
        clearWallet()
    }, [clearWallet])

    const signMessage = useCallback(async (message: string) => {
        const provider = getCasperWalletProvider()
        if (!provider || !wallet.publicKey) {
            throw new Error('Wallet not connected')
        }
        return provider.signMessage(message, wallet.publicKey)
    }, [wallet.publicKey])

    const signDeploy = useCallback(async (deployJson: string) => {
        const provider = getCasperWalletProvider()
        if (!provider || !wallet.publicKey) {
            throw new Error('Wallet not connected')
        }
        return provider.sign(deployJson, wallet.publicKey)
    }, [wallet.publicKey])

    return {
        isConnected: wallet.isConnected,
        address: wallet.address,
        publicKey: wallet.publicKey,
        connect,
        disconnect,
        signMessage,
        signDeploy,
        isWalletExtensionAvailable,
    }
}
