# CSPR Capital - Frontend

Web application for the CSPR Capital stablecoin protocol on Casper Network.

## Features

- **Vault Management** - Deposit CSPR, mint/repay cUSD, withdraw collateral
- **Dashboard** - Real-time system stats, price feed, vault health monitoring
- **Liquidations** - Browse and liquidate undercollateralized vaults
- **Wallet Integration** - Casper Wallet support
- **Pay with cUSD** - Embeddable payment widget for merchants

## Tech Stack

- **Framework**: Next.js (App Router)
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

Create `.env.local` with the following:

```bash
# Network
NEXT_PUBLIC_CASPER_NODE_URL=https://node.mainnet.casper.network/rpc
NEXT_PUBLIC_CASPER_NETWORK=casper

# Contract Package Hashes (used for payable calls via proxy_caller.wasm)
NEXT_PUBLIC_GOVERNANCE_CONTRACT=...
NEXT_PUBLIC_CUSD_TOKEN_CONTRACT=...
NEXT_PUBLIC_ORACLE_FEED_CONTRACT=...
NEXT_PUBLIC_VAULT_MANAGER_CONTRACT=...
NEXT_PUBLIC_LIQUIDATION_MODULE_CONTRACT=...

# Contract Hashes (used for calling entry points directly)
NEXT_PUBLIC_GOVERNANCE_HASH=...
NEXT_PUBLIC_CUSD_TOKEN_HASH=...
NEXT_PUBLIC_ORACLE_FEED_HASH=...
NEXT_PUBLIC_VAULT_MANAGER_HASH=...
NEXT_PUBLIC_LIQUIDATION_MODULE_HASH=...

# State URefs (used for reading contract state via dictionary queries)
NEXT_PUBLIC_VAULT_MANAGER_STATE_UREF=...
NEXT_PUBLIC_LIQUIDATION_MODULE_STATE_UREF=...
NEXT_PUBLIC_ORACLE_FEED_STATE_UREF=...
NEXT_PUBLIC_GOVERNANCE_STATE_UREF=...
```

### Package Hash vs Contract Hash

- **Package Hash**: Identifies the upgradeable contract package. Used when calling payable entry points via `proxy_caller.wasm` because the caller is identified by package hash.
- **Contract Hash**: Identifies the specific contract instance. Used for direct entry point calls and reading contract state.

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
├── public/
│   └── pay.js            # Embeddable payment widget
└── package.json
```

## Pay with cUSD Widget

The `pay.js` widget allows any website to accept cUSD payments with minimal integration.

### Basic Usage

```html
<script src="https://cspr.capital/pay.js"></script>

<button
  data-cusd-amount="100"
  data-cusd-recipient="0203..."
  data-cusd-memo="Order #123"
>
  Pay $100 with cUSD
</button>
```

### Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-cusd-amount` | Yes | Amount in cUSD (e.g., "100" for $100) |
| `data-cusd-recipient` | Yes | Recipient's Casper public key |
| `data-cusd-memo` | No | Optional memo/description |
| `data-cusd-theme` | No | Set to "dark" for dark mode |

### Events

```javascript
document.querySelector('[data-cusd-amount]')
  .addEventListener('cusd:success', (e) => {
    console.log('Transaction hash:', e.detail.transactionHash);
    console.log('Explorer URL:', e.detail.explorerUrl);
  });

document.querySelector('[data-cusd-amount]')
  .addEventListener('cusd:error', (e) => {
    console.log('Error:', e.detail.message);
  });
```

### Programmatic API

```javascript
// Initialize buttons manually
window.CUSDPay.init();

// Trigger payment on a button
window.CUSDPay.pay(buttonElement);

// Send payment directly
window.CUSDPay.sendPayment(recipientPublicKey, amount);
```

## Build

```bash
npm run build
npm start
```

## License

MIT
