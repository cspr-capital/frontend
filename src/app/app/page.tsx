'use client'

import { useEffect } from 'react'
import { SystemStats } from '@/components/dashboard/system-stats'
import { PriceFeed } from '@/components/dashboard/price-feed'
import { ProtocolParams } from '@/components/dashboard/protocol-params'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { useSystemStats } from '@/hooks/use-system-stats'
import { useOracle } from '@/hooks/use-oracle'
import { useEvents } from '@/hooks/use-events'

export default function DashboardPage() {
    const {
        formattedTotalSupply,
        formattedTotalCollateral,
        vaultCount,
        formattedMcr,
        formattedLr,
        formattedBonus,
        isLoading: statsLoading,
        refetchAll: refetchStats
    } = useSystemStats()

    const {
        priceUsd,
        lastUpdated,
        isFresh,
        isLoading: priceLoading,
        refetch: refetchOracle
    } = useOracle()

    const {
        mints,
        liquidations,
        isLoading: eventsLoading,
        refetch: refetchEvents
    } = useEvents()

    // Refetch data when page becomes active
    useEffect(() => {
        refetchStats?.()
        refetchOracle?.()
        refetchEvents?.()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const systemStatsData = {
        totalSupply: formattedTotalSupply,
        totalCollateral: formattedTotalCollateral,
        totalVaults: vaultCount,
    }

    const priceData = {
        price: priceUsd?.toFixed(6) ?? '0.00',
        lastUpdate: lastUpdated ? formatTimeAgo(lastUpdated) : '—',
        isFresh,
    }

    const protocolParamsData = {
        minCollateralRatio: formattedMcr,
        liquidationRatio: formattedLr,
        liquidationBonus: formattedBonus,
        stabilityFee: '0%', // No stability fee in this protocol
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-medium">Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                    Protocol overview and statistics
                </p>
            </div>

            <SystemStats data={systemStatsData} isLoading={statsLoading} />

            <div className="grid gap-4 md:grid-cols-2">
                <PriceFeed data={priceData} isLoading={priceLoading} />
                <ProtocolParams data={protocolParamsData} isLoading={statsLoading} />
            </div>

            <RecentActivity
                mints={mints}
                liquidations={liquidations}
                isLoading={eventsLoading}
            />
        </div>
    )
}

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
}
