'use client'

import Link from 'next/link'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/hero-header'
import { ArrowRight, CreditCard, Code, Zap, Shield, CheckCircle2, Copy } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const features = [
    {
        icon: Zap,
        title: 'Instant Settlement',
        description: 'Payments settle in seconds on Casper Network. No waiting for bank transfers or card processing.',
    },
    {
        icon: Shield,
        title: 'No Chargebacks',
        description: 'Blockchain payments are final. Protect your business from fraudulent chargebacks.',
    },
    {
        icon: CreditCard,
        title: 'Low Fees',
        description: 'Pay only minimal network fees. No percentage cuts, no monthly minimums.',
    },
    {
        icon: Code,
        title: 'Easy Integration',
        description: 'Add the "Pay with cUSD" button to your site with just a few lines of code.',
    },
]

const codeExample = `<!-- Pay with cUSD Button -->
<script src="https://cspr.capital/pay.js"></script>

<button
  data-cusd-amount="100"
  data-cusd-recipient="0203b2c4c53302fba57c122252f357..."
  data-cusd-memo="Order #123"
>
  Pay $100 with cUSD
</button>

<!-- Optional: Handle payment events -->
<script>
  document.querySelector('[data-cusd-amount]')
    .addEventListener('cusd:success', (e) => {
      console.log('Payment sent!', e.detail.transactionHash);
      console.log('View on explorer:', e.detail.explorerUrl);
    });
</script>`

// Demo recipient - a sample mainnet public key for testing
// In production, merchants would use their own public key
const DEMO_RECIPIENT = '0203b2c4c53302fba57c122252f357279a2f735039ba1cdce09a636ef71e5b2913f2'

export default function PaymentsPage() {
    const [copied, setCopied] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const demoButtonRef = useRef<HTMLButtonElement>(null)

    const copyCode = () => {
        navigator.clipboard.writeText(codeExample)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Re-initialize pay.js after script loads
    useEffect(() => {
        if (scriptLoaded && typeof window !== 'undefined' && (window as any).CUSDPay) {
            (window as any).CUSDPay.init()
        }
    }, [scriptLoaded])

    return (
        <>
            <Script
                src="/pay.js"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
            />
            <HeroHeader />
            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-6xl px-6">
                    {/* Hero */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Link href="/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link>
                            <span>/</span>
                            <span>Payments</span>
                        </div>
                        <h1 className="text-4xl font-medium md:text-5xl">Pay with cUSD</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Accept stable cryptocurrency payments on your website or app.
                            Simple integration, instant settlement, minimal fees.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="gap-2">
                                Get Started
                                <ArrowRight className="size-4" />
                            </Button>
                            <Button variant="outline" size="lg">
                                View Documentation
                            </Button>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <div key={feature.title} className="rounded-2xl border border-border/50 p-6">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                                        <Icon className="size-6 text-primary" />
                                    </div>
                                    <h3 className="font-medium mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* How it works */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-medium text-center mb-12">How It Works</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mx-auto mb-4">
                                    1
                                </div>
                                <h3 className="font-medium mb-2">Add the Widget</h3>
                                <p className="text-sm text-muted-foreground">
                                    Copy our code snippet and add it to your website. Customize the amount and recipient.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mx-auto mb-4">
                                    2
                                </div>
                                <h3 className="font-medium mb-2">Customer Pays</h3>
                                <p className="text-sm text-muted-foreground">
                                    Customer clicks the button, connects their Casper wallet, and confirms the payment.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mx-auto mb-4">
                                    3
                                </div>
                                <h3 className="font-medium mb-2">Receive cUSD</h3>
                                <p className="text-sm text-muted-foreground">
                                    cUSD is transferred directly to your wallet. Instant, final, and yours to use.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Code Example */}
                    <div className="rounded-2xl border border-border/50 bg-muted/30 p-8 mb-16">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-medium">Quick Integration</h2>
                            <Button variant="ghost" size="sm" onClick={copyCode} className="gap-2">
                                {copied ? <CheckCircle2 className="size-4 text-green-500" /> : <Copy className="size-4" />}
                                {copied ? 'Copied!' : 'Copy Code'}
                            </Button>
                        </div>
                        <pre className="bg-background rounded-xl p-4 overflow-x-auto text-sm">
                            <code className="text-muted-foreground">{codeExample}</code>
                        </pre>
                    </div>

                    {/* Demo */}
                    <div className="rounded-2xl border border-border/50 p-8 text-center mb-16">
                        <h2 className="text-xl font-medium mb-4">Try It Out</h2>
                        <p className="text-muted-foreground mb-6">
                            Click below to test the payment flow. This connects to Casper mainnet.
                        </p>
                        <button
                            ref={demoButtonRef}
                            data-cusd-amount="1"
                            data-cusd-recipient={DEMO_RECIPIENT}
                            data-cusd-memo="Demo Payment"
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <CreditCard className="size-5" />
                            Pay $1.00 with cUSD
                        </button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Mainnet — requires Casper Wallet and cUSD balance
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-border/50 p-8 md:p-12 text-center">
                        <h2 className="text-2xl font-medium mb-4">Ready to accept cUSD payments?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                            Start accepting stable cryptocurrency payments today. No sign-up required,
                            no monthly fees, just add the code and go.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="gap-2">
                                Read the Docs
                                <ArrowRight className="size-4" />
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/app">
                                    Get cUSD First
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
