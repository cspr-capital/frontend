'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWallet } from '@/hooks/use-wallet'
import { useState } from 'react'
import { Copy, LogOut, ExternalLink, ChevronDown } from 'lucide-react'

interface ConnectWalletProps {
    size?: 'default' | 'sm' | 'lg'
}

export function ConnectWallet({ size = 'default' }: ConnectWalletProps) {
    const { isConnected, address, publicKey, connect, disconnect, isWalletExtensionAvailable } = useWallet()
    const [isLoading, setIsLoading] = useState(false)

    const handleConnect = async () => {
        if (!isWalletExtensionAvailable()) {
            window.open('https://www.casperwallet.io/', '_blank')
            return
        }

        setIsLoading(true)
        try {
            await connect()
        } catch (error) {
            console.error('Failed to connect:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const copyAddress = () => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey)
        }
    }

    const openExplorer = () => {
        if (publicKey) {
            window.open(`https://cspr.live/account/${publicKey}`, '_blank')
        }
    }

    if (!isConnected) {
        return (
            <Button
                size={size}
                onClick={handleConnect}
                disabled={isLoading}
            >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={size} className="gap-2">
                    {address}
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">Connected Wallet</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{publicKey}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyAddress}>
                    <Copy className="mr-2 size-4" />
                    Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openExplorer}>
                    <ExternalLink className="mr-2 size-4" />
                    View on Explorer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => disconnect()} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 size-4" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
