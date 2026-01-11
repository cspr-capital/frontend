'use client'

import { QueryProvider } from './query-provider'
import { ContractProvider } from './contract-provider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <ContractProvider>
                {children}
            </ContractProvider>
        </QueryProvider>
    )
}
