'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type TransactionType = 'deposit' | 'withdraw' | 'mint' | 'repay'

interface Transaction {
    id: string
    type: TransactionType
    amount: string
    timestamp: string
    hash: string
}

interface VaultHistoryProps {
    transactions?: Transaction[]
    isLoading?: boolean
}

const txConfig: Record<TransactionType, { icon: typeof Plus; label: string; color: string; bgColor: string }> = {
    deposit: { icon: ArrowUpRight, label: 'Deposit', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    withdraw: { icon: ArrowDownRight, label: 'Withdraw', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    mint: { icon: Plus, label: 'Mint', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    repay: { icon: Minus, label: 'Repay', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
}

export function VaultHistory({ transactions = [], isLoading }: VaultHistoryProps) {
    return (
        <div className="rounded-2xl bg-muted/50 p-6">
            <h3 className="font-medium mb-4">Transaction History</h3>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No transactions yet</p>
            ) : (
                <>
                    <div className="space-y-1">
                        {transactions.map((tx) => {
                            const config = txConfig[tx.type]
                            const Icon = config.icon
                            return (
                                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('flex size-9 items-center justify-center rounded-full', config.bgColor)}>
                                            <Icon className={cn('size-4', config.color)} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{config.label}</p>
                                            <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{tx.amount}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
