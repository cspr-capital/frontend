'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Dashboard', href: '/app' },
    { name: 'Vault', href: '/app/vault' },
    { name: 'Liquidations', href: '/app/liquidations' },
]

export function AppHeader() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur-lg">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:block">
                            <ul className="flex gap-1">
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                                pathname === item.href
                                                    ? "bg-muted text-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                            0x1234...5678
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
