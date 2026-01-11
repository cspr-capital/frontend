'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertTriangle, Zap } from 'lucide-react'

export interface LiquidatableVault {
    owner: string
    collateral: string
    collateralUsd: string
    debt: string
    collateralRatio: number
    maxLiquidatable: string
    potentialProfit: string
}

interface LiquidatableVaultListProps {
    vaults?: LiquidatableVault[]
    isLoading?: boolean
    onLiquidate?: (vault: LiquidatableVault) => void
}

function getRatioColor(ratio: number) {
    if (ratio < 140) return 'text-red-500'
    if (ratio < 150) return 'text-orange-500'
    return 'text-yellow-500'
}

export function LiquidatableVaultList({
    vaults = [],
    isLoading,
    onLiquidate,
}: LiquidatableVaultListProps) {
    if (isLoading) {
        return (
            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (vaults.length === 0) {
        return (
            <div className="rounded-2xl bg-muted/50 p-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-green-500/10 mx-auto mb-4">
                    <Zap className="size-7 text-green-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Liquidatable Vaults</h3>
                <p className="text-muted-foreground">
                    All vaults are currently healthy. Check back later for liquidation opportunities.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-muted/50 overflow-hidden">
            {/* Desktop Table */}
            <table className="hidden lg:table w-full">
                <thead>
                    <tr className="border-b border-border/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Collateral</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Debt</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ratio</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Max Liquidatable</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Est. Profit</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {vaults.map((vault) => (
                        <tr key={vault.owner} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10">
                                        <AlertTriangle className="size-4 text-red-500" />
                                    </div>
                                    <span className="font-mono text-sm">{vault.owner}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <p className="font-medium">{vault.collateral}</p>
                                <p className="text-xs text-muted-foreground">≈ ${vault.collateralUsd}</p>
                            </td>
                            <td className="px-4 py-4 font-medium">{vault.debt}</td>
                            <td className="px-4 py-4">
                                <span className={cn('font-bold', getRatioColor(vault.collateralRatio))}>
                                    {vault.collateralRatio}%
                                </span>
                            </td>
                            <td className="px-4 py-4 font-medium">{vault.maxLiquidatable}</td>
                            <td className="px-4 py-4 font-medium text-green-500">+{vault.potentialProfit}</td>
                            <td className="px-6 py-4 text-right">
                                <Button
                                    size="sm"
                                    onClick={() => onLiquidate?.(vault)}
                                    className="gap-1"
                                >
                                    <Zap className="size-3" />
                                    Liquidate
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
                {vaults.map((vault) => (
                    <div key={vault.owner} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10">
                                    <AlertTriangle className="size-4 text-red-500" />
                                </div>
                                <span className="font-mono text-sm">{vault.owner}</span>
                            </div>
                            <span className={cn('font-bold', getRatioColor(vault.collateralRatio))}>
                                {vault.collateralRatio}%
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">Collateral</p>
                                <p className="font-medium">{vault.collateral}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Debt</p>
                                <p className="font-medium">{vault.debt}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Max Liquidatable</p>
                                <p className="font-medium">{vault.maxLiquidatable}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Est. Profit</p>
                                <p className="font-medium text-green-500">+{vault.potentialProfit}</p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => onLiquidate?.(vault)}
                            className="w-full gap-1"
                        >
                            <Zap className="size-3" />
                            Liquidate
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
