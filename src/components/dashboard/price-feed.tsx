'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'

interface PriceData {
    price: string
    lastUpdate: string
    isFresh: boolean
}

interface PriceFeedProps {
    data?: PriceData
    isLoading?: boolean
}

export function PriceFeed({ data, isLoading }: PriceFeedProps) {
    return (
        <div className="rounded-2xl bg-muted/50 p-8">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <TrendingUp className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">CSPR/USD</p>
                        <p className="text-xs text-muted-foreground">Oracle Price Feed</p>
                    </div>
                </div>
                {data?.isFresh !== undefined && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        data.isFresh
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        <span className={`size-1.5 rounded-full ${data.isFresh ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {data.isFresh ? 'Live' : 'Stale'}
                    </span>
                )}
            </div>
            {isLoading ? (
                <Skeleton className="h-16 w-48" />
            ) : (
                <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-6xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                    ${data?.price ?? '0.00'}
                </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
                Updated {data?.lastUpdate ?? '—'}
            </p>
        </div>
    )
}
