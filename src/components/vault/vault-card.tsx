'use client'

import { Button } from '@/components/ui/button'
import { HealthGauge } from './health-gauge'
import { ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-react'

interface VaultData {
    collateral: string
    collateralUsd: string
    debt: string
    availableToMint: string
    availableToWithdraw: string
    collateralRatio: number
}

interface VaultCardProps {
    data: VaultData
    onDeposit?: () => void
    onWithdraw?: () => void
    onMint?: () => void
    onRepay?: () => void
}

export function VaultCard({ data, onDeposit, onWithdraw, onMint, onRepay }: VaultCardProps) {
    return (
        <div className="space-y-6">
            {/* Health Section - Full Width */}
            <div className="rounded-2xl bg-muted/50 p-6">
                <HealthGauge ratio={data.collateralRatio} />
            </div>

            {/* Collateral & Debt - Two Columns */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Collateral Card */}
                <div className="rounded-2xl border bg-background p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Collateral Locked</p>
                        <div className="flex size-8 items-center justify-center rounded-full bg-green-500/10">
                            <ArrowUpRight className="size-4 text-green-500" />
                        </div>
                    </div>
                    <div>
                        <p className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            {data.collateral}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">≈ ${data.collateralUsd} USD</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button onClick={onDeposit} size="sm" className="flex-1 gap-1">
                            <Plus className="size-4" />
                            Deposit
                        </Button>
                        <Button onClick={onWithdraw} size="sm" variant="outline" className="flex-1 gap-1">
                            <Minus className="size-4" />
                            Withdraw
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Available: <span className="text-foreground">{data.availableToWithdraw} CSPR</span>
                    </p>
                </div>

                {/* Debt Card */}
                <div className="rounded-2xl border bg-background p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">cUSD Debt</p>
                        <div className="flex size-8 items-center justify-center rounded-full bg-orange-500/10">
                            <ArrowDownRight className="size-4 text-orange-500" />
                        </div>
                    </div>
                    <div>
                        <p className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            {data.debt} cUSD
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">≈ ${data.debt} USD</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button onClick={onMint} size="sm" className="flex-1 gap-1">
                            <Plus className="size-4" />
                            Mint
                        </Button>
                        <Button onClick={onRepay} size="sm" variant="outline" className="flex-1 gap-1">
                            <Minus className="size-4" />
                            Repay
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Available: <span className="text-foreground">{data.availableToMint} cUSD</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
