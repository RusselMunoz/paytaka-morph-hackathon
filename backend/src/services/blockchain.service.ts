import { createPublicClient, formatUnits, http, isAddress, parseUnits, type Address, type Hash } from "viem";
import { erc20Abi, morphChain, USDC_ADDRESS } from "../config/morph.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export class BlockchainService {
  private readonly publicClient = createPublicClient({
    chain: morphChain,
    transport: http(env.MORPH_RPC_URL)
  });

  getChainInfo() {
    return {
      chainId: morphChain.id,
      name: morphChain.name,
      rpcUrl: env.MORPH_RPC_URL,
      explorerUrl: env.MORPH_EXPLORER_URL,
      usdcAddress: USDC_ADDRESS
    };
  }

  async getUsdcBalance(address: string) {
    if (!isAddress(address)) {
      throw new AppError("Invalid wallet address", 400, "INVALID_ADDRESS");
    }

    const balance = await this.publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as Address]
    });

    return {
      raw: balance.toString(),
      formatted: formatUnits(balance, 6),
      tokenSymbol: "USDC"
    };
  }

  parseUsdc(amount: string) {
    return parseUnits(amount, 6);
  }

  async waitForReceipt(txHash: Hash) {
    return this.publicClient.waitForTransactionReceipt({ hash: txHash });
  }
}
