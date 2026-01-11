import { NextRequest, NextResponse } from 'next/server'

const CASPER_NODE_URL = process.env.NEXT_PUBLIC_CASPER_NODE_URL || 'https://node.mainnet.casper.network/rpc'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const response = await fetch(CASPER_NODE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('RPC proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to proxy RPC request' },
            { status: 500 }
        )
    }
}
