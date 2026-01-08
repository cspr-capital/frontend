'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Zap, ExternalLink } from 'lucide-react'

interface Liquidation {
    id: string
    vaultOwner: string
    liquidator: string
    debtRepaid: string
    collateralSeized: string
    profit: string
    timestamp: string
    hash: string
}

interface LiquidationHistoryProps {
    liquidations?: Liquidation[]
    isLoading?: boolean
}

const mockLiquidations: Liquidation[] = [
    {
        id: '1',
        vaultOwner: '0x3m4n...5o6p',
        liquidator: '0xab12...cd34',
        debtRepaid: '1,500 cUSD',
        collateralSeized: '70,500 CSPR',
        profit: '165 CSPR',
        timestamp: '3 hours ago',
        hash: '0x7a8b...9c0d',
    },
    {
        id: '2',
        vaultOwner: '0xef56...gh78',
        liquidator: '0x1234...5678',
        debtRepaid: '800 cUSD',
        collateralSeized: '37,600 CSPR',
        profit: '88 CSPR',
        timestamp: '1 day ago',
        hash: '0x2e3f...4g5h',
    },
    {
        id: '3',
        vaultOwner: '0x9i0j...1k2l',
        liquidator: '0xab12...cd34',
        debtRepaid: '2,200 cUSD',
        collateralSeized: '103,400 CSPR',
        profit: '242 CSPR',
        timestamp: '2 days ago',
        hash: '0x6i7j...8k9l',
    },
]

export function LiquidationHistory({
    liquidations = mockLiquidations,
    isLoading,
}: LiquidationHistoryProps) {
    if (isLoading) {
        return (
            <div className="rounded-2xl bg-muted/50 p-6">
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (liquidations.length === 0) {
        return (
            <div className="rounded-2xl bg-muted/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">No liquidations yet</p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-muted/50 overflow-hidden">
            {/* Desktop Table */}
            <table className="hidden md:table w-full">
                <thead>
                    <tr className="border-b border-border/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Liquidator</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Debt Repaid</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Collateral Seized</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Profit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Tx</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {liquidations.map((liq) => (
                        <tr key={liq.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10">
                                        <Zap className="size-4 text-red-500" />
                                    </div>
                                    <span className="font-mono text-sm">{liq.liquidator}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 font-medium">{liq.debtRepaid}</td>
                            <td className="px-4 py-4 font-medium">{liq.collateralSeized}</td>
                            <td className="px-4 py-4 font-medium text-green-500">+{liq.profit}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">{liq.timestamp}</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => window.open(`https://cspr.live/deploy/${liq.hash}`, '_blank')}
                                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                                >
                                    {liq.hash}
                                    <ExternalLink className="size-3" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/50">
                {liquidations.map((liq) => (
                    <div key={liq.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10">
                                    <Zap className="size-4 text-red-500" />
                                </div>
                                <span className="font-mono text-sm">{liq.liquidator}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{liq.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">Debt Repaid</p>
                                <p className="font-medium">{liq.debtRepaid}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Collateral Seized</p>
                                <p className="font-medium">{liq.collateralSeized}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-green-500">+{liq.profit}</span>
                            <button
                                onClick={() => window.open(`https://cspr.live/deploy/${liq.hash}`, '_blank')}
                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                            >
                                {liq.hash}
                                <ExternalLink className="size-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 text-center border-t border-border/50">
                <Button variant="ghost" size="sm">
                    Load More
                </Button>
            </div>
        </div>
    )
}
