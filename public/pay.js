/**
 * CSPR Capital - Pay with cUSD Widget
 * https://cspr.capital
 *
 * Usage:
 * <script src="https://cspr.capital/pay.js"></script>
 * <button
 *   data-cusd-amount="100"
 *   data-cusd-recipient="0203..."
 *   data-cusd-memo="Order #123"
 *   class="cusd-pay-button"
 * >Pay with cUSD</button>
 */

(function() {
    'use strict';

    // Detect script origin for API proxy URL
    function getProxyUrl() {
        // Find the script tag that loaded this file
        const scripts = document.querySelectorAll('script[src*="pay.js"]');
        for (const script of scripts) {
            const src = script.src;
            if (src) {
                try {
                    const url = new URL(src);
                    // Use the same origin as the script for the API proxy
                    return url.origin + '/api/rpc';
                } catch (e) {
                    // Relative URL, use current origin
                }
            }
        }
        // Fallback: if loaded locally, use relative path
        return '/api/rpc';
    }

    // Configuration - Mainnet
    const CONFIG = {
        CUSD_CONTRACT_HASH: '74017e7ae951befc0b6fde7a79086e65d85c33fd5c71a2a8e7448b94a718767f',
        NETWORK_NAME: 'casper',
        get NODE_URL() { return getProxyUrl(); }, // Use proxy to avoid CORS
        DECIMALS: 18,
        PAYMENT_AMOUNT: 3_000_000_000, // 3 CSPR for gas
        TTL_MS: 1800000, // 30 minutes
        SDK_URL: 'https://esm.sh/casper-js-sdk@5.0.7'
    };

    let sdk = null;

    // Styles for the modal
    const styles = `
        .cusd-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .cusd-modal {
            background: #ffffff;
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: cusd-modal-enter 0.2s ease-out;
        }
        @keyframes cusd-modal-enter {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .cusd-modal-dark {
            background: #1a1a1a;
            color: #ffffff;
        }
        .cusd-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .cusd-modal-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }
        .cusd-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            line-height: 1;
        }
        .cusd-modal-close:hover {
            color: #333;
        }
        .cusd-modal-dark .cusd-modal-close {
            color: #999;
        }
        .cusd-modal-dark .cusd-modal-close:hover {
            color: #fff;
        }
        .cusd-amount-display {
            text-align: center;
            padding: 24px 0;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
        }
        .cusd-modal-dark .cusd-amount-display {
            border-color: #333;
        }
        .cusd-amount-value {
            font-size: 36px;
            font-weight: 700;
            color: #e74c3c;
        }
        .cusd-amount-label {
            font-size: 14px;
            color: #666;
            margin-top: 4px;
        }
        .cusd-modal-dark .cusd-amount-label {
            color: #999;
        }
        .cusd-memo {
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-bottom: 20px;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 8px;
        }
        .cusd-modal-dark .cusd-memo {
            background: #2a2a2a;
            color: #999;
        }
        .cusd-pay-btn {
            width: 100%;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            background: #e74c3c;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }
        .cusd-pay-btn:hover {
            background: #c0392b;
        }
        .cusd-pay-btn:active {
            transform: scale(0.98);
        }
        .cusd-pay-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .cusd-status {
            text-align: center;
            padding: 20px;
        }
        .cusd-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #eee;
            border-top-color: #e74c3c;
            border-radius: 50%;
            animation: cusd-spin 0.8s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes cusd-spin {
            to { transform: rotate(360deg); }
        }
        .cusd-status-text {
            font-size: 14px;
            color: #666;
        }
        .cusd-modal-dark .cusd-status-text {
            color: #999;
        }
        .cusd-success {
            color: #27ae60;
        }
        .cusd-error {
            color: #e74c3c;
        }
        .cusd-success-icon {
            width: 60px;
            height: 60px;
            background: #27ae60;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
        }
        .cusd-success-icon svg {
            width: 30px;
            height: 30px;
            stroke: white;
            stroke-width: 3;
        }
        .cusd-tx-link {
            display: block;
            margin-top: 12px;
            font-size: 13px;
            color: #e74c3c;
            text-decoration: none;
        }
        .cusd-tx-link:hover {
            text-decoration: underline;
        }
        .cusd-powered {
            text-align: center;
            margin-top: 16px;
            font-size: 12px;
            color: #999;
        }
        .cusd-powered a {
            color: #e74c3c;
            text-decoration: none;
        }
        .cusd-powered a:hover {
            text-decoration: underline;
        }
    `;

    // Inject styles
    function injectStyles() {
        if (document.getElementById('cusd-pay-styles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'cusd-pay-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    // Load casper-js-sdk dynamically
    async function loadSDK() {
        if (sdk) return sdk;

        try {
            const module = await import(CONFIG.SDK_URL);
            console.log('[CUSDPay] SDK module loaded:', Object.keys(module));

            // ESM module might have default export or direct exports
            sdk = module.default || module;

            // Log available exports for debugging
            console.log('[CUSDPay] SDK exports:', Object.keys(sdk));
            console.log('[CUSDPay] PublicKey:', sdk.PublicKey);
            console.log('[CUSDPay] ContractCallBuilder:', sdk.ContractCallBuilder);

            if (!sdk.PublicKey) {
                throw new Error('SDK loaded but PublicKey not found');
            }

            return sdk;
        } catch (error) {
            console.error('[CUSDPay] Failed to load SDK:', error);
            throw new Error('Failed to load Casper SDK: ' + error.message);
        }
    }

    // Create modal HTML
    function createModal(amount, memo, isDark) {
        const overlay = document.createElement('div');
        overlay.className = 'cusd-modal-overlay';
        overlay.innerHTML = `
            <div class="cusd-modal ${isDark ? 'cusd-modal-dark' : ''}">
                <div class="cusd-modal-header">
                    <h3 class="cusd-modal-title">Pay with cUSD</h3>
                    <button class="cusd-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="cusd-modal-content">
                    <div class="cusd-amount-display">
                        <div class="cusd-amount-value">$${escapeHtml(amount)}</div>
                        <div class="cusd-amount-label">cUSD</div>
                    </div>
                    ${memo ? `<div class="cusd-memo">${escapeHtml(memo)}</div>` : ''}
                    <button class="cusd-pay-btn">Connect Wallet & Pay</button>
                </div>
                <div class="cusd-powered">
                    Powered by <a href="https://cspr.capital" target="_blank">CSPR Capital</a>
                </div>
            </div>
        `;
        return overlay;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convert amount to wei (18 decimals)
    function toWei(amount) {
        const [whole, fraction = ''] = amount.toString().split('.');
        const paddedFraction = fraction.padEnd(CONFIG.DECIMALS, '0').slice(0, CONFIG.DECIMALS);
        return BigInt(whole + paddedFraction);
    }

    // Check if Casper Wallet is available
    function isCasperWalletAvailable() {
        return typeof window.CasperWalletProvider !== 'undefined';
    }

    // Get wallet provider
    function getWalletProvider() {
        if (typeof window.CasperWalletProvider !== 'undefined') {
            return window.CasperWalletProvider();
        }
        return null;
    }

    // Connect wallet and get public key
    async function connectWallet() {
        const provider = getWalletProvider();
        if (!provider) {
            throw new Error('Casper Wallet not found. Please install it from casper.network');
        }

        const connected = await provider.requestConnection();
        if (!connected) {
            throw new Error('Wallet connection rejected');
        }

        const publicKeyHex = await provider.getActivePublicKey();
        return publicKeyHex;
    }

    // Build CEP-18 transfer transaction using casper-js-sdk
    async function buildTransferTransaction(senderPublicKeyHex, recipientPublicKeyHex, amount) {
        const sdkModule = await loadSDK();

        // Destructure with fallbacks for different module structures
        const ContractCallBuilder = sdkModule.ContractCallBuilder;
        const PublicKey = sdkModule.PublicKey;
        const Args = sdkModule.Args;
        const CLValue = sdkModule.CLValue;
        const Key = sdkModule.Key;

        console.log('[CUSDPay] Building transaction with:', {
            ContractCallBuilder: !!ContractCallBuilder,
            PublicKey: !!PublicKey,
            Args: !!Args,
            CLValue: !!CLValue,
            Key: !!Key
        });

        if (!PublicKey || !ContractCallBuilder || !Args || !CLValue || !Key) {
            throw new Error('SDK components not available. PublicKey=' + !!PublicKey +
                ', ContractCallBuilder=' + !!ContractCallBuilder +
                ', Args=' + !!Args + ', CLValue=' + !!CLValue + ', Key=' + !!Key);
        }

        const senderPubKey = PublicKey.fromHex(senderPublicKeyHex);
        const recipientPubKey = PublicKey.fromHex(recipientPublicKeyHex);

        // Get recipient's account hash for the CEP-18 transfer
        const recipientAccountHash = recipientPubKey.accountHash();

        // Build transfer args
        const args = Args.fromMap({});
        args.insert(
            'recipient',
            CLValue.newCLKey(
                Key.newKey(recipientAccountHash.toPrefixedString())
            )
        );
        args.insert('amount', CLValue.newCLUInt256(toWei(amount).toString()));

        // Build the transaction
        const transaction = new ContractCallBuilder()
            .from(senderPubKey)
            .byHash(CONFIG.CUSD_CONTRACT_HASH)
            .entryPoint('transfer')
            .runtimeArgs(args)
            .chainName(CONFIG.NETWORK_NAME)
            .payment(CONFIG.PAYMENT_AMOUNT)
            .ttl(CONFIG.TTL_MS)
            .build();

        return transaction;
    }

    // Sign and submit transaction
    async function signAndSubmitTransaction(transaction, publicKeyHex) {
        const sdkModule = await loadSDK();
        const PublicKey = sdkModule.PublicKey;
        const provider = getWalletProvider();

        // Convert transaction to JSON for wallet signing
        const txJson = JSON.stringify(transaction.toJSON());
        console.log('[CUSDPay] Transaction JSON:', transaction.toJSON());

        // Sign with wallet
        const signResult = await provider.sign(txJson, publicKeyHex);
        console.log('[CUSDPay] Sign result:', signResult);

        if (signResult.cancelled) {
            throw new Error('Transaction was cancelled by user');
        }

        if (!signResult.signature) {
            throw new Error('No signature returned from wallet');
        }

        // Add signature to transaction
        const pubKey = PublicKey.fromHex(publicKeyHex);

        // The signature needs the algorithm tag prefix
        // Ed25519 = 0x01, Secp256K1 = 0x02
        const tag = publicKeyHex.startsWith('01') ? 0x01 : 0x02;
        const signatureBytes = signResult.signature;
        const taggedSignature = new Uint8Array(signatureBytes.length + 1);
        taggedSignature[0] = tag;
        taggedSignature.set(signatureBytes, 1);

        transaction.setSignature(taggedSignature, pubKey);

        // Submit to network using fetch (to use our CORS proxy)
        const proxyUrl = CONFIG.NODE_URL;
        console.log('[CUSDPay] Submitting transaction to:', proxyUrl);

        // Get the properly formatted transaction for RPC
        const signedTxJson = transaction.toJSON();
        console.log('[CUSDPay] Signed transaction toJSON:', JSON.stringify(signedTxJson, null, 2));
        console.log('[CUSDPay] Top-level keys:', Object.keys(signedTxJson));

        // Wrap as Version1 transaction (Casper mainnet format)
        const rpcRequest = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'account_put_transaction',
            params: {
                transaction: {
                    Version1: signedTxJson
                }
            }
        };

        console.log('[CUSDPay] RPC request:', JSON.stringify(rpcRequest, null, 2));

        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcRequest)
        });

        if (!response.ok) {
            throw new Error('Failed to submit transaction: ' + response.statusText);
        }

        const result = await response.json();
        console.log('[CUSDPay] Submit result:', result);

        if (result.error) {
            throw new Error('RPC error: ' + (result.error.message || JSON.stringify(result.error)));
        }

        // Extract transaction hash (may be wrapped as { Version1: "hash" })
        let txHash = result.result?.transaction_hash;
        if (txHash && typeof txHash === 'object') {
            txHash = txHash.Version1 || txHash.Deploy || Object.values(txHash)[0];
        }
        txHash = txHash?.toString() || (transaction.hash ? transaction.hash.toString() : null);

        if (!txHash) {
            throw new Error('No transaction hash returned');
        }

        return {
            transactionHash: txHash,
            explorerUrl: `https://cspr.live/deploy/${txHash}`
        };
    }

    // Main payment flow
    async function sendPayment(recipientPublicKey, amount) {
        // Connect wallet
        const senderPublicKey = await connectWallet();
        console.log('[CUSDPay] Connected wallet:', senderPublicKey);

        // Build transaction
        const transaction = await buildTransferTransaction(
            senderPublicKey,
            recipientPublicKey,
            amount
        );
        console.log('[CUSDPay] Built transaction');

        // Sign and submit
        const result = await signAndSubmitTransaction(transaction, senderPublicKey);
        console.log('[CUSDPay] Payment complete:', result);

        return result;
    }

    // Initiate payment modal
    async function initiatePayment(button) {
        const amount = button.dataset.cusdAmount;
        const recipient = button.dataset.cusdRecipient;
        const memo = button.dataset.cusdMemo || button.dataset.cusdDescription || '';
        const isDark = button.dataset.cusdTheme === 'dark';
        const onSuccess = button.dataset.cusdOnSuccess;
        const onError = button.dataset.cusdOnError;

        if (!amount || !recipient) {
            console.error('[CUSDPay] Missing required data attributes (data-cusd-amount, data-cusd-recipient)');
            return;
        }

        injectStyles();

        const modal = createModal(amount, memo, isDark);
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.cusd-modal-close');
        const payBtn = modal.querySelector('.cusd-pay-btn');
        const content = modal.querySelector('.cusd-modal-content');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Escape key closes modal
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        payBtn.addEventListener('click', async () => {
            // Check wallet availability
            if (!isCasperWalletAvailable()) {
                content.innerHTML = `
                    <div class="cusd-status">
                        <p class="cusd-status-text cusd-error">
                            Casper Wallet not found.<br>
                            Please install it from <a href="https://www.casperwallet.io/" target="_blank" style="color: #e74c3c;">casperwallet.io</a>
                        </p>
                    </div>
                `;
                return;
            }

            // Show loading - SDK
            content.innerHTML = `
                <div class="cusd-status">
                    <div class="cusd-spinner"></div>
                    <p class="cusd-status-text">Loading...</p>
                </div>
            `;

            try {
                // Pre-load SDK
                await loadSDK();

                // Show loading - wallet
                content.innerHTML = `
                    <div class="cusd-status">
                        <div class="cusd-spinner"></div>
                        <p class="cusd-status-text">Connecting wallet...</p>
                    </div>
                `;

                // Connect and build
                const senderPublicKey = await connectWallet();

                content.innerHTML = `
                    <div class="cusd-status">
                        <div class="cusd-spinner"></div>
                        <p class="cusd-status-text">Building transaction...</p>
                    </div>
                `;

                const transaction = await buildTransferTransaction(
                    senderPublicKey,
                    recipient,
                    amount
                );

                content.innerHTML = `
                    <div class="cusd-status">
                        <div class="cusd-spinner"></div>
                        <p class="cusd-status-text">Please confirm in your wallet...</p>
                    </div>
                `;

                const result = await signAndSubmitTransaction(transaction, senderPublicKey);

                // Success
                content.innerHTML = `
                    <div class="cusd-status">
                        <div class="cusd-success-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <p class="cusd-status-text cusd-success">Payment sent successfully!</p>
                        <a href="${result.explorerUrl}" target="_blank" class="cusd-tx-link">View on Explorer &rarr;</a>
                    </div>
                `;

                // Callback
                if (onSuccess && typeof window[onSuccess] === 'function') {
                    window[onSuccess](result);
                }

                // Dispatch custom event
                button.dispatchEvent(new CustomEvent('cusd:success', {
                    detail: result,
                    bubbles: true
                }));

            } catch (error) {
                console.error('[CUSDPay] Error:', error);

                content.innerHTML = `
                    <div class="cusd-status">
                        <p class="cusd-status-text cusd-error">${escapeHtml(error.message)}</p>
                        <button class="cusd-pay-btn" style="margin-top: 16px;">Try Again</button>
                    </div>
                `;

                // Re-attach try again handler
                content.querySelector('.cusd-pay-btn').addEventListener('click', () => {
                    closeModal();
                    initiatePayment(button);
                });

                // Callback
                if (onError && typeof window[onError] === 'function') {
                    window[onError](error);
                }

                // Dispatch custom event
                button.dispatchEvent(new CustomEvent('cusd:error', {
                    detail: { message: error.message, error },
                    bubbles: true
                }));
            }
        });
    }

    // Initialize buttons
    function init() {
        const buttons = document.querySelectorAll('[data-cusd-amount][data-cusd-recipient]');

        buttons.forEach(button => {
            if (button.dataset.cusdInitialized) return;
            button.dataset.cusdInitialized = 'true';

            button.addEventListener('click', (e) => {
                e.preventDefault();
                initiatePayment(button);
            });
        });
    }

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize on dynamic content (for SPAs)
    const observer = new MutationObserver(() => {
        init();
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Expose API for manual control
    window.CUSDPay = {
        init,
        pay: initiatePayment,
        sendPayment,
        loadSDK,
        config: CONFIG,
        version: '1.1.0'
    };

    console.log('[CUSDPay] Widget loaded v1.1.0');

})();
