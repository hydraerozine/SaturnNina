<script>
    import { onMount } from 'svelte';
    import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

    let isConnected = false;
    let publicKey = '';
    let balance = 0;
    let connection;
    let provider;

    const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_ENDPOINT;

    onMount(() => {
        connection = new Connection(RPC_ENDPOINT);
        provider = getProvider();
        if (provider) {
            provider.on('connect', handleConnect);
            provider.on('disconnect', handleDisconnect);
            provider.on('accountChanged', handleAccountChanged);
        }
    });

    function getProvider() {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;

            if (provider?.isPhantom) {
                return provider;
            }
        }

        console.log('Phantom wallet is not installed');
        return null;
    }

    async function connectPhantom() {
        if (provider) {
            try {
                const response = await provider.connect();
                handleConnect(response.publicKey);
            } catch (err) {
                console.error("Error connecting to Phantom wallet:", err);
            }
        } else {
            console.log('Phantom wallet is not installed!');
        }
    }

    async function handleConnect(connectedPublicKey) {
        isConnected = true;
        publicKey = connectedPublicKey.toString();
        await fetchBalance();
    }

    function handleDisconnect() {
        isConnected = false;
        publicKey = '';
        balance = 0;
    }

    async function handleAccountChanged(newPublicKey) {
        if (newPublicKey) {
            publicKey = newPublicKey.toString();
            await fetchBalance();
        } else {
            handleDisconnect();
        }
    }

    async function fetchBalance() {
        if (isConnected && publicKey) {
            try {
                const balanceInLamports = await connection.getBalance(new PublicKey(publicKey));
                balance = balanceInLamports / LAMPORTS_PER_SOL;
            } catch (err) {
                console.error("Error fetching SOL balance:", err);
                balance = 0;
            }
        }
    }

    function disconnectWallet() {
        if (provider) {
            provider.disconnect();
        }
    }
</script>

{#if !isConnected}
    <button on:click={connectPhantom}>Connect Phantom Wallet</button>
{:else}
    <p>Connected to Solana: {publicKey}</p>
    <p>SOL Balance: {balance.toFixed(4)} SOL</p>
    <button on:click={disconnectWallet}>Disconnect Phantom</button>
{/if}