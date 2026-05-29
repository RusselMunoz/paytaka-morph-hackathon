import { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletApi } from '../lib/api';
import { isEvmAddress } from '../lib/morph';
import { MORPH_RPC_URL, MORPH_USDC_ADDRESS, MORPH_USDT_ADDRESS, MORPH_EXPLORER_URL } from '../lib/config';

const WalletContext = createContext(null);

// Storage key for wallet address
const WALLET_ADDRESS_KEY = '@paytaka_wallet_address';

// Fallback RPC URLs for better reliability (in priority order)
const RPC_URLS = [
  'https://rpc-hoodi.morph.network',
  'https://ethereum-hoodi-rpc.publicnode.com',
  'https://hoodi.drpc.org',
  'https://1rpc.io/hoodi',
  MORPH_RPC_URL,
];

// ERC20 balanceOf function signature
const BALANCE_OF_SIGNATURE = '0x70a08231';

// Storage keys for balance tracking
const LAST_BALANCE_KEY = '@paytaka_last_balance';
const LAST_FETCH_TIME_KEY = '@paytaka_last_fetch_time';

// Helper to pad address for eth_call
const padAddress = (address) => {
  return BALANCE_OF_SIGNATURE + '000000000000000000000000' + address.slice(2).toLowerCase();
};

// Helper to convert hex to decimal with decimals
const hexToDecimal = (hex, decimals = 18) => {
  if (!hex || hex === '0x' || hex === '0x0') return 0;
  
  try {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    // Convert to BigInt
    const value = BigInt('0x' + cleanHex);
    const divisor = BigInt(10 ** decimals);
    
    // Calculate integer and fractional parts
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;
    
    // Convert to number with proper precision
    const result = Number(integerPart) + Number(fractionalPart) / Number(divisor);
    
    console.log(`[hexToDecimal] Input: ${hex}, Decimals: ${decimals}, Output: ${result}`);
    return result;
  } catch (error) {
    console.error(`[hexToDecimal] Conversion failed for ${hex}:`, error);
    return 0;
  }
};

// RPC call helper with fallback support
const rpcCall = async (method, params, walletAddress = null) => {
  let lastError;
  let attemptCount = 0;
  
  // Try each RPC URL in order
  for (const rpcUrl of RPC_URLS) {
    attemptCount++;
    try {
      console.log(`[RPC] Attempt ${attemptCount}/${RPC_URLS.length}: Calling ${method} on ${rpcUrl}`);
      if (walletAddress) {
        console.log(`[RPC] Target wallet: ${walletAddress}`);
      }
      console.log(`[RPC] Params:`, JSON.stringify(params));
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        timeout: 10000, // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`[RPC] Error response from ${rpcUrl}:`, data.error);
        throw new Error(data.error.message || JSON.stringify(data.error));
      }
      
      console.log(`[RPC] ✅ SUCCESS on ${rpcUrl}`);
      console.log(`[RPC] ${method} raw result:`, data.result);
      
      return data.result;
    } catch (error) {
      console.error(`[RPC] ❌ ${method} failed on ${rpcUrl}:`, error.message);
      lastError = error;
      // Continue to next RPC URL
    }
  }
  
  // All RPCs failed
  console.error(`[RPC] 💥 All ${RPC_URLS.length} RPC endpoints failed for ${method}`);
  throw lastError || new Error(`All RPC endpoints failed for ${method}`);
};

