'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Landmark, Vault } from 'lucide-react'

interface StatsData {
    totalSupply: string
    totalCollateral: string
    totalVaults: number
}

interface SystemStatsProps {
    data?: StatsData
    isLoading?: boolean
}

export function SystemStats({ data, isLoading }: SystemStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/50 rounded-2xl p-6 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Coins className="size-6 text-primary" />
                </div>
                <div>
                    {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                    ) : (
                        <div className="text-2xl font-bold">${data?.totalSupply ?? '0'}</div>
                    )}
                    <p className="text-sm text-muted-foreground">Total cUSD Supply</p>
                </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-6 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Landmark className="size-6 text-primary" />
                </div>
                <div>
                    {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                    ) : (
                        <div className="text-2xl font-bold">{data?.totalCollateral ?? '0'}</div>
                    )}
                    <p className="text-sm text-muted-foreground">Total CSPR Locked</p>
                </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-6 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Vault className="size-6 text-primary" />
                </div>
                <div>
                    {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                    ) : (
                        <div className="text-2xl font-bold">{data?.totalVaults ?? 0}</div>
                    )}
                    <p className="text-sm text-muted-foreground">Active Vaults</p>
                </div>
            </div>
        </div>
    )
}
