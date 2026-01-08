'use client'

import { useState } from 'react'
import { LiquidationStats } from '@/components/liquidations/liquidation-stats'
import { LiquidatableVaultList, type LiquidatableVault } from '@/components/liquidations/liquidatable-vault-list'
import { LiquidateModal } from '@/components/liquidations/liquidate-modal'
import { LiquidationHistory } from '@/components/liquidations/liquidation-history'
import { useLiquidations } from '@/hooks/use-liquidations'
import { parseCusdInput } from '@/lib/casper/abi'

export default function LiquidationsPage() {
    const [selectedVault, setSelectedVault] = useState<LiquidatableVault | null>(null)

    const {
        liquidatableVaults,
        liquidatableCount,
        isLoading,
        liquidate,
    } = useLiquidations()

    // Calculate stats from liquidatable vaults
    const totalDebtAtRisk = liquidatableVaults.reduce((sum, v) => {
        const debt = parseFloat(v.debt.replace(/[^0-9.]/g, '')) || 0
        return sum + debt
    }, 0)

    const avgRatio = liquidatableCount > 0
        ? Math.round(liquidatableVaults.reduce((sum, v) => sum + v.collateralRatio, 0) / liquidatableCount)
        : 0

    const handleLiquidate = async (vault: LiquidatableVault, amount: string) => {
        await liquidate.mutateAsync({
            vaultOwner: vault.owner,
            repayAmount: parseCusdInput(amount),
        })
        setSelectedVault(null)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-medium">Liquidations</h1>
                <p className="mt-2 text-muted-foreground">
                    Browse unsafe vaults and execute liquidations
                </p>
            </div>

            <LiquidationStats
                totalLiquidatable={liquidatableCount}
                totalDebtAtRisk={totalDebtAtRisk.toLocaleString()}
                avgRatio={avgRatio}
                isLoading={isLoading}
            />

            <div>
                <h2 className="text-lg font-medium mb-4">Liquidatable Vaults</h2>
                <LiquidatableVaultList
                    vaults={liquidatableVaults}
                    isLoading={isLoading}
                    onLiquidate={setSelectedVault}
                />
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
