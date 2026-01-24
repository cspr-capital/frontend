'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { HeroHeader } from './hero-header'
import { ConnectWallet } from '@/components/connect-wallet'
import { useWallet } from '@/hooks/use-wallet'
import { useSystemStats } from '@/hooks/use-system-stats'
import { useOracle } from '@/hooks/use-oracle'
import { ArrowRight, Shield, Zap, TrendingUp, Wallet, DollarSign, Lock, Users, Activity, CreditCard, Store, Repeat, PiggyBank } from 'lucide-react'

export default function HeroSection() {
    const { isConnected } = useWallet()
    const { formattedTotalSupply, formattedTotalCollateral, vaultCount, isLoading: statsLoading } = useSystemStats()
    const { priceUsd, isLoading: priceLoading } = useOracle()

    return (
        <>
            <HeroHeader />
            <main className="overflow-x-hidden">
                {/* Hero Section */}
                <section>
                    <div className="pb-12 pt-12 md:pb-16 lg:pb-24 lg:pt-32">
                        <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
                            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                                    Mint <span className="text-primary">cUSD</span> against your <span className="text-primary">CSPR</span>
                                </h1>
                                <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                                    The first overcollateralized stablecoin protocol on Casper Network.
                                    Deposit CSPR, mint cUSD, and unlock DeFi without selling your assets.
                                </p>

                                <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                                    {isConnected ? (
                                        <Button asChild size="lg" className="gap-2 px-8">
                                            <Link href="/app">
                                                <span className="text-nowrap">Launch App</span>
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <ConnectWallet size="lg" />
                                    )}
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline">
                                        <Link href="#how-it-works">
                                            <span className="text-nowrap">Learn More</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <Image
                                className="-z-10 order-first ml-auto h-56 w-full object-cover invert sm:h-96 lg:absolute lg:inset-0 lg:-right-20 lg:-top-96 lg:order-last lg:h-max lg:w-2/3 lg:object-contain dark:invert-0 dark:mix-blend-lighten"
                                src="/abstract-bg-red.webp"
                                alt="Abstract Background"
                                height="4000"
                                width="3000"
                            />
                        </div>
                    </div>
                </section>

                {/* Real-time Metrics Section */}
                <section className="border-y border-border/50 bg-muted/20">
                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                                    <DollarSign className="size-4" />
                                    <span className="text-sm">Total cUSD Minted</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-medium">
                                    {statsLoading ? (
                                        <span className="text-muted-foreground">—</span>
                                    ) : (
                                        <span>${formattedTotalSupply}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                                    <Lock className="size-4" />
                                    <span className="text-sm">CSPR Locked</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-medium">
                                    {statsLoading ? (
                                        <span className="text-muted-foreground">—</span>
                                    ) : (
                                        <span>{formattedTotalCollateral}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                                    <Activity className="size-4" />
                                    <span className="text-sm">CSPR Price</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-medium">
                                    {priceLoading ? (
                                        <span className="text-muted-foreground">—</span>
                                    ) : (
                                        <span>${priceUsd?.toFixed(6) ?? '0.00'}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                                    <Users className="size-4" />
                                    <span className="text-sm">Active Vaults</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-medium">
                                    {statsLoading ? (
                                        <span className="text-muted-foreground">—</span>
                                    ) : (
                                        <span>{vaultCount}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {vaultCount > 0 && (
                            <p className="text-center text-sm text-muted-foreground mt-6">
                                Join {vaultCount} vault{vaultCount !== 1 ? 's' : ''} already using CSPR Capital
                            </p>
                        )}
                    </div>
                </section>

                {/* Features Section - Bento Grid */}
                <section className="border-t border-border/50 bg-muted/30">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-medium md:text-4xl">Why CSPR Capital?</h2>
                            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                                A trustless protocol bringing DeFi primitives to Casper Network
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Large card */}
                            <div className="lg:col-span-2 group rounded-3xl bg-gradient-to-br from-primary/5 via-background to-background border border-border/50 p-8 hover:border-primary/30 transition-all duration-300">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="size-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-medium mb-3">Overcollateralized & Secure</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Every cUSD is backed by at least 170% CSPR value. The protocol automatically
                                    liquidates risky positions to maintain system solvency, ensuring your stablecoin
                                    remains stable.
                                </p>
                            </div>

                            {/* Tall card */}
                            <div className="row-span-2 group rounded-3xl bg-gradient-to-b from-green-500/5 via-background to-background border border-border/50 p-8 hover:border-green-500/30 transition-all duration-300 flex flex-col">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-green-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="size-7 text-green-500" />
                                </div>
                                <h3 className="text-xl font-medium mb-3">Keep Your Upside</h3>
                                <p className="text-muted-foreground leading-relaxed flex-grow">
                                    Why sell your CSPR when you can borrow against it? Access liquidity
                                    while maintaining full exposure to price appreciation. When CSPR moons,
                                    you still benefit.
                                </p>
                                <div className="mt-6 pt-6 border-t border-border/50">
                                    <div className="text-3xl font-medium text-green-500">170%</div>
                                    <div className="text-sm text-muted-foreground">Min Collateral Ratio</div>
                                </div>
                            </div>

                            {/* Small card */}
                            <div className="group rounded-3xl bg-gradient-to-br from-blue-500/5 via-background to-background border border-border/50 p-8 hover:border-blue-500/30 transition-all duration-300">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="size-7 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-medium mb-3">Instant Minting</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    No waiting periods, no approval queues. Mint cUSD the moment your
                                    collateral is deposited.
                                </p>
                            </div>

                            {/* Small card */}
                            <div className="group rounded-3xl bg-gradient-to-br from-purple-500/5 via-background to-background border border-border/50 p-8 hover:border-purple-500/30 transition-all duration-300">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Wallet className="size-7 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-medium mb-3">Non-Custodial</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Your keys, your funds. No intermediaries, no counterparty risk.
                                    Full control over your vault at all times.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="border-t border-border/50">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-medium md:text-4xl">How It Works</h2>
                            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                                Four simple steps to unlock liquidity from your CSPR
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="relative">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mb-4">
                                    1
                                </div>
                                <h3 className="font-medium mb-2">Deposit CSPR</h3>
                                <p className="text-sm text-muted-foreground">
                                    Lock your CSPR tokens as collateral in your personal vault
                                </p>
                            </div>

                            <div className="relative">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mb-4">
                                    2
                                </div>
                                <h3 className="font-medium mb-2">Mint cUSD</h3>
                                <p className="text-sm text-muted-foreground">
                                    Borrow cUSD stablecoins against your collateral at 170% ratio
                                </p>
                            </div>

                            <div className="relative">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mb-4">
                                    3
                                </div>
                                <h3 className="font-medium mb-2">Use Freely</h3>
                                <p className="text-sm text-muted-foreground">
                                    Spend, trade, or hold your cUSD as stable value
                                </p>
                            </div>

                            <div className="relative">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mb-4">
                                    4
                                </div>
                                <h3 className="font-medium mb-2">Repay & Unlock</h3>
                                <p className="text-sm text-muted-foreground">
                                    Return cUSD anytime to unlock and withdraw your CSPR
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section id="use-cases" className="border-t border-border/50 bg-muted/30">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-medium md:text-4xl">Use Cases for cUSD</h2>
                            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                                A stable digital dollar opens up endless possibilities on Casper Network
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Link href="/use-cases/payments" className="group rounded-2xl border border-border/50 bg-background p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard className="size-6 text-primary" />
                                </div>
                                <h3 className="font-medium mb-2">Payments</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Accept cUSD payments on your website with our simple &quot;Pay with cUSD&quot; widget.
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 group-hover:gap-2 transition-all">
                                    Learn more <ArrowRight className="size-4" />
                                </span>
                            </Link>

                            <div className="group rounded-2xl border border-border/50 bg-background p-6 hover:border-green-500/50 transition-all duration-300">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-green-500/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Store className="size-6 text-green-500" />
                                </div>
                                <h3 className="font-medium mb-2">E-Commerce</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Sell products and services with stable pricing. No more volatility concerns.
                                </p>
                            </div>

                            <div className="group rounded-2xl border border-border/50 bg-background p-6 hover:border-blue-500/50 transition-all duration-300">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Repeat className="size-6 text-blue-500" />
                                </div>
                                <h3 className="font-medium mb-2">Trading</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Use cUSD as a stable quote currency for DEX trading pairs on Casper.
                                </p>
                            </div>

                            <div className="group rounded-2xl border border-border/50 bg-background p-6 hover:border-purple-500/50 transition-all duration-300">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <PiggyBank className="size-6 text-purple-500" />
                                </div>
                                <h3 className="font-medium mb-2">Savings</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Hold stable value on-chain without off-ramping to traditional finance.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <Button asChild variant="outline" size="lg">
                                <Link href="/use-cases">
                                    View All Use Cases
                                    <ArrowRight className="size-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="border-t border-border/50">
                    <div className="mx-auto max-w-4xl px-6 py-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-medium md:text-4xl">Frequently Asked Questions</h2>
                            <p className="mt-4 text-muted-foreground">
                                Everything you need to know about CSPR Capital
                            </p>
                        </div>

                        <div className="space-y-3">
                            <details className="group rounded-2xl border border-border/50 overflow-hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                                    What is cUSD?
                                    <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                                    cUSD is a decentralized stablecoin pegged to the US Dollar. It&apos;s minted by depositing CSPR as collateral
                                    and can be used for trading, payments, or as a stable store of value on Casper Network.
                                </div>
                            </details>

                            <details className="group rounded-2xl border border-border/50 overflow-hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                                    What is the minimum collateral ratio?
                                    <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                                    The minimum collateral ratio (MCR) is 170%. This means for every $100 of cUSD you want to mint,
                                    you need at least $170 worth of CSPR as collateral. We recommend maintaining a higher ratio
                                    to avoid liquidation during price volatility.
                                </div>
                            </details>

                            <details className="group rounded-2xl border border-border/50 overflow-hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                                    What happens if my vault gets liquidated?
                                    <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                                    If your collateral ratio falls below 150% (liquidation ratio), your vault becomes eligible for liquidation.
                                    A liquidator can repay part of your debt and claim your collateral at a 10% discount.
                                    To avoid this, monitor your vault and add collateral or repay debt when needed.
                                </div>
                            </details>

                            <details className="group rounded-2xl border border-border/50 overflow-hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                                    Are there any fees?
                                    <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                                    CSPR Capital currently has no stability fees or interest rates on minted cUSD.
                                    You only pay standard Casper Network transaction fees for on-chain operations.
                                </div>
                            </details>

                            <details className="group rounded-2xl border border-border/50 overflow-hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                                    How do I get my CSPR back?
                                    <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                                    Simply repay your cUSD debt (fully or partially) and withdraw your collateral.
                                    There are no lock-up periods — you can close your vault anytime by repaying all debt.
                                </div>
                            </details>

                            <details className="group rounded-2xl border border-border/50 overflow-hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                                    Is CSPR Capital audited?
                                    <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                                    The smart contracts are open source and available for review. We recommend users
                                    do their own research and only deposit what they can afford to risk.
                                    DeFi protocols carry inherent smart contract risks.
                                </div>
                            </details>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-t border-border/50 bg-muted/30">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-border/50 p-12 text-center">
                            <h2 className="text-3xl font-medium md:text-4xl mb-4">Ready to get started?</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                                Connect your Casper Wallet and start minting cUSD in minutes.
                                No sign-up required.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {isConnected ? (
                                    <Button asChild size="lg" className="gap-2 px-8">
                                        <Link href="/app">
                                            <span>Launch App</span>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <ConnectWallet size="lg" />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/50">
                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">CSPR Capital</span>
                                <span className="text-muted-foreground text-sm">— Built on Casper Network</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Decentralized stablecoin protocol
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    )
}