// Fetch USD/PHP exchange rate
const fetchUsdPhpRate = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates?.PHP || 56.5;
  } catch (error) {
    console.log('Exchange rate fetch failed, using fallback:', error.message);
    return 56.5;
  }
};

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [nativeBalance, setNativeBalance] = useState(0);
  const [usdPhpRate, setUsdPhpRate] = useState(56.5);
  const [balanceChange, setBalanceChange] = useState(0);
  const [balanceChangePercent, setBalanceChangePercent] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const refreshIntervalRef = useRef(null);

  // Fetch all balances from blockchain
  const fetchBlockchainBalances = async (targetAddress) => {
    console.log(`\n========================================`);
    console.log(`[Balance] 🔍 Fetching balances for wallet: ${targetAddress}`);
    console.log(`========================================\n`);
    
    try {
      // Validate address
      if (!isEvmAddress(targetAddress)) {
        throw new Error(`Invalid EVM address: ${targetAddress}`);
      }

      // Fetch native HodETH balance FIRST (most important)
      console.log(`[Balance] 💰 Fetching native HodETH balance...`);
      const nativeData = await rpcCall('eth_getBalance', [targetAddress, 'latest'], targetAddress);
      console.log(`[Balance] Raw eth_getBalance hex:`, nativeData);
      
      // Convert hex to decimal (18 decimals for native token)
      const nativeBal = hexToDecimal(nativeData, 18);
      console.log(`[Balance] ✅ Native balance: ${nativeBal} HodETH`);
      
      const finalNativeBal = nativeBal;

      // Fetch USDC balance
      console.log(`[Balance] 💵 Fetching USDC balance...`);
      const usdcData = await rpcCall('eth_call', [
        {
          to: MORPH_USDC_ADDRESS,
          data: padAddress(targetAddress),
        },
        'latest',
      ], targetAddress);
      const usdcBal = hexToDecimal(usdcData, 6); // USDC has 6 decimals
      console.log(`[Balance] ✅ USDC balance: ${usdcBal} USDC`);

      // Fetch USDT balance
      console.log(`[Balance] 💵 Fetching USDT balance...`);
      const usdtData = await rpcCall('eth_call', [
        {
          to: MORPH_USDT_ADDRESS,
          data: padAddress(targetAddress),
        },
        'latest',
      ], targetAddress);
      const usdtBal = hexToDecimal(usdtData, 6); // USDT has 6 decimals
      console.log(`[Balance] ✅ USDT balance: ${usdtBal} USDT`);

      console.log(`\n========================================`);
      console.log(`[Balance] 📊 FINAL BALANCES:`);
      console.log(`  - Native (HodETH): ${finalNativeBal}`);
      console.log(`  - USDC: ${usdcBal}`);
      console.log(`  - USDT: ${usdtBal}`);
      console.log(`========================================\n`);

      return { usdcBal, usdtBal, nativeBal: finalNativeBal };
    } catch (error) {
      console.error('❌ Blockchain balance fetch failed:', error);
      throw error;
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (targetAddress) => {
    try {
      // Get current block number first
      const latestBlockHex = await rpcCall('eth_blockNumber', []);
      const latestBlock = parseInt(latestBlockHex, 16);
      
      // Calculate fromBlock (latest - 3000 blocks, minimum 0)
      const fromBlockNumber = Math.max(0, latestBlock - 3000);
      const fromBlockHex = '0x' + fromBlockNumber.toString(16);
      
      console.log(`[Transaction History] Latest block: ${latestBlock}, From block: ${fromBlockNumber}`);
      
      // Fetch logs for USDC transfers with reasonable block range
      const usdcLogs = await rpcCall('eth_getLogs', [
        {
          address: MORPH_USDC_ADDRESS,
          fromBlock: fromBlockHex,
          toBlock: 'latest',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
            null,
            null,
          ],
        },
      ]);

      // Parse logs into transactions with logIndex for uniqueness
      const txs = usdcLogs.slice(-20).map((log, idx) => {
        const from = '0x' + log.topics[1].slice(26);
        const to = '0x' + log.topics[2].slice(26);
        const value = hexToDecimal(log.data, 6);
        const isIncoming = to.toLowerCase() === targetAddress.toLowerCase();
        const logIndex = log.logIndex ? parseInt(log.logIndex, 16) : idx;

        return {
          id: `${log.transactionHash}-${logIndex}`,
          hash: log.transactionHash,
          logIndex,
          from,
          to,
          amount: value.toFixed(2),
          tokenSymbol: 'USDC',
          direction: isIncoming ? 'received' : 'sent',
          timestamp: Date.now() - (20 - idx) * 3600000, // Mock timestamps
          blockNumber: parseInt(log.blockNumber, 16),
        };
      });

      // Deduplicate transactions by hash + logIndex
      const unique = Array.from(
        new Map(
          txs.map(tx => [
            `${tx.hash}-${tx.logIndex ?? 0}`,
            tx
          ])
        ).values()
      );

      return unique.reverse();
    } catch (error) {
      console.error('Transaction history fetch failed:', error);
      return [];
    }
  };

  // Calculate balance change
  const calculateBalanceChange = async (currentTotal) => {
    try {
      const lastBalanceStr = await AsyncStorage.getItem(LAST_BALANCE_KEY);
      const lastBalance = lastBalanceStr ? parseFloat(lastBalanceStr) : currentTotal;

      const change = currentTotal - lastBalance;
      const changePercent = lastBalance > 0 ? (change / lastBalance) * 100 : 0;

      // Store current balance for next comparison
      await AsyncStorage.setItem(LAST_BALANCE_KEY, currentTotal.toString());
      await AsyncStorage.setItem(LAST_FETCH_TIME_KEY, Date.now().toString());

      return { change, changePercent };
    } catch (error) {
      console.error('Balance change calculation failed:', error);
      return { change: 0, changePercent: 0 };
    }
  };

  // Main refresh function
  const refreshBalance = async (targetAddress = address) => {
    if (!targetAddress) {
      return null;
    }

    setIsLoadingBalance(true);
    try {
      // Fetch all data in parallel
      const [balances, rate, txHistory] = await Promise.all([
        fetchBlockchainBalances(targetAddress),
        fetchUsdPhpRate(),
        fetchTransactionHistory(targetAddress),
      ]);

      const { usdcBal, usdtBal, nativeBal } = balances;
      const totalUsd = usdcBal + usdtBal + nativeBal * 2000; // Rough ETH price estimate

      // Calculate change
      const { change, changePercent } = await calculateBalanceChange(totalUsd);

      // Update all state
      setUsdcBalance(usdcBal);
      setUsdtBalance(usdtBal);
      setNativeBalance(nativeBal);
      setUsdPhpRate(rate);
      setBalanceChange(change);
      setBalanceChangePercent(changePercent);
      setTransactions(txHistory);

      const balanceData = {
        formatted: totalUsd.toFixed(2),
        usdc: usdcBal,
        usdt: usdtBal,
        native: nativeBal,
        hodeth: nativeBal, // Expose as HodETH for display
        usdPhpRate: rate,
        change,
        changePercent,
      };

      setBalance(balanceData);
      return balanceData;
    } catch (error) {
      console.error('❌ Balance refresh failed:', error);
      // Set zero balances on error
      const errorBalance = {
        formatted: '0.00',
        usdc: 0,
        usdt: 0,
        native: 0,
        hodeth: 0,
        usdPhpRate: 56.5,
        change: 0,
        changePercent: 0,
      };
      setBalance(errorBalance);
      setUsdcBalance(0);
      setUsdtBalance(0);
      setNativeBalance(0);
      return errorBalance;
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (address) {
      // Initial fetch
      refreshBalance(address);

      // Set up interval
      refreshIntervalRef.current = setInterval(() => {
        refreshBalance(address);
      }, 30000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [address]);

  // Load saved wallet address on mount
  useEffect(() => {
    const loadSavedWallet = async () => {
      try {
        const savedAddress = await AsyncStorage.getItem(WALLET_ADDRESS_KEY);
        if (savedAddress && isEvmAddress(savedAddress)) {
          console.log('[Wallet] Loading saved wallet:', savedAddress);
          setAddress(savedAddress);
        }
      } catch (error) {
        console.error('[Wallet] Failed to load saved wallet:', error);
      }
    };

    loadSavedWallet();
  }, []);

  const value = useMemo(
    () => ({
      address,
      balance,
      isConnected: Boolean(address),
      isLoadingBalance,
      usdcBalance,
      usdtBalance,
      nativeBalance,
      usdPhpRate,
      balanceChange,
      balanceChangePercent,
      transactions,
      connectWithAddress: async (nextAddress, options = {}) => {
        const trimmedAddress = nextAddress.trim();

        if (!isEvmAddress(trimmedAddress)) {
          throw new Error('Invalid wallet address');
        }

        // Save to AsyncStorage
        await AsyncStorage.setItem(WALLET_ADDRESS_KEY, trimmedAddress);

        setAddress(trimmedAddress);

        if (options.syncToBackend) {
          await walletApi.saveWallet({
            address: trimmedAddress,
            provider: options.provider ?? 'EXTERNAL',
            label: options.label,
          });
        }

        return trimmedAddress;
      },
      disconnect: async () => {
        // Remove from AsyncStorage
        await AsyncStorage.removeItem(WALLET_ADDRESS_KEY);
        
        setAddress(null);
        setBalance(null);
        setUsdcBalance(0);
        setUsdtBalance(0);
        setNativeBalance(0);
        setTransactions([]);
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      },
      refreshBalance,
      // Manual refresh function that forces balance update
      forceRefresh: async () => {
        console.log('[Wallet] Force refresh triggered');
        if (address) {
          return await refreshBalance(address);
        }
        return null;
      },
    }),
    [
      address,
      balance,
      isLoadingBalance,
      usdcBalance,
      usdtBalance,
      nativeBalance,
      usdPhpRate,
      balanceChange,
      balanceChangePercent,
      transactions,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    console.error('[useWallet] Hook called outside WalletProvider. Check that your component is wrapped in WalletProvider.');
    throw new Error('useWallet must be used inside WalletProvider. Make sure WalletProvider wraps your component tree in App.js');
  }

  return context;
}

// Made with Bob
