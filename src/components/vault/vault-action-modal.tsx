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
import { ArrowUpRight, ArrowDownRight, Plus, Minus, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

type ActionType = 'deposit' | 'withdraw' | 'mint' | 'repay'
type ModalState = 'input' | 'pending' | 'success' | 'error'

interface VaultActionModalProps {
    type: ActionType
    open: boolean
    onOpenChange: (open: boolean) => void
    maxAmount?: string
    displayAmount?: string // For showing balance/available separately from max
    currentRatio?: number | null
    collateralValue?: number // USD value of collateral
    debtValue?: number // cUSD debt amount
    onSubmit?: (amount: string) => Promise<string> // Returns tx hash
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
    displayAmount,
    currentRatio,
    collateralValue = 0,
    debtValue = 0,
    onSubmit,
}: VaultActionModalProps) {
    // Use displayAmount for showing balance/available, fall back to maxAmount
    const shownAmount = displayAmount ?? maxAmount
    const [amount, setAmount] = useState('')
    const [modalState, setModalState] = useState<ModalState>('input')
    const [txHash, setTxHash] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const config = actionConfig[type]
    const Icon = config.icon

    const handleMax = () => {
        setAmount(maxAmount.replace(/,/g, ''))
    }

    const handleSubmit = async () => {
        if (!amount || !onSubmit) return
        setModalState('pending')
        setErrorMsg(null)
        try {
            const hash = await onSubmit(amount)
            setTxHash(hash)
            setModalState('success')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Transaction failed')
            setModalState('error')
        }
    }

    const handleClose = (openState: boolean) => {
        if (!openState) {
            // Reset state when closing
            setAmount('')
            setModalState('input')
            setTxHash(null)
            setErrorMsg(null)
        }
        onOpenChange(openState)
    }

    const handleDone = () => {
        handleClose(false)
    }

    // Calculate projected ratio based on action type and real values
    // Ratio = (collateralValue / debt) * 100
    const getProjectedRatio = (): number | null => {
        const numAmount = parseFloat(amount) || 0
        if (numAmount === 0) return currentRatio ?? null

        let projectedCollateral = collateralValue
        let projectedDebt = debtValue

        switch (type) {
            case 'deposit':
                // Adding collateral increases ratio (need price to convert CSPR to USD)
                // For now, assume the collateralValue prop is already in USD
                projectedCollateral = collateralValue + numAmount
                break
            case 'withdraw':
                projectedCollateral = Math.max(0, collateralValue - numAmount)
                break
            case 'mint':
                // Minting increases debt, which decreases ratio
                projectedDebt = debtValue + numAmount
                break
            case 'repay':
                projectedDebt = Math.max(0, debtValue - numAmount)
                break
        }

        // If no debt after action, ratio is infinite
        if (projectedDebt === 0) return null

        // Ratio in percentage: (collateral / debt) * 100
        return (projectedCollateral / projectedDebt) * 100
    }

    const projectedRatio = getProjectedRatio()

    // Format ratio for display
    const formatRatio = (ratio: number | null | undefined): string => {
        if (ratio === null || ratio === undefined) return '∞'
        if (ratio > 10000) return '∞'
        return `${ratio.toFixed(0)}%`
    }

    const isRatioSafe = projectedRatio === null || projectedRatio >= 170

    // Success state content
    if (modalState === 'success') {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle2 className="size-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Transaction Submitted</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            Your {config.title.toLowerCase()} transaction has been submitted to the network.
                        </p>
                        {txHash && (
                            <a
                                href={`https://cspr.live/deploy/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                            >
                                View on Explorer
                                <ExternalLink className="size-4" />
                            </a>
                        )}
                        <Button onClick={handleDone} className="w-full mt-4">
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Pending state content
    if (modalState === 'pending') {
        return (
            <Dialog open={open} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="size-12 text-primary animate-spin" />
                        <h3 className="text-xl font-semibold">Processing Transaction</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            Please confirm in your wallet and wait for the transaction to be submitted...
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Error state content
    if (modalState === 'error') {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
                            <Minus className="size-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Transaction Failed</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            {errorMsg || 'Something went wrong'}
                        </p>
                        <Button onClick={() => setModalState('input')} variant="outline" className="w-full">
                            Try Again
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Input state content (default)
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
                                {config.maxLabel}: <span className="text-foreground">{shownAmount} {config.token}</span>
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
                            <span className="font-medium">{formatRatio(currentRatio)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Projected Ratio</span>
                            <span className={cn(
                                'font-medium',
                                isRatioSafe ? 'text-green-500' : 'text-red-500'
                            )}>
                                {formatRatio(projectedRatio)}
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
                        disabled={!amount || (!isRatioSafe && (type === 'withdraw' || type === 'mint'))}
                        className="w-full h-12 text-base"
                    >
                        {config.buttonLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
