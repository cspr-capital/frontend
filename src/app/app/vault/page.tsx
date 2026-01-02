'use client'

import { useState } from 'react'
import { VaultCard } from '@/components/vault/vault-card'
import { OpenVaultCard } from '@/components/vault/open-vault-card'
import { VaultHistory } from '@/components/vault/vault-history'

// Mock data - toggle hasVault to see different states
const mockVaultData = {
    collateral: '250,000 CSPR',
    collateralUsd: '5,850',
    debt: '2,500',
    availableToMint: '940',
    availableToWithdraw: '35,000',
    collateralRatio: 234,
}

export default function VaultPage() {
    const [hasVault] = useState(true) // Toggle to test OpenVaultCard

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
                        data={mockVaultData}
                        onDeposit={() => console.log('Deposit')}
                        onWithdraw={() => console.log('Withdraw')}
                        onMint={() => console.log('Mint')}
                        onRepay={() => console.log('Repay')}
                    />
                    <VaultHistory />
                </>
            ) : (
                <OpenVaultCard onOpen={() => console.log('Open Vault')} />
            )}
        </div>
    )
}
