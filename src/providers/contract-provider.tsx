'use client'

import { useEffect, useState } from 'react'
import { setContractAddresses } from '@/lib/casper/contracts'

export function ContractProvider({ children }: { children: React.ReactNode }) {
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        // Use contract hashes (not package hashes) for calling entry points
        const governance = process.env.NEXT_PUBLIC_GOVERNANCE_HASH
        const cusdToken = process.env.NEXT_PUBLIC_CUSD_TOKEN_HASH
        const oracleFeed = process.env.NEXT_PUBLIC_ORACLE_FEED_HASH
        const vaultManager = process.env.NEXT_PUBLIC_VAULT_MANAGER_HASH
        const liquidationModule = process.env.NEXT_PUBLIC_LIQUIDATION_MODULE_HASH

        // Package hashes are needed for payable calls via proxy_caller.wasm
        const vaultManagerPackage = process.env.NEXT_PUBLIC_VAULT_MANAGER_CONTRACT
        const cusdTokenPackage = process.env.NEXT_PUBLIC_CUSD_TOKEN_CONTRACT
        const oracleFeedPackage = process.env.NEXT_PUBLIC_ORACLE_FEED_CONTRACT
        const liquidationModulePackage = process.env.NEXT_PUBLIC_LIQUIDATION_MODULE_CONTRACT
        const governancePackage = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT

        if (governance && cusdToken && oracleFeed && vaultManager && liquidationModule) {
            setContractAddresses({
                governance,
                cusdToken,
                oracleFeed,
                vaultManager,
                liquidationModule,
                // Package hashes for payable calls
                vaultManagerPackage,
                cusdTokenPackage,
                oracleFeedPackage,
                liquidationModulePackage,
                governancePackage,
            })
        }
        setInitialized(true)
    }, [])

    if (!initialized) {
        return null
    }

    return <>{children}</>
}
