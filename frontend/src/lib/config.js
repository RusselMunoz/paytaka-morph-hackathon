export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const API_WS_URL = process.env.EXPO_PUBLIC_API_WS_URL ?? 'ws://localhost:4000/ws';

export const MORPH_CHAIN_ID = Number(process.env.EXPO_PUBLIC_MORPH_CHAIN_ID ?? 2910);
export const MORPH_RPC_URL = process.env.EXPO_PUBLIC_MORPH_RPC_URL ?? 'https://rpc-hoodi.morph.network';
export const MORPH_EXPLORER_URL =
  process.env.EXPO_PUBLIC_MORPH_EXPLORER_URL ?? 'https://explorer-hoodi.morph.network';
export const MORPH_USDC_ADDRESS =
  process.env.EXPO_PUBLIC_MORPH_USDC_ADDRESS ?? '0x0000000000000000000000000000000000000000';
export const MORPH_USDT_ADDRESS =
  process.env.EXPO_PUBLIC_MORPH_USDT_ADDRESS ?? '0x0000000000000000000000000000000000000001';
