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
import { ArrowUpRight, ArrowDownRight, Plus, Minus, Loader2 } from 'lucide-react'

type ActionType = 'deposit' | 'withdraw' | 'mint' | 'repay'

interface VaultActionModalProps {
    type: ActionType
    open: boolean
    onOpenChange: (open: boolean) => void
    maxAmount?: string
    currentRatio?: number
    onSubmit?: (amount: string) => Promise<void>
}

const actionConfig: Record<ActionType, {
    title: string
    icon: typeof Plus
    color: string
    bgColor: string
    token: string
    buttonLabel: string
    maxLabel: string
}> = {
    deposit: {
        title: 'Deposit Collateral',
        icon: ArrowUpRight,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        token: 'CSPR',
        buttonLabel: 'Deposit',
        maxLabel: 'Wallet Balance',
    },
    withdraw: {
        title: 'Withdraw Collateral',
        icon: ArrowDownRight,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        token: 'CSPR',
        buttonLabel: 'Withdraw',
        maxLabel: 'Available',
    },
    mint: {
        title: 'Mint cUSD',
        icon: Plus,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        token: 'cUSD',
        buttonLabel: 'Mint',
        maxLabel: 'Available to Mint',
    },
    repay: {
        title: 'Repay cUSD',
        icon: Minus,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        token: 'cUSD',
        buttonLabel: 'Repay',
        maxLabel: 'Your cUSD Balance',
    },
}

export function VaultActionModal({
    type,
    open,
    onOpenChange,
    maxAmount = '0',
    currentRatio = 200,
    onSubmit,
}: VaultActionModalProps) {
    const [amount, setAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const config = actionConfig[type]
    const Icon = config.icon

    const handleMax = () => {
        setAmount(maxAmount.replace(/,/g, ''))
    }

    const handleSubmit = async () => {
        if (!amount || !onSubmit) return
        setIsLoading(true)
        try {
            await onSubmit(amount)
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

    // Calculate projected ratio based on action
    const getProjectedRatio = () => {
        const numAmount = parseFloat(amount) || 0
        if (numAmount === 0) return currentRatio

        // Simplified calculation for display purposes
        // Real implementation would use actual collateral/debt values
        switch (type) {
            case 'deposit':
                return currentRatio + (numAmount * 0.01)
            case 'withdraw':
                return Math.max(0, currentRatio - (numAmount * 0.01))
            case 'mint':
                return Math.max(0, currentRatio - (numAmount * 0.05))
            case 'repay':
                return currentRatio + (numAmount * 0.05)
            default:
                return currentRatio
        }
    }

    const projectedRatio = getProjectedRatio()
    const isRatioSafe = projectedRatio >= 170

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className={cn('flex size-10 items-center justify-center rounded-full', config.bgColor)}>
                            <Icon className={cn('size-5', config.color)} />
                        </div>
                        {config.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <button
                                onClick={handleMax}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {config.maxLabel}: <span className="text-foreground">{maxAmount} {config.token}</span>
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
                                {config.token}
                            </span>
                        </div>
                    </div>

                    {/* Ratio Preview */}
                    <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Ratio</span>
                            <span className="font-medium">{currentRatio.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Projected Ratio</span>
                            <span className={cn(
                                'font-medium',
                                isRatioSafe ? 'text-green-500' : 'text-red-500'
                            )}>
                                {projectedRatio.toFixed(0)}%
                            </span>
                        </div>
                        {!isRatioSafe && amount && (
                            <p className="text-xs text-red-500">
                                Warning: This would put your vault below the minimum 170% ratio
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || isLoading || (!isRatioSafe && (type === 'withdraw' || type === 'mint'))}
                        className="w-full h-12 text-base"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            config.buttonLabel
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
