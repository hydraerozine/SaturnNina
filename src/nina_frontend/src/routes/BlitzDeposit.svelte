<script>
    import { onMount } from 'svelte';
    import { PhantasmaLink, PhantasmaAPI, ScriptBuilder, Transaction, Address, Base16 } from 'phantasma-ts';
    import BigNumber from 'bignumber.js';

    let depositAmount = '';
    let blitzBalance = 0;
    let isConnected = false;
    let currentAccount = '';
    let provider;
    let RPC;

    const NexusName = 'mainnet';
    const ChainName = 'main';
    const contractName = 'BLITZ';

    onMount(() => {
        provider = new PhantasmaLink('BLITZ Deposit');
        RPC = new PhantasmaAPI('https://pharpc1.phantasma.info/rpc');
    });

    async function connectPhantasma() {
        try {
            await provider.login(
                (success) => {
                    if (success) {
                        isConnected = true;
                        currentAccount = provider.account.address;
                        fetchBlitzBalance();
                    }
                },
                (error) => {
                    console.error("Error connecting to Phantasma:", error);
                }
            );
        } catch (error) {
            console.error("Error connecting to Phantasma:", error);
        }
    }

    async function fetchBlitzBalance() {
        if (!isConnected) return;

        try {
            let sb = new ScriptBuilder();
            sb.CallContract(contractName, 'getKcalDeposit', [currentAccount]);
            const script = sb.EndScript();
            const response = await RPC.invokeRawScript(ChainName, script);
            blitzBalance = parseInt(response.result) / 1e10; // Assuming KCAL has 10 decimals
        } catch (error) {
            console.error("Error fetching BLITZ balance:", error);
        }
    }

    async function depositKCAL() {
        if (!isConnected || !depositAmount) return;

        console.log("Deposit amount: ", depositAmount);

        const amountInDecimals = new BigNumber(depositAmount).shiftedBy(10).toFixed(); // 10 decimals for KCAL

        let sb = new ScriptBuilder();
        sb.AllowGas(currentAccount, Address.Null, 1000000, 9999);
        sb.CallContract(contractName, "depositKcal", [currentAccount, 'KCAL', amountInDecimals]);
        sb.SpendGas(currentAccount);
        const script = sb.EndScript();

        const expiration = new Date(Date.now() + 3600000); // 1 hour from now
        const tx = new Transaction(NexusName, ChainName, script, expiration);

        try {
            const signedTx = await provider.signTx(NexusName, ChainName, script, 'BLITZ Deposit');
            const rawTx = Base16.encodeUint8Array(signedTx.ToByteAray(true));
            const txHash = await RPC.sendRawTransaction(rawTx);
            console.log("Deposit transaction sent:", txHash);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
            await fetchBlitzBalance(); // Refresh balance
        } catch (error) {
            console.error("Error during deposit:", error);
        }
    }

    function disconnectWallet() {
        isConnected = false;
        currentAccount = '';
        blitzBalance = 0;
        depositAmount = '';
        if (provider) {
            provider.disconnect();
        }
    }
</script>

<div>
    {#if !isConnected}
        <button on:click={connectPhantasma}>Connect Phantasma Wallet</button>
    {:else}
        <p>Connected: {currentAccount}</p>
        <p>BLITZ Balance: {blitzBalance.toFixed(10)} KCAL</p>
        <input type="number" bind:value={depositAmount} placeholder="Amount of KCAL to deposit">
        <button on:click={depositKCAL}>Deposit KCAL</button>
        <button on:click={disconnectWallet}>Disconnect Wallet</button>
    {/if}
</div>