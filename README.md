# CSPR Capital - Frontend

Web application for the CSPR Capital stablecoin protocol on Casper Network.

## Features

- **Vault Management** - Deposit CSPR, mint/repay cUSD, withdraw collateral
- **Dashboard** - System stats, price feed, recent activity
- **Liquidations** - Browse and liquidate undercollateralized vaults
- **Wallet Integration** - Casper Wallet support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand
- **Blockchain**: casper-js-sdk

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with contract addresses

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
NEXT_PUBLIC_VAULT_MANAGER_HASH=...
NEXT_PUBLIC_CUSD_TOKEN_HASH=...
NEXT_PUBLIC_ORACLE_FEED_HASH=...
NEXT_PUBLIC_LIQUIDATION_MODULE_HASH=...
NEXT_PUBLIC_GOVERNANCE_HASH=...
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── lib/casper/       # Blockchain interactions
│   ├── providers/        # Context providers
│   └── store/            # Zustand store
├── public/               # Static assets
└── package.json
```

## Build

```bash
npm run build
npm start
```

## License

MIT
