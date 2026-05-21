import { createPublicClient, defineChain, http } from "viem";

const chainId = Number(process.env.EXPO_PUBLIC_MORPH_CHAIN_ID ?? 2910);
const rpcUrl = process.env.EXPO_PUBLIC_MORPH_RPC_URL ?? "https://rpc-hoodi.morph.network";
const explorerUrl = process.env.EXPO_PUBLIC_MORPH_EXPLORER_URL ?? "https://explorer-hoodi.morph.network";

export const morphChain = defineChain({
  id: chainId,
  name: chainId === 2818 ? "Morph Mainnet" : "Morph Hoodi Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [rpcUrl]
    }
  },
  blockExplorers: {
    default: {
      name: "Morph Explorer",
      url: explorerUrl
    }
  }
});

export const publicClient = createPublicClient({
  chain: morphChain,
  transport: http(rpcUrl)
});

export const usdcAddress = process.env.EXPO_PUBLIC_MORPH_USDC_ADDRESS ?? "0x0000000000000000000000000000000000000000";
