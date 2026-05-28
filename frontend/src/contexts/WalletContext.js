import { createContext, useContext, useMemo, useState } from 'react';
import { walletApi } from '../lib/api';
import { isEvmAddress } from '../lib/morph';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const value = useMemo(
    () => ({
      address,
      balance,
      isConnected: Boolean(address),
      isLoadingBalance,
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
      },
      refreshBalance: async (targetAddress = address) => {
        if (!targetAddress) {
          return null;
        }

        setIsLoadingBalance(true);
        try {
          const nextBalance = await walletApi.getBalance(targetAddress);
          setBalance(nextBalance);
          return nextBalance;
        } finally {
          setIsLoadingBalance(false);
        }
      },
    }),
    [address, balance, isLoadingBalance]
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
