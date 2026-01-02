'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface ParamsData {
    minCollateralRatio: string
    liquidationRatio: string
    liquidationBonus: string
    stabilityFee: string
}

interface ProtocolParamsProps {
    data?: ParamsData
    isLoading?: boolean
}

export function ProtocolParams({ data, isLoading }: ProtocolParamsProps) {
    return (
        <div className="rounded-2xl bg-muted/50 p-8">
            <p className="font-medium mb-6">Protocol Parameters</p>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    {isLoading ? (
                        <Skeleton className="h-10 w-20" />
                    ) : (
                        <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            {data?.minCollateralRatio ?? '—'}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">Min Collateral</p>
                </div>
                <div className="space-y-1">
                    {isLoading ? (
                        <Skeleton className="h-10 w-20" />
                    ) : (
                        <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            {data?.liquidationRatio ?? '—'}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">Liquidation At</p>
                </div>
                <div className="space-y-1">
                    {isLoading ? (
                        <Skeleton className="h-10 w-20" />
                    ) : (
                        <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            {data?.liquidationBonus ?? '—'}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">Liq. Bonus</p>
                </div>
                <div className="space-y-1">
                    {isLoading ? (
                        <Skeleton className="h-10 w-20" />
                    ) : (
                        <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            {data?.stabilityFee ?? '—'}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">Stability Fee</p>
                </div>
            </div>
        </div>
    )
}
