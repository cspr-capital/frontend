'use client'

import { SystemStats } from '@/components/dashboard/system-stats'
import { PriceFeed } from '@/components/dashboard/price-feed'
import { ProtocolParams } from '@/components/dashboard/protocol-params'
import { RecentActivity } from '@/components/dashboard/recent-activity'

// Mock data for development
const mockSystemStats = {
    totalSupply: '1,250,000',
    totalCollateral: '15,000,000',
    totalVaults: 342,
}

const mockPriceData = {
    price: '0.0234',
    lastUpdate: '2 minutes ago',
    isFresh: true,
}

const mockProtocolParams = {
    minCollateralRatio: '170%',
    liquidationRatio: '150%',
    liquidationBonus: '10%',
    stabilityFee: '0.5%',
}

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-medium">Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                    Protocol overview and statistics
                </p>
            </div>

            <SystemStats data={mockSystemStats} />

            <div className="grid gap-4 md:grid-cols-2">
                <PriceFeed data={mockPriceData} />
                <ProtocolParams data={mockProtocolParams} />
            </div>

            <RecentActivity />
        </div>
    )
}
