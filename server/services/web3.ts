import { ethers } from 'ethers';
import { BlockchainConfig, TokenInfo, GasEstimate, TransactionReceipt } from '../types/blockchain';

export class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }

  async getProvider(): Promise<ethers.JsonRpcProvider> {
    return this.provider;
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        this.provider
      );

      const balance = await tokenContract.balanceOf(walletAddress);
      const decimals = await tokenContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || '0', 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw new Error('Failed to get gas price');
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting block number:', error);
      throw new Error('Failed to get block number');
    }
  }

  async estimateGas(
    contractAddress: string,
    abi: any[],
    methodName: string,
    params: any[],
    fromAddress: string
  ): Promise<GasEstimate> {
    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      const gasLimit = await contract[methodName].estimateGas(...params, { from: fromAddress });
      const feeData = await this.provider.getFeeData();
      
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const estimatedCost = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedCost: ethers.formatEther(estimatedCost)
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  async waitForTransaction(txHash: string): Promise<TransactionReceipt> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasFee: (receipt.gasUsed * (receipt.gasPrice || BigInt(0))).toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw new Error('Failed to get transaction receipt');
    }
  }

  async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    return new ethers.Contract(address, abi, this.provider);
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw new Error('Failed to get network information');
    }
  }
}

// Farming Pool ABI - This would typically be imported from a generated file
export const FARMING_POOL_ABI = [
  'function stake(uint256 amount) external',
  'function unstake(uint256 amount) external',
  'function claimRewards() external',
  'function getStakedAmount(address user) view returns (uint256)',
  'function getPendingRewards(address user) view returns (uint256)',
  'function totalStaked() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 reward)'
];

// ERC20 Token ABI
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];
