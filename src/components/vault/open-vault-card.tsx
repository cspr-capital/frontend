'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { Vault, ArrowRight, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

type ModalState = 'idle' | 'pending' | 'success' | 'error'

interface OpenVaultCardProps {
    onOpen?: () => Promise<string> // Returns tx hash
}

export function OpenVaultCard({ onOpen }: OpenVaultCardProps) {
    const [modalState, setModalState] = useState<ModalState>('idle')
    const [txHash, setTxHash] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleOpenVault = async () => {
        if (!onOpen) return
        setModalState('pending')
        setErrorMsg(null)
        try {
            const hash = await onOpen()
            setTxHash(hash)
            setModalState('success')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Transaction failed')
            setModalState('error')
        }
    }

    const handleClose = () => {
        if (modalState === 'pending') return // Don't close while pending
        setModalState('idle')
        setTxHash(null)
        setErrorMsg(null)
    }

    return (
        <>
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
                                0%
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

                    <Button onClick={handleOpenVault} size="lg" className="gap-2">
                        Open Vault
                        <ArrowRight className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Transaction Status Modal */}
            <Dialog open={modalState !== 'idle'} onOpenChange={() => handleClose()}>
                <DialogContent className="sm:max-w-md">
                    {modalState === 'pending' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="size-12 text-primary animate-spin" />
                            <h3 className="text-xl font-semibold">Opening Vault</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Please confirm in your wallet and wait for the transaction to be submitted...
                            </p>
                        </div>
                    )}

                    {modalState === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
                                <CheckCircle2 className="size-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold">Vault Created!</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Your vault has been created successfully. You can now deposit collateral and mint cUSD.
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
                            <Button onClick={handleClose} className="w-full mt-4">
                                Continue
                            </Button>
                        </div>
                    )}

                    {modalState === 'error' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
                                <XCircle className="size-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold">Transaction Failed</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                {errorMsg || 'Something went wrong'}
                            </p>
                            <Button onClick={handleClose} variant="outline" className="w-full">
                                Try Again
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
