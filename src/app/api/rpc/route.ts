import { NextRequest, NextResponse } from 'next/server'

const CASPER_NODE_URL = process.env.NEXT_PUBLIC_CASPER_NODE_URL || 'https://node.mainnet.casper.network/rpc'

// CORS headers for external embeds (pay.js widget)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

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
        return NextResponse.json(data, { headers: corsHeaders })
    } catch (error) {
        console.error('RPC proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to proxy RPC request' },
            { status: 500, headers: corsHeaders }
        )
    }
}
