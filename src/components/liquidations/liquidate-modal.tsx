'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Zap, AlertTriangle, Loader2 } from 'lucide-react'
import type { LiquidatableVault } from './liquidatable-vault-list'

interface LiquidateModalProps {
    vault: LiquidatableVault | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit?: (vault: LiquidatableVault, amount: string) => Promise<void>
}

export function LiquidateModal({
    vault,
    open,
    onOpenChange,
    onSubmit,
}: LiquidateModalProps) {
    const [amount, setAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!vault) return null

    const maxAmount = vault.maxLiquidatable.replace(/[^0-9.]/g, '')

    const handleMax = () => {
        setAmount(maxAmount)
    }

    const handleSubmit = async () => {
        if (!amount || !onSubmit) return
        setIsLoading(true)
        try {
            await onSubmit(vault, amount)
            setAmount('')
            onOpenChange(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = (open: boolean) => {
        if (!open) setAmount('')
        onOpenChange(open)
    }

    // Calculate estimated profit based on amount
    const calculateProfit = () => {
        const numAmount = parseFloat(amount) || 0
        const maxNum = parseFloat(maxAmount) || 1
        const maxProfit = parseFloat(vault.potentialProfit.replace(/[^0-9.]/g, '')) || 0
        return ((numAmount / maxNum) * maxProfit).toFixed(2)
    }

    // Calculate CSPR to receive (amount / price * 1.1 for bonus)
    const calculateCsprReceived = () => {
        const numAmount = parseFloat(amount) || 0
        // Assuming ~$0.0234 per CSPR for calculation display
        const csprPerUsd = 42.74
        return (numAmount * csprPerUsd * 1.1).toFixed(0)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
                            <Zap className="size-5 text-red-500" />
                        </div>
                        Liquidate Vault
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Vault Info */}
                    <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Vault Owner</span>
                            <span className="font-mono">{vault.owner}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Collateral</span>
                            <span className="font-medium">{vault.collateral}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Debt</span>
                            <span className="font-medium">{vault.debt}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Collateral Ratio</span>
                            <span className={cn(
                                'font-bold',
                                vault.collateralRatio < 140 ? 'text-red-500' : 'text-orange-500'
                            )}>
                                {vault.collateralRatio}%
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Amount to Repay</span>
                            <button
                                onClick={handleMax}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Max: <span className="text-foreground">{vault.maxLiquidatable}</span>
                                <span className="ml-1">[use max]</span>
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pr-16 text-lg h-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                cUSD
                            </span>
                        </div>
                    </div>

                    {/* Profit Preview */}
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">CSPR to Receive</span>
                            <span className="font-medium">{calculateCsprReceived()} CSPR</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Liquidation Bonus</span>
                            <span className="font-medium text-green-500">+10%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-t border-green-500/20 pt-3">
                            <span className="text-muted-foreground">Estimated Profit</span>
                            <span className="font-bold text-green-500">+{calculateProfit()} CSPR</span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="size-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p>
                            You need {amount || '0'} cUSD in your wallet to execute this liquidation.
                            The transaction will fail if the vault becomes healthy before execution.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                        className="w-full h-12 text-base bg-red-500 hover:bg-red-600"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Zap className="size-4 mr-2" />
                                Execute Liquidation
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
