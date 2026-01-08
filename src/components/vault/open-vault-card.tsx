'use client'

import { Button } from '@/components/ui/button'
import { Vault, ArrowRight } from 'lucide-react'

interface OpenVaultCardProps {
    onOpen?: () => void
    isLoading?: boolean
}

export function OpenVaultCard({ onOpen, isLoading }: OpenVaultCardProps) {
    return (
        <div className="rounded-2xl border bg-gradient-to-br from-muted/30 to-muted/60 p-8 md:p-12">
            <div className="max-w-lg">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                    <Vault className="size-7 text-primary" />
                </div>

                <h2 className="text-3xl font-medium mb-3">Open Your First Vault</h2>
                <p className="text-muted-foreground text-lg mb-8">
                    Deposit CSPR as collateral to mint cUSD stablecoin. Maintain at least 170% collateral ratio to keep your vault healthy.
                </p>

                <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-border/50">
                    <div>
                        <p className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            170%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Min Collateral</p>
                    </div>
                    <div>
                        <p className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            0.5%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Stability Fee</p>
                    </div>
                    <div>
                        <p className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                            $1.00
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">cUSD Peg</p>
                    </div>
                </div>

                <Button onClick={onOpen} size="lg" className="gap-2" disabled={isLoading}>
                    {isLoading ? 'Opening Vault...' : 'Open Vault'}
                    {!isLoading && <ArrowRight className="size-4" />}
                </Button>
            </div>
        </div>
    )
}
