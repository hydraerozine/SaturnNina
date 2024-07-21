<script>
    import { onMount } from 'svelte';
    import { ethers } from 'ethers';
  
    let isConnected = false;
    let currentAccount = '';
    let bnbBalance = 0;
    let networkName = '';
    let provider;
  
    onMount(() => {
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        console.log('No Ethereum provider detected');
      }
    });
  
    async function connectMetaMask(isTestnet = false) {
      if (typeof window.ethereum !== 'undefined') {
        try {
          if (isTestnet) {
            await switchToBSCTestnet();
          } else {
            await switchToBSCMainnet();
          }
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('Accounts connected:', accounts);
          
          provider = new ethers.BrowserProvider(window.ethereum);
          console.log('Provider:', provider);
          
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          
          await handleAccountsChanged(accounts);
        } catch (error) {
          if (error.code === 4001) {
            console.log('User rejected the request to connect.');
          } else {
            console.error("Error connecting to MetaMask", error);
          }
        }
      } else {
        console.log('Please install MetaMask!');
      }
    }
  
    async function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
        isConnected = false;
        currentAccount = '';
        bnbBalance = 0;
      } else {
        currentAccount = accounts[0];
        isConnected = true;
        console.log('Current account:', currentAccount);
        await updateNetwork();
        await fetchBNBBalance();
      }
    }
  
    async function handleChainChanged() {
      console.log('Chain changed');
      await updateNetwork();
      await fetchBNBBalance();
    }
  
    async function updateNetwork() {
      if (provider) {
        const network = await provider.getNetwork();
        console.log('Network:', network);
        if (network.chainId === 56n) {
          networkName = 'Mainnet';
        } else if (network.chainId === 97n) {
          networkName = 'Testnet';
        } else {
          networkName = 'Unknown';
        }
        console.log('Network Name:', networkName);
      }
    }
  
    async function switchToBSCMainnet() {
      await switchToNetwork('0x38', 'Binance Smart Chain', 'BNB', 'bnb', 18, ['https://bsc-dataseed.binance.org/'], ['https://bscscan.com/']);
    }
  
    async function switchToBSCTestnet() {
      await switchToNetwork('0x61', 'Binance Smart Chain Testnet', 'tBNB', 'tbnb', 18, ['https://data-seed-prebsc-1-s1.binance.org:8545/'], ['https://testnet.bscscan.com']);
    }
  
    async function switchToNetwork(chainId, chainName, currencyName, currencySymbol, decimals, rpcUrls, blockExplorerUrls) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: chainId,
                chainName: chainName,
                nativeCurrency: {
                  name: currencyName,
                  symbol: currencySymbol,
                  decimals: decimals
                },
                rpcUrls: rpcUrls,
                blockExplorerUrls: blockExplorerUrls,
              }],
            });
          } catch (addError) {
            if (addError.code === 4001) {
              console.log('User rejected the request to add the network.');
            } else {
              console.error('Error adding network to MetaMask', addError);
            }
          }
        } else if (switchError.code === 4001) {
          console.log('User rejected the request to switch networks.');
        } else {
          console.error('Error switching network', switchError);
        }
      }
    }
  
    async function fetchBNBBalance() {
      console.log('Fetching BNB Balance');
      if (isConnected && provider && currentAccount) {
        try {
          const balance = await provider.getBalance(currentAccount);
          console.log('Raw BNB Balance:', balance);
          bnbBalance = parseFloat(ethers.formatEther(balance));
          console.log('Formatted BNB Balance:', bnbBalance);
        } catch (error) {
          console.error('Error fetching BNB balance:', error);
          bnbBalance = 0;
        }
      } else {
        console.log('Cannot fetch BNB Balance: Not connected or missing provider/account');
      }
    }
  
    function disconnectWallet() {
      isConnected = false;
      currentAccount = '';
      bnbBalance = 0;
      networkName = '';
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      provider = null;
      console.log('Wallet disconnected');
    }
</script>
  
{#if !isConnected}
  <button on:click={() => connectMetaMask(false)}>Connect to BSC Mainnet</button>
  <button on:click={() => connectMetaMask(true)}>Connect to BSC Testnet</button>
{:else}
  <p>Connected to BSC {networkName}: {currentAccount}</p>
  <p>BNB Balance: {bnbBalance.toFixed(8)} {networkName === 'Testnet' ? 'tBNB' : 'BNB'}</p>
  <button on:click={disconnectWallet}>Disconnect BSC</button>
{/if}