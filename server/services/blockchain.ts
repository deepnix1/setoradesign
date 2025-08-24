import { ethers } from 'ethers';
import { Web3Service, FARMING_POOL_ABI, ERC20_ABI } from './web3';
import { BlockchainConfig, PoolStats, StakeEventData, UnstakeEventData, ClaimEventData } from '../types/blockchain';
import { FarmingPool } from '@shared/schema';

export class BlockchainService {
  private web3Service: Web3Service;
  private eventListeners: Map<string, ethers.Contract> = new Map();

  constructor(config: BlockchainConfig) {
    this.web3Service = new Web3Service(config);
  }

  async getWeb3Service(): Promise<Web3Service> {
    return this.web3Service;
  }

  async getUserStakedAmount(poolAddress: string, userAddress: string): Promise<string> {
    try {
      const contract = await this.web3Service.getContract(poolAddress, FARMING_POOL_ABI);
      const stakedAmount = await contract.getStakedAmount(userAddress);
      return ethers.formatEther(stakedAmount);
    } catch (error) {
      console.error('Error getting staked amount:', error);
      throw new Error('Failed to get staked amount');
    }
  }

  async getUserPendingRewards(poolAddress: string, userAddress: string): Promise<string> {
    try {
      const contract = await this.web3Service.getContract(poolAddress, FARMING_POOL_ABI);
      const pendingRewards = await contract.getPendingRewards(userAddress);
      return ethers.formatEther(pendingRewards);
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      throw new Error('Failed to get pending rewards');
    }
  }

  async getPoolStats(poolAddress: string): Promise<PoolStats> {
    try {
      const contract = await this.web3Service.getContract(poolAddress, FARMING_POOL_ABI);
      const totalStaked = await contract.totalStaked();
      const rewardRate = await contract.rewardRate();

      // Calculate APY based on reward rate and total staked
      const apy = totalStaked > 0 ? 
        (Number(ethers.formatEther(rewardRate)) * 365 * 24 * 3600 * 100) / Number(ethers.formatEther(totalStaked)) : 0;

      return {
        totalStaked: ethers.formatEther(totalStaked),
        totalRewards: '0', // This would need to be tracked separately
        apy: apy.toFixed(2),
        participants: 0 // This would need to be tracked separately
      };
    } catch (error) {
      console.error('Error getting pool stats:', error);
      throw new Error('Failed to get pool statistics');
    }
  }

  async validateStakeTransaction(
    poolAddress: string,
    userAddress: string,
    amount: string,
    tokenAddress: string
  ): Promise<boolean> {
    try {
      // Check user has sufficient balance
      const balance = await this.web3Service.getTokenBalance(tokenAddress, userAddress);
      if (parseFloat(balance) < parseFloat(amount)) {
        throw new Error('Insufficient token balance');
      }

      // Check token allowance
      const tokenContract = await this.web3Service.getContract(tokenAddress, ERC20_ABI);
      const allowance = await tokenContract.allowance(userAddress, poolAddress);
      const requiredAmount = ethers.parseEther(amount);

      if (allowance < requiredAmount) {
        throw new Error('Insufficient token allowance. Please approve tokens first.');
      }

      return true;
    } catch (error) {
      console.error('Error validating stake transaction:', error);
      throw error;
    }
  }

  async validateUnstakeTransaction(
    poolAddress: string,
    userAddress: string,
    amount: string
  ): Promise<boolean> {
    try {
      const stakedAmount = await this.getUserStakedAmount(poolAddress, userAddress);
      if (parseFloat(stakedAmount) < parseFloat(amount)) {
        throw new Error('Insufficient staked amount');
      }
      return true;
    } catch (error) {
      console.error('Error validating unstake transaction:', error);
      throw error;
    }
  }

  async estimateStakeGas(
    poolAddress: string,
    amount: string,
    userAddress: string
  ) {
    try {
      return await this.web3Service.estimateGas(
        poolAddress,
        FARMING_POOL_ABI,
        'stake',
        [ethers.parseEther(amount)],
        userAddress
      );
    } catch (error) {
      console.error('Error estimating stake gas:', error);
      throw new Error('Failed to estimate gas for stake transaction');
    }
  }

  async estimateUnstakeGas(
    poolAddress: string,
    amount: string,
    userAddress: string
  ) {
    try {
      return await this.web3Service.estimateGas(
        poolAddress,
        FARMING_POOL_ABI,
        'unstake',
        [ethers.parseEther(amount)],
        userAddress
      );
    } catch (error) {
      console.error('Error estimating unstake gas:', error);
      throw new Error('Failed to estimate gas for unstake transaction');
    }
  }

  async estimateClaimGas(
    poolAddress: string,
    userAddress: string
  ) {
    try {
      return await this.web3Service.estimateGas(
        poolAddress,
        FARMING_POOL_ABI,
        'claimRewards',
        [],
        userAddress
      );
    } catch (error) {
      console.error('Error estimating claim gas:', error);
      throw new Error('Failed to estimate gas for claim transaction');
    }
  }

  async startEventListeners(pools: FarmingPool[], onEvent: (eventType: string, data: any) => void) {
    try {
      for (const pool of pools) {
        const contract = await this.web3Service.getContract(pool.contractAddress, FARMING_POOL_ABI);
        
        // Listen for Staked events
        contract.on('Staked', (user: string, amount: bigint) => {
          const eventData: StakeEventData = {
            user,
            pool: pool.contractAddress,
            amount: ethers.formatEther(amount),
            timestamp: Date.now()
          };
          onEvent('Staked', eventData);
        });

        // Listen for Unstaked events
        contract.on('Unstaked', (user: string, amount: bigint) => {
          const eventData: UnstakeEventData = {
            user,
            pool: pool.contractAddress,
            amount: ethers.formatEther(amount),
            timestamp: Date.now()
          };
          onEvent('Unstaked', eventData);
        });

        // Listen for RewardsClaimed events
        contract.on('RewardsClaimed', (user: string, reward: bigint) => {
          const eventData: ClaimEventData = {
            user,
            pool: pool.contractAddress,
            reward: ethers.formatEther(reward),
            timestamp: Date.now()
          };
          onEvent('RewardsClaimed', eventData);
        });

        this.eventListeners.set(pool.contractAddress, contract);
      }

      console.log(`Started event listeners for ${pools.length} farming pools`);
    } catch (error) {
      console.error('Error starting event listeners:', error);
      throw new Error('Failed to start blockchain event listeners');
    }
  }

  async stopEventListeners() {
    try {
      for (const [address, contract] of Array.from(this.eventListeners.entries())) {
        contract.removeAllListeners();
        console.log(`Stopped event listener for pool: ${address}`);
      }
      this.eventListeners.clear();
    } catch (error) {
      console.error('Error stopping event listeners:', error);
    }
  }

  async getTokenInfo(tokenAddress: string) {
    try {
      const contract = await this.web3Service.getContract(tokenAddress, ERC20_ABI);
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      return { name, symbol, decimals };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw new Error('Failed to get token information');
    }
  }
}
