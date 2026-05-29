import { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletApi } from '../lib/api';
import { isEvmAddress } from '../lib/morph';
import { MORPH_RPC_URL, MORPH_USDC_ADDRESS, MORPH_USDT_ADDRESS, MORPH_EXPLORER_URL } from '../lib/config';

const WalletContext = createContext(null);

// Demo wallet address
const DEMO_WALLET_ADDRESS = '0x338442CEEd20F53f78b0A30223f7d6797e24ED48';

// ERC20 balanceOf function signature
const BALANCE_OF_SIGNATURE = '0x70a08231';

// Storage keys
const LAST_BALANCE_KEY = '@paytaka_last_balance';
const LAST_FETCH_TIME_KEY = '@paytaka_last_fetch_time';

// Helper to pad address for eth_call
const padAddress = (address) => {
  return BALANCE_OF_SIGNATURE + '000000000000000000000000' + address.slice(2).toLowerCase();
};

// Helper to convert hex to decimal with decimals
const hexToDecimal = (hex, decimals = 18) => {
  if (!hex || hex === '0x') return 0;
  const value = BigInt(hex);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  return Number(integerPart) + Number(fractionalPart) / Number(divisor);
};

// RPC call helper
const rpcCall = async (method, params) => {
  try {
    const response = await fetch(MORPH_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'RPC call failed');
    }
    return data.result;
  } catch (error) {
    console.error(`RPC ${method} failed:`, error);
    throw error;
  }
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
    try {
      // Fetch USDC balance
      const usdcData = await rpcCall('eth_call', [
        {
          to: MORPH_USDC_ADDRESS,
          data: padAddress(targetAddress),
        },
        'latest',
      ]);
      const usdcBal = hexToDecimal(usdcData, 6); // USDC has 6 decimals

      // Fetch USDT balance
      const usdtData = await rpcCall('eth_call', [
        {
          to: MORPH_USDT_ADDRESS,
          data: padAddress(targetAddress),
        },
        'latest',
      ]);
      const usdtBal = hexToDecimal(usdtData, 6); // USDT has 6 decimals

      // Fetch native ETH balance
      const nativeData = await rpcCall('eth_getBalance', [targetAddress, 'latest']);
      const nativeBal = hexToDecimal(nativeData, 18);

      return { usdcBal, usdtBal, nativeBal };
    } catch (error) {
      console.error('Blockchain balance fetch failed:', error);
      throw error;
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (targetAddress) => {
    try {
      // Fetch logs for USDC transfers
      const usdcLogs = await rpcCall('eth_getLogs', [
        {
          address: MORPH_USDC_ADDRESS,
          fromBlock: '0x0',
          toBlock: 'latest',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
            null,
            null,
          ],
        },
      ]);

      // Parse logs into transactions
      const txs = usdcLogs.slice(-20).map((log, idx) => {
        const from = '0x' + log.topics[1].slice(26);
        const to = '0x' + log.topics[2].slice(26);
        const value = hexToDecimal(log.data, 6);
        const isIncoming = to.toLowerCase() === targetAddress.toLowerCase();

        return {
          id: log.transactionHash || `tx-${idx}`,
          hash: log.transactionHash,
          from,
          to,
          amount: value.toFixed(2),
          tokenSymbol: 'USDC',
          direction: isIncoming ? 'received' : 'sent',
          timestamp: Date.now() - (20 - idx) * 3600000, // Mock timestamps
          blockNumber: parseInt(log.blockNumber, 16),
        };
      });

      return txs.reverse();
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
      console.error('Balance refresh failed, using demo data:', error);
      // Fallback to demo data
      const demoBalance = {
        formatted: '4797.45',
        usdc: 3118.34,
        usdt: 1679.11,
        native: 0,
        usdPhpRate: 56.5,
        change: 37.12,
        changePercent: 0.78,
      };
      setBalance(demoBalance);
      setUsdcBalance(3118.34);
      setUsdtBalance(1679.11);
      setNativeBalance(0);
      setUsdPhpRate(56.5);
      setBalanceChange(37.12);
      setBalanceChangePercent(0.78);
      return demoBalance;
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
      disconnect: () => {
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
    throw new Error('useWallet must be used inside WalletProvider');
  }

  return context;
}

// Made with Bob
