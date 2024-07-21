# Project Repositories and Contracts

N.I.N.A. (Network Integration and Navigation Assistant) is an innovative project designed to enable seamless control and management of digital assets across various blockchain networks through the Internet Computer (ICP). Leveraging ICP's capabilities, N.I.N.A. aims to provide a unified platform for interacting with and managing assets across different blockchain ecosystems, including DeFi, NFTs, and various token standards. In this hackathon, we will demonstrate a small-scale prototype showcasing N.I.N.A.'s functionality in the DeFi sector, where users can log in with their desired wallets and perform cross-chain swaps or token bridging. By utilizing a system of interconnected contracts on each chain, unified by the main controller N.I.N.A. on ICP, we employ chain fusion and outcall technologies over HTTPS to support both EVM and non-EVM chains, offering comprehensive bridge and DEX services. This demonstration highlights N.I.N.A.'s potential to revolutionize multi-chain asset management, making it a compelling choice for judges in the competition.

## Main Controller Canister FE/BE
- Repository: [Main Controller Repo](https://github.com/hydraerozine/SaturnNina.git)
- URL: [Main Controller Canister Login](https://4yken-yyaaa-aaaap-qho7a-cai.icp0.io/)

## EVM Canister Handler
- Repository: [EVM Canister Handler](https://github.com/hydraerozine/rustchainfusion.git)
- URL: [EVM Canister Handler URL](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=4nnva-zqaaa-aaaap-qho4q-cai)

## Outcall to Mint on Non-EVM Chains
- Repository: [IcpOutCallPhantasma](https://github.com/hydraerozine/IcpOutCallPhantasma.git)

## Solidity Contracts
- Repository: [Solidity Contracts](https://github.com/hydraerozine/solidityContracts.git)

## Non-EVM Contract Code on Phantasma

The non-EVM contract code on Phantasma will be attached below due to security reasons for our DEX, there is no repository online:

```tomb
token BLITZ {

	import Runtime;
	import Token;
	import List;
	import Number;
    import Map;

	property name:string = "Saturn BLITZ";
	property symbol: string = "BLITZ";
	property isFungible: bool = true; 
	property isDivisible: bool = true; 
	property decimals:number = 18; 
	property isTransferable: bool = true; 
	property isBurnable: bool = true; 
	property isFinite: bool = true; 
	property maxSupply: number = 1; //803.6784 being minted from BSC burn
	property isCapped: bool = true; 
	global _owner: address;
	property owner: address = _owner;
    global nina: address;
    global gnome: address;
    global feeCit: number;
    global feeKcal: number;
    global kcalSymbol: string;

    //CIT
    global deposits: storage_map<address, number>;
    global depositsKcal: storage_map<address, number>;
    //KCAL
    global depositsGlobal: storage_map<string, number>;
    global depositsKcalGlobal: storage_map<string, number>;
    global totalKcalFee: storage_map<string, number>;

    constructor(owner: address) {
        _owner = owner;
        nina = @P2KCG2QSrjoZX3Cwuzaii789YUVVEc8i1qSvynsvsb2W7qZ;
        gnome = @P2KB9GZQRerooGK3ent6Weqt8gnUWMqGC3S8dEkoMo551Ya;
        feeKcal = 100000000000;
        feeCit = 100000000000000000000;
        kcalSymbol = "KCAL";
    }

    public controller(from: address) {
        Runtime.expect(Runtime.isWitness(_owner), "Invalid witness");
        nina = from;
    }

    public gnomeController(from: address) {
        Runtime.expect(Runtime.isWitness(_owner), "Invalid witness");
        gnome = from;
    }

    public updateKcalFee(amount: number) {
        Runtime.expect(Runtime.isWitness(_owner), "Invalid witness");
        feeKcal = amount;
    }

    public updateCitFee(amount: number) {
        Runtime.expect(Runtime.isWitness(_owner), "Invalid witness");
        feeCit = amount;
    }

    public getDeposit(from: address): number {
        return deposits.get(from);
    }

    public getGlobalDeposits(symbol: string): number {
        return depositsGlobal.get(symbol);
    }

    public getKcalDeposit(from: address): number {
        return depositsKcal.get(from);
    }

    public getGlobalKcalDeposits(symbol: string): number {
        return depositsKcalGlobal.get(symbol);
    }

    public getGlobalKcalFee(symbol: string): number {
        return totalKcalFee.get(symbol);
    }

    public depositKcal(from: address, tokenSymbol: string, amount: number) {
        Runtime.expect(Runtime.isWitness(from), "Invalid witness");
        Runtime.expect(Token.exists(tokenSymbol) == true, "Token does not exist");
        Runtime.expect(tokenSymbol == kcalSymbol, "Token is not KCAL");
        Runtime.expect(amount > feeKcal, "Amount must be greater than 10 KCAL");

        local balanceKcal: number = Token.getBalance(from, kcalSymbol);
        Runtime.expect(balanceKcal >= amount, "Insufficient balance");

        local amountMinusFee: number = amount - feeKcal;

        Token.transfer(from, nina, kcalSymbol, amount);

        local currentDeposit: number = depositsKcal.get(from);
        depositsKcal.set(from, currentDeposit + amountMinusFee);

        local globalAmount: number = depositsKcalGlobal.get(tokenSymbol);
        depositsKcalGlobal.set(tokenSymbol, globalAmount + amountMinusFee);

        local globalKcalFeeBlitz: number = totalKcalFee.get(tokenSymbol);
        totalKcalFee.set(tokenSymbol, globalKcalFeeBlitz + feeKcal);

        Runtime.log("Deposit successful: " + from + " deposited " + amountMinusFee + " KCAL");
    }

    public deposit(from: address, tokenSymbol: string, amount: number) {
        Runtime.expect(Runtime.isWitness(from), "Invalid witness");
        Runtime.expect(Token.exists(tokenSymbol) == true, "Token does not exist");
        Runtime.expect(tokenSymbol == "ACIT", "Token is not CIT");
        Runtime.expect(amount > feeCit, "Amount must be greater than 1 CIT");

        local balanceKcal: number = Token.getBalance(from, kcalSymbol);
        Runtime.expect(balanceKcal >= feeKcal, "Insufficient balance");

        local balanceCit: number = Token.getBalance(from, tokenSymbol);
        local amountMinusFee: number = amount - feeCit;
        Runtime.expect(balanceCit >= amount, "Insufficient balance");

        Token.transfer(from, nina, kcalSymbol, feeKcal);
        Token.transfer(from, gnome, tokenSymbol, feeCit);
        Token.transfer(from, $THIS_ADDRESS, tokenSymbol, amountMinusFee);

        local currentDeposit: number = deposits.get(from);
        deposits.set(from, currentDeposit + amountMinusFee);

        local globalAmount: number = depositsGlobal.get(tokenSymbol);
        depositsGlobal.set(tokenSymbol, globalAmount + amountMinusFee);

        local globalKcalFeeBlitz: number = totalKcalFee.get(kcalSymbol);
        totalKcalFee.set(kcalSymbol, globalKcalFeeBlitz + feeKcal);

        Runtime.log("Deposit successful: " + from + " deposited " + amountMinusFee + " CIT");
    }

    public blitz(from: address, chainID: string, bsc: string, tokenSymbol: string, amount: number) {
        Runtime.expect(Runtime.isWitness(nina), "Invalid witness");
        Runtime.expect(Token.exists(tokenSymbol) == true, "Token does not exist");
        Runtime.expect(tokenSymbol == "ACIT", "Token is not CIT");
        Runtime.expect(amount > feeCit, "Amount must be greater than 1 CIT");

        local balanceCit: number = deposits.get(from);
        local amountMinusFee: number = amount - feeCit;
        Runtime.expect(balanceCit >= amount, "Insufficient CIT balance");
        deposits.set(from, balanceCit - amount);

        local currentDeposit: number = depositsKcal.get(from);
        Runtime.expect(currentDeposit >= feeKcal, "Insufficient KCAL balance");
        depositsKcal.set(from, currentDeposit - feeKcal);

        local globalCitAmount: number = depositsGlobal.get(tokenSymbol);
        depositsGlobal.set(tokenSymbol, globalCitAmount - feeCit);

        local globalAmount: number = depositsKcalGlobal.get(kcalSymbol);
        depositsKcalGlobal.set(kcalSymbol, globalAmount - feeKcal);

        local globalKcalFeeBlitz: number = totalKcalFee.get(kcalSymbol);
        totalKcalFee.set(kcalSymbol, globalKcalFeeBlitz + feeKcal);

        Token.transfer($THIS_ADDRESS, gnome, tokenSymbol, feeCit);
        Token.transfer($THIS_ADDRESS, nina, kcalSymbol, feeKcal);

        Runtime.log("Blitz successful: " + from + " sent " + amountMinusFee + " CIT" + " to " + chainID);
    }

    public blitzSwap(from: address, chainID: string, walletAddress: string, tokenSymbol: string, tokenOut: string, amount: number) {
        Runtime.expect(Runtime.isWitness(nina), "Invalid witness");
        Runtime.expect(Token.exists(tokenSymbol) == true, "Token does not exist");
        Runtime.expect(tokenSymbol == "ACIT", "Token is not CIT");
        Runtime.expect(amount > feeCit, "Amount must be greater than 1 CIT");

    }

    public withdraw(from: address, tokenSymbol: string, amount: number) {
        Runtime.expect(Runtime.isWitness(from), "Invalid witness");
        Runtime.expect(Token.exists(tokenSymbol) == true, "Token does not exist");
        Runtime.expect(tokenSymbol == "ACIT", "Token is not CIT");
        Runtime.expect(Token.getBalance($THIS_ADDRESS, tokenSymbol) > 0, "Amount must be greater than 0");

        local balanceKcal: number = Token.getBalance(from, kcalSymbol);
        Runtime.expect(balanceKcal >= feeKcal, "Insufficient balance KCAL, need 10 KCAL");
        
        local currentWithdrawal: number = deposits.get(from);

        Runtime.expect(currentWithdrawal >= amount, "Insufficient amount for withdrawal");

        deposits.set(from, currentWithdrawal - amount);

        Token.transfer($THIS_ADDRESS, from, tokenSymbol, amount);
        Token.transfer(from, nina, kcalSymbol, feeKcal);

        local globalAmount: number = depositsGlobal.get(tokenSymbol);
        depositsGlobal.set(tokenSymbol, globalAmount - amount);

        local globalKcalFeeBlitz: number = totalKcalFee.get(tokenSymbol);
        totalKcalFee.set(tokenSymbol, globalKcalFeeBlitz + feeKcal);

        Runtime.log("Withdrawal successful: " + from + " withdrew " + amount + " CIT");
    }

    // Owner can upgrade the contract if needed
    trigger onUpgrade(from: address) {
        Runtime.expect(Runtime.isWitness(_owner), "Only the owner can upgrade");
    }
    trigger onMint(from: address, to: address, symbol: string, amount: number) {
		Runtime.expect(Runtime.isWitness(_owner), "witness failed"); // Only the owner can mint tokens.
    }
    trigger onSend(from: address, to: address, symbol: string, amount: number) {
		Runtime.expect(symbol == $THIS_SYMBOL, "symbol mismatch"); // Validating the symbol.
	}
    trigger onBurn(from: address, to: address, symbol: string, amount: number) {
		Runtime.expect(symbol == $THIS_SYMBOL, "symbol mismatch"); // Validating the symbol.
		Runtime.expect(Runtime.isWitness(_owner), "Sender must be the caller of the burn");
    }
	trigger onInfuse(from: address, to: address, symbol: string, amount: number) {
		Runtime.expect(Runtime.isWitness(_owner), "witness failed");
		Runtime.expect(symbol == $THIS_SYMBOL, "symbol mismatch"); // Validating the symbol.
    }
}
```

## AI Work in Progress

- The code for AI work in progress to show data for users as well as let users swap or transfer tokens across chains via telegram :

```
require('dotenv').config();
const { Telegraf } = require('telegraf');
const OpenAI = require('openai');
const { PhantasmaAPI, ScriptBuilder, Decoder } = require('phantasma-ts');
const { HttpAgent, Actor, IDL } = require('@dfinity/agent');

// Initialize the OpenAI API client with your API key
const openai = new OpenAI(process.env.OPENAI_API_NINA);

// Initialize Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_NINA_BOT_TOKEN);

// Chat ID for sending messages
const CHAT_ID = process.env.CHAT_ID;

// Initialize Phantasma RPC
const RPC = new PhantasmaAPI('https://testnet.phantasma.info/rpc');

// Cache for storing recent conversations
const conversationCache = new Map();

// Function to get or create a user's conversation
function getOrCreateConversation(userId) {
  if (!conversationCache.has(userId)) {
    conversationCache.set(userId, { context: [], lastInteraction: new Date() });
  }
  return conversationCache.get(userId);
}

// Function to update conversation
function updateConversation(userId, newContext) {
  const conversation = conversationCache.get(userId);
  conversation.context = newContext;
  conversation.lastInteraction = new Date();
}

// Phantasma address to track
const trackedAddress = 'P2K3yFGxSHpAPt9eKL2aETTnAGeH79kpdHEj5dwpPxsAeod';

// Function to get token balance from Phantasma
async function getPhantasmaBalance(address, symbol = 'KCAL') {
  try {
    const account = await RPC.getAccount(address);
    const balance = account.balances.find(b => b.symbol === symbol);

    if (!balance) {
      return 0;
    }

    const tokenData = await RPC.getToken(symbol);
    const decimals = tokenData.decimals;

    return parseFloat(balance.amount) / Math.pow(10, decimals);
  } catch (error) {
    console.error('Error fetching Phantasma balance:', error);
    return Error: ${error.message || 'Unknown error'};
  }
}

// Function to check and report balance
async function checkAndReportBalance() {
  const balance = await getPhantasmaBalance(trackedAddress, 'KCAL');
  let message;
  if (typeof balance === 'number') {
    message = Current wallet balance: ${balance.toFixed(10)} KCAL;
  } else {
    message = Failed to get KCAL balance for ${trackedAddress}: ${balance};
  }
  bot.telegram.sendMessage(CHAT_ID, message);
}

// Set up periodic balance checking
setInterval(checkAndReportBalance, 5 * 60 * 1000); // Run every 5 minutes

// IC agent setup
const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });
const canisterId = 'by6od-j4aaa-aaaaa-qaadq-cai';

// Define the interface of the canister
const idlFactory = ({ IDL }) => IDL.Service({
  'getDeposits': IDL.Func([], [IDL.Vec(IDL.Record({
    'address': IDL.Text,
    'amount': IDL.Float64,
    'timestamp': IDL.Int,
  }))], ['query']),
});

// Create an actor for the canister
const backendActor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

// Function to query the canister for deposits
async function getDepositsFromCanister() {
  try {
    const deposits = await backendActor.getDeposits();
    return deposits;
  } catch (error) {
    console.error('Error fetching deposits from canister:', error);
    return [];
  }
}

// Function to get data from BLITZ contract
async function getBlitzContractData(method, params = []) {
  let sb = new ScriptBuilder();
  sb.CallContract('BLITZ', method, params);
  const script = sb.EndScript();

  const response = await RPC.invokeRawScript('main', script);
  const decoder = new Decoder(response.result);
  return decoder.readVmObject();
}

// Function to check and report balance and BLITZ contract data
async function checkAndReportData() {
  try {
    const deposit = await getBlitzContractData('getDeposit', ['P2K3yFGxSHpAPt9eKL2aETTnAGeH79kpdHEj5dwpPxsAeod']);
    const globalCITDeposits = await getBlitzContractData('getGlobalDeposits', ['CIT']);
    const globalKcalFee = await getBlitzContractData('getGlobalKcalFee', ['KCAL']);
    const globalKcalDeposits = await getBlitzContractData('getGlobalKcalDeposits', ['KCAL']);
    const kcalDeposit = await getBlitzContractData('getKcalDeposit', ['P2K3yFGxSHpAPt9eKL2aETTnAGeH79kpdHEj5dwpPxsAeod']);

    const deposits = await getDepositsFromCanister();

    let message = 
Here is your report, @kaleidonul

BLITZ Contract Data:
- Deposit: ${deposit}
- Global CIT Deposits: ${globalCITDeposits}
- Global KCAL Fee: ${globalKcalFee}
- Global KCAL Deposits: ${globalKcalDeposits}
- KCAL Deposit: ${kcalDeposit}

Canister Deposits:
${deposits.map(deposit => - Address: ${deposit.address}, Amount: ${deposit.amount}, Timestamp: ${new Date(Number(deposit.timestamp) / 1_000_000_000).toISOString()}).join('\n')}
    ;

    bot.telegram.sendMessage(CHAT_ID, message);
  } catch (error) {
    console.error('Error in checkAndReportData:', error);
    bot.telegram.sendMessage(CHAT_ID, Error fetching data: ${error.message});
  }
}

// Set up periodic data checking
setInterval(checkAndReportData, 5 * 60 * 1000); // Run every 5 minutes

bot.on('message', async (ctx) => {
  if (ctx.chat.id.toString() !== CHAT_ID) return; // Only respond in the specified chat

  const messageText = ctx.message.text || '';
  const userId = ctx.from.id;

  console.log('Received message:', messageText);

  if (messageText.toLowerCase().includes('nina')) {
    const userMessage = messageText.trim().toLowerCase();

    let conversation = getOrCreateConversation(userId.toString());
    let context = conversation.context;

    // Check if the last interaction was more than 6 hours ago
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    if (conversation.lastInteraction < sixHoursAgo) {
      context = []; // Reset context if it's been more than 6 hours
    }

    // Limit context to last 5 messages
    if (context.length >= 5) {
      context = context.slice(-4);
    }

    // Append new user message to context with timestamp
    context.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-0613',
        messages: [
          {
            role: 'system',
            content: 'You are Major Nina Eisenhardt, sister of Lena Eisenhardt. You handle solar planetary alliance logistics. Help users with location and transportation of assets across planets. Respond in character. Respond briefly in English. Maximum of 45 words.'
          },
          ...context
        ],
      });

      if (response.choices && response.choices.length > 0) {
        const generatedText = response.choices[0].message.content.trim();
        await ctx.reply(generatedText);

        // Append AI response to context with timestamp
        context.push({ role: 'assistant', content: generatedText, timestamp: new Date().toISOString() });
      } else {
        await ctx.reply('Sorry, I don\'t have a response for that.');
      }

      // Update conversation in cache
      updateConversation(userId.toString(), context);
    } catch (error) {
      console.error('Error processing message:', error);
      await ctx.reply('Sorry, there was an error processing your message.');
    }
  } else if (messageText.toLowerCase() === 'balance') {
    // Immediate data check
    await checkAndReportData();
  }
});

// Periodically clean up the cache
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (let [userId, conversation] of conversationCache) {
    if (conversation.lastInteraction < oneHourAgo) {
      conversationCache.delete(userId);
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```