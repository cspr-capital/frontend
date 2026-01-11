'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, Flame, ExternalLink } from 'lucide-react'

const VAULT_MANAGER_HASH = process.env.NEXT_PUBLIC_VAULT_MANAGER_HASH || ""

interface MintEvent {
    id: string
    address: string
    amount: string
    timestamp: string
}

interface LiquidationEvent {
    id: string
    address: string
    collateralSeized: string
    debtRepaid: string
    timestamp: string
}

interface RecentActivityProps {
    mints?: MintEvent[]
    liquidations?: LiquidationEvent[]
    isLoading?: boolean
}

export function RecentActivity({ mints = [], liquidations = [], isLoading }: RecentActivityProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Mints */}
            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight className="size-5 text-green-500" />
                        <h3 className="font-medium">Recent Mints</h3>
                    </div>
                    <a
                        href={`https://cspr.live/contract/${VAULT_MANAGER_HASH}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                        View All
                        <ExternalLink className="size-3" />
                    </a>
                </div>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : mints.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No recent mints</p>
                ) : (
                    <div className="space-y-1">
                        {mints.map((mint) => (
                            <div key={mint.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                                <div>
                                    <p className="font-mono text-sm">{mint.address}</p>
                                    <p className="text-xs text-muted-foreground">{mint.timestamp}</p>
                                </div>
                                <p className="font-medium text-green-600 dark:text-green-400">+{mint.amount}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Liquidations */}
            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flame className="size-5 text-orange-500" />
                        <h3 className="font-medium">Recent Liquidations</h3>
                    </div>
                    <a
                        href={`https://cspr.live/contract/${VAULT_MANAGER_HASH}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                        View All
                        <ExternalLink className="size-3" />
                    </a>
                </div>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : liquidations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No recent liquidations</p>
                ) : (
                    <div className="space-y-1">
                        {liquidations.map((liq) => (
                            <div key={liq.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                                <div>
                                    <p className="font-mono text-sm">{liq.address}</p>
                                    <p className="text-xs text-muted-foreground">{liq.timestamp}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-orange-600 dark:text-orange-400">{liq.collateralSeized}</p>
                                    <p className="text-xs text-muted-foreground">{liq.debtRepaid} repaid</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
