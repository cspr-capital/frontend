'use client'

import { cn } from '@/lib/utils'

interface HealthGaugeProps {
    ratio: number
    liquidationRatio?: number
    minRatio?: number
}

function getHealthStatus(ratio: number, liquidationRatio: number, minRatio: number) {
    if (ratio < liquidationRatio) return { color: 'from-red-500 to-red-600', bg: 'bg-red-500', label: 'Liquidatable', textColor: 'text-red-500' }
    if (ratio < minRatio) return { color: 'from-orange-500 to-orange-600', bg: 'bg-orange-500', label: 'At Risk', textColor: 'text-orange-500' }
    if (ratio < minRatio + 30) return { color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-500', label: 'Caution', textColor: 'text-yellow-500' }
    return { color: 'from-green-500 to-green-600', bg: 'bg-green-500', label: 'Healthy', textColor: 'text-green-500' }
}

export function HealthGauge({ ratio, liquidationRatio = 150, minRatio = 170 }: HealthGaugeProps) {
    const status = getHealthStatus(ratio, liquidationRatio, minRatio)
    const maxDisplay = 300
    const progress = Math.min((ratio / maxDisplay) * 100, 100)
    const liqLine = (liquidationRatio / maxDisplay) * 100
    const minLine = (minRatio / maxDisplay) * 100

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Collateral Ratio</p>
                    <p className={cn('text-4xl font-bold', status.textColor)}>{ratio.toFixed(0)}%</p>
                </div>
                <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    status.textColor,
                    status.bg + '/10'
                )}>
                    <span className={cn('size-1.5 rounded-full', status.bg)} />
                    {status.label}
                </span>
            </div>

            <div className="relative">
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', status.color)}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {/* Liquidation marker */}
                <div
                    className="absolute top-0 h-3 w-0.5 bg-red-500/50"
                    style={{ left: `${liqLine}%` }}
                />
                {/* Min ratio marker */}
                <div
                    className="absolute top-0 h-3 w-0.5 bg-muted-foreground/30"
                    style={{ left: `${minLine}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Liq. {liquidationRatio}%</span>
                <span>Min {minRatio}%</span>
                <span>Safe 200%+</span>
            </div>
        </div>
    )
}
