'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, Plus, Minus, ExternalLink } from 'lucide-react'
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

// Mock data
const mockTransactions: Transaction[] = [
    { id: '1', type: 'deposit', amount: '50,000 CSPR', timestamp: '2 hours ago', hash: '0x1a2b...3c4d' },
    { id: '2', type: 'mint', amount: '500 cUSD', timestamp: '2 hours ago', hash: '0x5e6f...7g8h' },
    { id: '3', type: 'deposit', amount: '100,000 CSPR', timestamp: '1 day ago', hash: '0x9i0j...1k2l' },
    { id: '4', type: 'mint', amount: '1,200 cUSD', timestamp: '1 day ago', hash: '0x3m4n...5o6p' },
    { id: '5', type: 'repay', amount: '200 cUSD', timestamp: '3 days ago', hash: '0xab12...cd34' },
    { id: '6', type: 'withdraw', amount: '25,000 CSPR', timestamp: '5 days ago', hash: '0xef56...gh78' },
]

export function VaultHistory({ transactions = mockTransactions, isLoading }: VaultHistoryProps) {
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
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="font-medium">{tx.amount}</p>
                                            <button
                                                onClick={() => window.open(`https://cspr.live/deploy/${tx.hash}`, '_blank')}
                                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                                            >
                                                {tx.hash}
                                                <ExternalLink className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="pt-4 text-center">
                        <Button variant="ghost" size="sm">
                            Load More
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
