import { 
  type User, 
  type InsertUser, 
  type FarmingPool, 
  type InsertFarmingPool,
  type UserStake,
  type InsertUserStake,
  type Transaction,
  type InsertTransaction,
  type NetworkStats,
  type InsertNetworkStats
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface with all CRUD methods needed for farming operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;

  // Farming pool operations
  getFarmingPool(id: string): Promise<FarmingPool | undefined>;
  getFarmingPoolByContract(contractAddress: string): Promise<FarmingPool | undefined>;
  getAllActiveFarmingPools(): Promise<FarmingPool[]>;
  createFarmingPool(pool: InsertFarmingPool): Promise<FarmingPool>;
  updatePoolTVL(poolId: string, tvl: string): Promise<void>;
  updatePoolAPY(poolId: string, apy: string): Promise<void>;

  // User stake operations
  getUserStakes(userId: string): Promise<UserStake[]>;
  getUserStakeByPool(userId: string, poolId: string): Promise<UserStake | undefined>;
  createUserStake(stake: InsertUserStake): Promise<UserStake>;
  updateStakeAmount(stakeId: string, amount: string): Promise<void>;
  updatePendingRewards(stakeId: string, rewards: string): Promise<void>;
  deleteUserStake(stakeId: string): Promise<void>;

  // Transaction operations
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByHash(txHash: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(txHash: string, status: string, blockNumber?: number, gasUsed?: string, gasFee?: string): Promise<void>;

  // Network stats operations
  getNetworkStats(): Promise<NetworkStats | undefined>;
  updateNetworkStats(stats: InsertNetworkStats): Promise<NetworkStats>;

  // Analytics operations
  getTotalValueLocked(): Promise<string>;
  getTotalFarmers(): Promise<number>;
  getAverageAPY(): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private farmingPools: Map<string, FarmingPool>;
  private userStakes: Map<string, UserStake>;
  private transactions: Map<string, Transaction>;
  private networkStats: NetworkStats | undefined;

  constructor() {
    this.users = new Map();
    this.farmingPools = new Map();
    this.userStakes = new Map();
    this.transactions = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default farming pools
    const defaultPools: FarmingPool[] = [
      {
        id: 'pool-1',
        name: 'INTU-ETH LP',
        type: 'LP',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        tokenA: '0xINTU_TOKEN_ADDRESS',
        tokenB: '0xETH_TOKEN_ADDRESS',
        apy: '124.50',
        tvl: '486320.00',
        isActive: true,
        rewardTokenAddress: '0xINTU_TOKEN_ADDRESS',
        createdAt: new Date(),
      },
      {
        id: 'pool-2',
        name: 'INTU-USDC LP',
        type: 'LP',
        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        tokenA: '0xINTU_TOKEN_ADDRESS',
        tokenB: '0xUSDC_TOKEN_ADDRESS',
        apy: '89.20',
        tvl: '1234567.00',
        isActive: true,
        rewardTokenAddress: '0xINTU_TOKEN_ADDRESS',
        createdAt: new Date(),
      },
      {
        id: 'pool-3',
        name: 'INTU Single Stake',
        type: 'Single',
        contractAddress: '0x567890abcdef1234567890abcdef1234567890ab',
        tokenA: '0xINTU_TOKEN_ADDRESS',
        tokenB: null,
        apy: '67.80',
        tvl: '892150.00',
        isActive: true,
        rewardTokenAddress: '0xINTU_TOKEN_ADDRESS',
        createdAt: new Date(),
      }
    ];

    defaultPools.forEach(pool => {
      this.farmingPools.set(pool.id, pool);
    });

    // Initialize network stats
    this.networkStats = {
      id: 'network-stats-1',
      chainId: 13579,
      gasPrice: '12.00',
      blockNumber: 1234567,
      totalValueLocked: '2613037.00',
      activeFarms: 3,
      totalFarmers: 1247,
      avgApy: '93.83',
      updatedAt: new Date(),
    };
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === address,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      walletAddress: insertUser.walletAddress || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, walletAddress };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Farming pool operations
  async getFarmingPool(id: string): Promise<FarmingPool | undefined> {
    return this.farmingPools.get(id);
  }

  async getFarmingPoolByContract(contractAddress: string): Promise<FarmingPool | undefined> {
    return Array.from(this.farmingPools.values()).find(
      (pool) => pool.contractAddress === contractAddress,
    );
  }

  async getAllActiveFarmingPools(): Promise<FarmingPool[]> {
    return Array.from(this.farmingPools.values()).filter(pool => pool.isActive);
  }

  async createFarmingPool(insertPool: InsertFarmingPool): Promise<FarmingPool> {
    const id = randomUUID();
    const pool: FarmingPool = { 
      ...insertPool, 
      id,
      tokenB: insertPool.tokenB || null,
      tvl: insertPool.tvl || null,
      isActive: insertPool.isActive ?? true,
      createdAt: new Date(),
    };
    this.farmingPools.set(id, pool);
    return pool;
  }

  async updatePoolTVL(poolId: string, tvl: string): Promise<void> {
    const pool = this.farmingPools.get(poolId);
    if (pool) {
      this.farmingPools.set(poolId, { ...pool, tvl });
    }
  }

  async updatePoolAPY(poolId: string, apy: string): Promise<void> {
    const pool = this.farmingPools.get(poolId);
    if (pool) {
      this.farmingPools.set(poolId, { ...pool, apy });
    }
  }

  // User stake operations
  async getUserStakes(userId: string): Promise<UserStake[]> {
    return Array.from(this.userStakes.values()).filter(
      (stake) => stake.userId === userId,
    );
  }

  async getUserStakeByPool(userId: string, poolId: string): Promise<UserStake | undefined> {
    return Array.from(this.userStakes.values()).find(
      (stake) => stake.userId === userId && stake.poolId === poolId,
    );
  }

  async createUserStake(insertStake: InsertUserStake): Promise<UserStake> {
    const id = randomUUID();
    const stake: UserStake = { 
      ...insertStake, 
      id,
      pendingRewards: insertStake.pendingRewards || null,
      lastRewardUpdate: insertStake.lastRewardUpdate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userStakes.set(id, stake);
    return stake;
  }

  async updateStakeAmount(stakeId: string, amount: string): Promise<void> {
    const stake = this.userStakes.get(stakeId);
    if (stake) {
      this.userStakes.set(stakeId, { 
        ...stake, 
        stakedAmount: amount, 
        updatedAt: new Date() 
      });
    }
  }

  async updatePendingRewards(stakeId: string, rewards: string): Promise<void> {
    const stake = this.userStakes.get(stakeId);
    if (stake) {
      this.userStakes.set(stakeId, { 
        ...stake, 
        pendingRewards: rewards, 
        lastRewardUpdate: new Date(),
        updatedAt: new Date() 
      });
    }
  }

  async deleteUserStake(stakeId: string): Promise<void> {
    this.userStakes.delete(stakeId);
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByHash(txHash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.txHash === txHash,
    );
  }

  async getUserTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      status: insertTransaction.status || 'pending',
      poolId: insertTransaction.poolId || null,
      txHash: insertTransaction.txHash || null,
      blockNumber: insertTransaction.blockNumber || null,
      gasUsed: insertTransaction.gasUsed || null,
      gasFee: insertTransaction.gasFee || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(
    txHash: string, 
    status: string, 
    blockNumber?: number, 
    gasUsed?: string, 
    gasFee?: string
  ): Promise<void> {
    const transaction = Array.from(this.transactions.values()).find(
      (tx) => tx.txHash === txHash,
    );
    if (transaction) {
      const updated = { 
        ...transaction, 
        status, 
        blockNumber: blockNumber || null,
        gasUsed: gasUsed || null,
        gasFee: gasFee || null,
        updatedAt: new Date()
      };
      this.transactions.set(transaction.id, updated);
    }
  }

  // Network stats operations
  async getNetworkStats(): Promise<NetworkStats | undefined> {
    return this.networkStats;
  }

  async updateNetworkStats(stats: InsertNetworkStats): Promise<NetworkStats> {
    const id = this.networkStats?.id || randomUUID();
    this.networkStats = { 
      ...stats, 
      id,
      totalValueLocked: stats.totalValueLocked || null,
      activeFarms: stats.activeFarms || null,
      totalFarmers: stats.totalFarmers || null,
      avgApy: stats.avgApy || null,
      updatedAt: new Date() 
    };
    return this.networkStats;
  }

  // Analytics operations
  async getTotalValueLocked(): Promise<string> {
    const total = Array.from(this.farmingPools.values())
      .reduce((sum, pool) => sum + parseFloat(pool.tvl || '0'), 0);
    return total.toFixed(2);
  }

  async getTotalFarmers(): Promise<number> {
    const uniqueUserIds = new Set(
      Array.from(this.userStakes.values()).map(stake => stake.userId)
    );
    return uniqueUserIds.size;
  }

  async getAverageAPY(): Promise<string> {
    const activePools = Array.from(this.farmingPools.values()).filter(pool => pool.isActive);
    if (activePools.length === 0) return '0';
    
    const avgApy = activePools.reduce((sum, pool) => sum + parseFloat(pool.apy), 0) / activePools.length;
    return avgApy.toFixed(2);
  }
}

export const storage = new MemStorage();
