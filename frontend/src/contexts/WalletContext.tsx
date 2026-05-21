import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { isAddress } from "viem";

type WalletContextValue = {
  address?: string;
  isConnected: boolean;
  connectWithAddress: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);
const STORAGE_KEY = "morph-payments.walletAddress";

export function WalletProvider({ children }: PropsWithChildren) {
  const [address, setAddress] = useState<string | undefined>();

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      isConnected: Boolean(address),
      connectWithAddress: async (nextAddress: string) => {
        if (!isAddress(nextAddress)) {
          throw new Error("Invalid wallet address");
        }

        setAddress(nextAddress);
        await AsyncStorage.setItem(STORAGE_KEY, nextAddress);
      },
      disconnect: async () => {
        setAddress(undefined);
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    }),
    [address]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return context;
}
