import { defineChain, type Address } from "viem";
import { env } from "./env.js";

export const morphChain = defineChain({
  id: env.MORPH_CHAIN_ID,
  name: env.MORPH_CHAIN_ID === 2818 ? "Morph Mainnet" : "Morph Hoodi Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [env.MORPH_RPC_URL]
    }
  },
  blockExplorers: {
    default: {
      name: "Morph Explorer",
      url: env.MORPH_EXPLORER_URL
    }
  }
});

export const USDC_ADDRESS = env.MORPH_USDC_ADDRESS as Address;

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }]
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "ok", type: "bool" }]
  }
] as const;
