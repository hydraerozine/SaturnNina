<script>
  import { onMount } from 'svelte';
  import { writable, derived, get } from 'svelte/store';
  import { PhantasmaLink, PhantasmaAPI, ScriptBuilder, Transaction, Address, Base16, Decoder } from 'phantasma-ts';
  import BigNumber from 'bignumber.js';
  import { Actor, HttpAgent } from "@dfinity/agent";
  import { idlFactory } from '../../../declarations/nina_backend/nina_backend.did.js';

  // Svelte stores for component-specific state
  let depositAmount = writable('');
  let blitzBalance = writable(0);
  let isConnected = writable(false);
  let currentAccount = writable('');

  // Store for log messages
  let logMessage = writable("");

  // Disable deposit button if input is empty
  let isDepositDisabled = derived(depositAmount, $depositAmount => !$depositAmount || parseFloat($depositAmount) <= 0);

  const contractName = 'BLITZ';
  const NexusName = 'mainnet';
  const ChainName = 'main';

  let provider;
  let RPC;
  let ninaBackend;

  onMount(async () => {
    provider = new PhantasmaLink('BLITZ Deposit');
    RPC = new PhantasmaAPI('https://testnet.phantasma.info/rpc');

    // Initialize the IC agent and actor
    const agent = new HttpAgent();
    if (process.env.NODE_ENV !== "production") {
      await agent.fetchRootKey();
    }
    ninaBackend = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.CANISTER_ID_NINA_BACKEND,
    });
  });

  async function connectPhantasma() {
    try {
      await provider.login(
        (success) => {
          if (success) {
            isConnected.set(true);
            currentAccount.set(provider.account.address);
            fetchBlitzBalance();
            logMessage.set("Wallet connected successfully");
          } else {
            logMessage.set("Failed to connect wallet");
          }
        },
        (error) => {
          console.error("Error connecting to Phantasma:", error);
          logMessage.set(`Error connecting to Phantasma: ${error.message}`);
        }
      );
    } catch (error) {
      console.error("Error connecting to Phantasma:", error);
      logMessage.set(`Error connecting to Phantasma: ${error.message}`);
    }
  }

  async function fetchBlitzBalance() {
    if (!get(isConnected)) return;

    try {
      let sb = new ScriptBuilder();
      sb.CallContract(contractName, 'getKcalDeposit', [get(currentAccount)]);
      const script = sb.EndScript();
      const response = await RPC.invokeRawScript(ChainName, script);
      const decoder = new Decoder(response.result);
      const balance = decoder.readVmObject();
      blitzBalance.set(new BigNumber(balance).shiftedBy(-10).toNumber()); // Assuming KCAL has 10 decimals
    } catch (error) {
      console.error("Error fetching BLITZ balance:", error);
      logMessage.set(`Error fetching BLITZ balance: ${error.message}`);
    }
  }

  async function depositKCAL() {
    if (!get(isConnected) || !get(depositAmount)) return;

    const amountInDecimals = new BigNumber(get(depositAmount)).shiftedBy(10).toFixed(); // 10 decimals for KCAL

    let sb = new ScriptBuilder();
    sb.AllowGas(get(currentAccount), Address.Null, 1000000, 9999);
    sb.CallContract(contractName, "depositKcal", [get(currentAccount), 'KCAL', amountInDecimals]);
    sb.SpendGas(get(currentAccount));
    const script = sb.EndScript();

    const payload = 'BLITZ Deposit';

    try {
      alert("Please accept the transaction in your Poltergeist or Ecto wallet.");
      await provider.signTx(script, payload, async (txHash) => {
        alert("Transaction completed successfully");
        console.log('Transaction sent:', txHash);
        logMessage.set(`Deposit successful`);
        await fetchBlitzBalance(); // Refresh balance

        // Register the deposit with the IC backend
        try {
          const result = await ninaBackend.registerKCALDeposit(get(currentAccount), parseFloat(get(depositAmount)));
          if (result) {
            console.log("Deposit registered with IC backend");
          } else {
            console.error("Failed to register deposit with IC backend");
          }
        } catch (error) {
          console.error("Error registering deposit with IC backend:", error);
        }
      }, async (error) => {
        alert(`Error sending transaction: ${error}`);
        console.error('Error sending transaction:', error);
        logMessage.set(`Error occurred, transaction not sent`);
      });
    } catch (error) {
      console.error("Error during deposit:", error);
      logMessage.set(`Error during deposit: ${error.message}`);
    }
  }

  function disconnectWallet() {
    isConnected.set(false);
    currentAccount.set('');
    blitzBalance.set(0);
    depositAmount.set('');
    if (provider) {
      provider.disconnect();
    }
    logMessage.set("Wallet disconnected");
  }
</script>

<div>
  {#if !$isConnected}
    <button on:click={connectPhantasma}>Connect Phantasma Wallet</button>
  {:else}
    <p>Connected: {$currentAccount}</p>
    <p>BLITZ Balance: {$blitzBalance.toFixed(10)} KCAL</p>
    <input type="number" bind:value={$depositAmount} placeholder="Amount of KCAL to deposit">
    <button on:click={depositKCAL} disabled={$isDepositDisabled}>Deposit KCAL</button>
    <button on:click={disconnectWallet}>Disconnect Wallet</button>
  {/if}
  {#if $logMessage}
    <p>{$logMessage}</p>
  {/if}
</div>