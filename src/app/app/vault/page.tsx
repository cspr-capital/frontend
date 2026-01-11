'use client'

import { useState, useEffect } from 'react'
import { VaultCard } from '@/components/vault/vault-card'
import { OpenVaultCard } from '@/components/vault/open-vault-card'
import { VaultHistory } from '@/components/vault/vault-history'
import { VaultActionModal } from '@/components/vault/vault-action-modal'
import { useVault } from '@/hooks/use-vault'
import { useOracle } from '@/hooks/use-oracle'
import { useWallet } from '@/hooks/use-wallet'
import { useUserTransactions } from '@/hooks/use-events'
import { formatCspr, formatCusd, parseCsprInput, parseCusdInput } from '@/lib/casper/abi'
import { DECIMALS } from '@/lib/casper/types'
import { Skeleton } from '@/components/ui/skeleton'

type ModalType = 'deposit' | 'withdraw' | 'mint' | 'repay' | null

export default function VaultPage() {
    const [activeModal, setActiveModal] = useState<ModalType>(null)
    const { isConnected, publicKey } = useWallet()

    const {
        vault,
        collateralRatio,
        maxMintable,
        cusdBalance,
        csprBalance,
        hasVault,
        isLoading,
        openVault,
        deposit,
        withdraw,
        mint,
        repay,
        refetch,
    } = useVault()

    const { priceUsd, refetch: refetchOracle } = useOracle()
    const { transactions, isLoading: txLoading, refetch: refetchTx } = useUserTransactions(publicKey)

    // Refetch data when page becomes active
    useEffect(() => {
        refetch()
        refetchOracle?.()
        refetchTx?.()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (!isConnected) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-medium">Vault</h1>
                    <p className="mt-2 text-muted-foreground">
                        Connect your wallet to manage your vault
                    </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-12 text-center">
                    <p className="text-muted-foreground">
                        Please connect your wallet to view and manage your vault.
                    </p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-medium">Vault</h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage your collateral and cUSD debt
                    </p>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <div className="grid gap-6 md:grid-cols-2">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    // Calculate values for display
    const collateralCspr = vault ? formatCspr(vault.collateral) : '0'
    const collateralUsd = vault && priceUsd
        ? (Number(vault.collateral) / 10 ** DECIMALS.CSPR * priceUsd).toFixed(2)
        : '0'
    const debtCusd = vault ? formatCusd(vault.debt) : '0'
    const availableToMint = maxMintable ? formatCusd(maxMintable) : '0'

    // Calculate max withdrawable (simplified - full collateral if no debt)
    const maxWithdrawable = vault
        ? vault.debt === BigInt(0)
            ? vault.collateral
            : BigInt(0) // TODO: Calculate based on MCR
        : BigInt(0)
    const availableToWithdraw = formatCspr(maxWithdrawable)

    const vaultData = {
        collateral: `${collateralCspr} CSPR`,
        collateralUsd,
        debt: debtCusd,
        availableToMint,
        availableToWithdraw,
        collateralRatio: collateralRatio ?? 0,
    }

    const getMaxAmount = () => {
        switch (activeModal) {
            case 'deposit':
                return csprBalance ? formatCspr(csprBalance) : '0'
            case 'withdraw':
                return availableToWithdraw
            case 'mint':
                return availableToMint
            case 'repay':
                // Max repay is the minimum of your balance and your debt
                if (!cusdBalance || !vault) return '0'
                const maxRepay = cusdBalance < vault.debt ? cusdBalance : vault.debt
                return formatCusd(maxRepay)
            default:
                return '0'
        }
    }

    // For repay, show balance but use min(balance, debt) as max
    const getDisplayAmount = () => {
        if (activeModal === 'repay') {
            return cusdBalance ? formatCusd(cusdBalance) : '0'
        }
        return undefined // Use maxAmount for display
    }

    const handleSubmit = async (amount: string): Promise<string> => {
        let result
        switch (activeModal) {
            case 'deposit':
                result = await deposit.mutateAsync(parseCsprInput(amount))
                break
            case 'withdraw':
                result = await withdraw.mutateAsync(parseCsprInput(amount))
                break
            case 'mint':
                result = await mint.mutateAsync(parseCusdInput(amount))
                break
            case 'repay':
                result = await repay.mutateAsync(parseCusdInput(amount))
                break
        }
        // Return transaction hash
        const txHash = result?.transactionHash
        if (typeof txHash === 'string') return txHash
        if (txHash?.toHex) return txHash.toHex()
        return String(txHash || '')
    }

    const handleOpenVault = async () => {
        await openVault.mutateAsync()
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-medium">Vault</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your collateral and cUSD debt
                </p>
            </div>

            {hasVault ? (
                <>
                    <VaultCard
                        data={vaultData}
                        onDeposit={() => setActiveModal('deposit')}
                        onWithdraw={() => setActiveModal('withdraw')}
                        onMint={() => setActiveModal('mint')}
                        onRepay={() => setActiveModal('repay')}
                    />
                    <VaultHistory transactions={transactions} isLoading={txLoading} />
                </>
            ) : (
                <OpenVaultCard
                    onOpen={handleOpenVault}
                    isLoading={openVault.isPending}
                />
            )}

            {activeModal && (
                <VaultActionModal
                    type={activeModal}
                    open={!!activeModal}
                    onOpenChange={(open) => {
                        if (!open) {
                            setActiveModal(null)
                            // Refetch data after closing modal
                            refetch()
                            refetchTx?.()
                        }
                    }}
                    maxAmount={getMaxAmount()}
                    displayAmount={getDisplayAmount()}
                    currentRatio={collateralRatio}
                    collateralValue={parseFloat(collateralUsd)}
                    debtValue={parseFloat(debtCusd)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    )
}
