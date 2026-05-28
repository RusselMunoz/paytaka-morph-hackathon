import {
  MORPH_CHAIN_ID,
  MORPH_EXPLORER_URL,
  MORPH_RPC_URL,
  MORPH_USDC_ADDRESS,
} from './config';

export const morphChain = {
  id: MORPH_CHAIN_ID,
  name: MORPH_CHAIN_ID === 2818 ? 'Morph Mainnet' : 'Morph Hoodi Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrl: MORPH_RPC_URL,
  explorerUrl: MORPH_EXPLORER_URL,
};

export const usdcAddress = MORPH_USDC_ADDRESS;

export const isEvmAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value ?? '');

export const shortAddress = (address) => {
  if (!address) {
    return '';
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
