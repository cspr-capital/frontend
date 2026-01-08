'use client'

import { AlertTriangle, Zap, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface LiquidationStatsProps {
    totalLiquidatable?: number
    totalDebtAtRisk?: string
    avgRatio?: number
    isLoading?: boolean
}

export function LiquidationStats({
    totalLiquidatable = 0,
    totalDebtAtRisk = '0',
    avgRatio = 0,
    isLoading,
}: LiquidationStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-muted/50 p-6">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Unsafe Vaults</p>
                    <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10">
                        <AlertTriangle className="size-4 text-red-500" />
                    </div>
                </div>
                <p className="mt-2 bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                    {totalLiquidatable}
                </p>
            </div>

            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Total Debt at Risk</p>
                    <div className="flex size-8 items-center justify-center rounded-full bg-orange-500/10">
                        <Zap className="size-4 text-orange-500" />
                    </div>
                </div>
                <p className="mt-2 bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                    {totalDebtAtRisk} cUSD
                </p>
            </div>

            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Avg Collateral Ratio</p>
                    <div className="flex size-8 items-center justify-center rounded-full bg-yellow-500/10">
                        <TrendingUp className="size-4 text-yellow-500" />
                    </div>
                </div>
                <p className="mt-2 bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                    {avgRatio}%
                </p>
            </div>
        </div>
    )
}
