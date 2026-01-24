'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/hero-header'
import { ArrowRight, CreditCard, Store, Repeat, PiggyBank, Building2, Globe, Banknote, Users } from 'lucide-react'

const useCases = [
    {
        title: 'Payments',
        description: 'Accept cUSD payments on your website or app with our simple "Pay with cUSD" widget. Perfect for freelancers, creators, and businesses.',
        icon: CreditCard,
        color: 'primary',
        href: '/use-cases/payments',
        featured: true,
    },
    {
        title: 'E-Commerce',
        description: 'Sell products and services with stable USD pricing. Eliminate volatility concerns and provide customers with predictable costs.',
        icon: Store,
        color: 'green-500',
    },
    {
        title: 'Trading Pairs',
        description: 'Use cUSD as a stable quote currency for DEX trading pairs. Build liquidity pools with reduced impermanent loss risk.',
        icon: Repeat,
        color: 'blue-500',
    },
    {
        title: 'Savings & Treasury',
        description: 'Hold stable value on-chain without off-ramping. DAOs and protocols can manage treasury with reduced volatility exposure.',
        icon: PiggyBank,
        color: 'purple-500',
    },
    {
        title: 'Payroll',
        description: 'Pay contributors and employees in stable cUSD. Recipients get predictable value regardless of market conditions.',
        icon: Building2,
        color: 'orange-500',
    },
    {
        title: 'Remittances',
        description: 'Send value across borders with minimal fees. cUSD settles in seconds on Casper Network.',
        icon: Globe,
        color: 'cyan-500',
    },
    {
        title: 'Lending & Borrowing',
        description: 'Use cUSD in DeFi lending protocols. Borrow against your cUSD or earn yield by providing liquidity.',
        icon: Banknote,
        color: 'yellow-500',
    },
    {
        title: 'P2P Transactions',
        description: 'Send stable value to friends and family. No bank accounts needed, just a Casper wallet.',
        icon: Users,
        color: 'pink-500',
    },
]

export default function UseCasesPage() {
    return (
        <>
            <HeroHeader />
            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-medium md:text-5xl">Use Cases for cUSD</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            A stable digital dollar unlocks countless possibilities on Casper Network.
                            Explore how cUSD can power your project or business.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {useCases.map((useCase) => {
                            const Icon = useCase.icon
                            const content = (
                                <div className={`group rounded-2xl border border-border/50 bg-background p-6 hover:border-${useCase.color}/50 hover:shadow-lg transition-all duration-300 h-full ${useCase.featured ? 'ring-2 ring-primary/20' : ''}`}>
                                    {useCase.featured && (
                                        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mb-4">
                                            Featured
                                        </span>
                                    )}
                                    <div className={`flex size-12 items-center justify-center rounded-xl bg-${useCase.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`size-6 text-${useCase.color}`} />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">{useCase.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {useCase.description}
                                    </p>
                                    {useCase.href && (
                                        <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 group-hover:gap-2 transition-all">
                                            Learn more <ArrowRight className="size-4" />
                                        </span>
                                    )}
                                </div>
                            )

                            if (useCase.href) {
                                return (
                                    <Link key={useCase.title} href={useCase.href} className="block">
                                        {content}
                                    </Link>
                                )
                            }

                            return <div key={useCase.title}>{content}</div>
                        })}
                    </div>

                    <div className="mt-16 rounded-2xl bg-muted/50 border border-border/50 p-8 md:p-12 text-center">
                        <h2 className="text-2xl font-medium mb-4">Have a use case in mind?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                            We&apos;re always looking to expand the cUSD ecosystem. If you have an idea for
                            how cUSD could be used, we&apos;d love to hear from you.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/app">
                                Get Started with cUSD
                                <ArrowRight className="size-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        </>
    )
}
