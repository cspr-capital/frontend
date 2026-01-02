'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, Flame } from 'lucide-react'

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

// Mock data for development
const mockMints: MintEvent[] = [
    { id: '1', address: '0x1a2b...3c4d', amount: '5,000 cUSD', timestamp: '5 min ago' },
    { id: '2', address: '0x5e6f...7g8h', amount: '12,500 cUSD', timestamp: '18 min ago' },
    { id: '3', address: '0x9i0j...1k2l', amount: '2,000 cUSD', timestamp: '1 hour ago' },
    { id: '4', address: '0x3m4n...5o6p', amount: '8,750 cUSD', timestamp: '2 hours ago' },
]

const mockLiquidations: LiquidationEvent[] = [
    { id: '1', address: '0xab12...cd34', collateralSeized: '50,000 CSPR', debtRepaid: '1,000 cUSD', timestamp: '2 hours ago' },
    { id: '2', address: '0xef56...gh78', collateralSeized: '125,000 CSPR', debtRepaid: '2,500 cUSD', timestamp: '5 hours ago' },
    { id: '3', address: '0xij90...kl12', collateralSeized: '75,000 CSPR', debtRepaid: '1,500 cUSD', timestamp: '1 day ago' },
]

export function RecentActivity({ mints = mockMints, liquidations = mockLiquidations, isLoading }: RecentActivityProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Mints */}
            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight className="size-5 text-green-500" />
                        <h3 className="font-medium">Recent Mints</h3>
                    </div>
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        View All
                    </button>
                </div>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
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
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        View All
                    </button>
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
