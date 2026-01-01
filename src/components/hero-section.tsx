'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { HeroHeader } from './hero-header'
import { ConnectWallet } from '@/components/connect-wallet'
import { useWallet } from '@/hooks/use-wallet'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
    const { isConnected } = useWallet()

    return (
        <>
            <HeroHeader />
            <main className="overflow-x-hidden">
                <section>
                    <div className="pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
                        <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
                            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                                    Mint <span className="text-primary">cUSD</span> against your <span className="text-primary">CSPR</span>
                                </h1>
                                <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                                    The first overcollateralized stablecoin protocol on Casper Network.
                                    Deposit CSPR, mint cUSD, and unlock DeFi without selling your assets.
                                </p>

                                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                                    {isConnected ? (
                                        <Button asChild size="lg" className="gap-2 px-5">
                                            <Link href="/app">
                                                <span className="text-nowrap">Open dApp</span>
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <ConnectWallet size="lg" />
                                    )}
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="px-5 text-base">
                                        <Link href="#how-it-works">
                                            <span className="text-nowrap">Learn More</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <Image
                                className="-z-10 order-first ml-auto h-56 w-full object-cover invert sm:h-96 lg:absolute lg:inset-0 lg:-right-20 lg:-top-96 lg:order-last lg:h-max lg:w-2/3 lg:object-contain dark:invert-0 dark:mix-blend-lighten"
                                src="/abstract-bg.webp"
                                alt="Abstract Background"
                                height="4000"
                                width="3000"
                            />
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
