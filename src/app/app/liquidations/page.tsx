'use client'

import { useState } from 'react'
import { LiquidationStats } from '@/components/liquidations/liquidation-stats'
import { LiquidatableVaultList, type LiquidatableVault } from '@/components/liquidations/liquidatable-vault-list'
import { LiquidateModal } from '@/components/liquidations/liquidate-modal'
import { LiquidationHistory } from '@/components/liquidations/liquidation-history'

export default function LiquidationsPage() {
    const [selectedVault, setSelectedVault] = useState<LiquidatableVault | null>(null)

    const handleLiquidate = async (vault: LiquidatableVault, amount: string) => {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log(`Liquidating ${vault.owner} for ${amount} cUSD`)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-medium">Liquidations</h1>
                <p className="mt-2 text-muted-foreground">
                    Browse unsafe vaults and execute liquidations
                </p>
            </div>

            <LiquidationStats />

            <div>
                <h2 className="text-lg font-medium mb-4">Liquidatable Vaults</h2>
                <LiquidatableVaultList onLiquidate={setSelectedVault} />
            </div>

            <div>
                <h2 className="text-lg font-medium mb-4">Recent Liquidations</h2>
                <LiquidationHistory />
            </div>

            <LiquidateModal
                vault={selectedVault}
                open={!!selectedVault}
                onOpenChange={(open) => !open && setSelectedVault(null)}
                onSubmit={handleLiquidate}
            />
        </div>
    )
}
