import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BlockchainService } from "./services/blockchain";
import { Web3Service } from "./services/web3";
import { 
  stakeRequestSchema, 
  unstakeRequestSchema, 
  claimRequestSchema,
  walletConnectionSchema,
  insertTransactionSchema
} from "@shared/schema";
import { BlockchainConfig } from "./types/blockchain";
import { z } from "zod";

// Initialize blockchain services
const blockchainConfig: BlockchainConfig = {
  rpcUrl: process.env.INTUITION_RPC_URL || 'https://testnet.rpc.intuition.systems/http',
  chainId: 13579,
  networkName: 'Intuition Testnet'
};

const blockchainService = new BlockchainService(blockchainConfig);
let web3Service: Web3Service;

// Helper function to get user from session/auth
const getUserFromRequest = async (req: any): Promise<{ userId: string; walletAddress?: string } | null> => {
  // In production, this would get user from session/JWT token
  // For now, we'll expect wallet address in headers for demonstration
  const walletAddress = req.headers['x-wallet-address'] as string;
  if (!walletAddress) {
    return null;
  }

  let user = await storage.getUserByWalletAddress(walletAddress);
  if (!user) {
    // Create user if not exists
    user = await storage.createUser({
      username: `user_${walletAddress.slice(-8)}`,
      password: 'temp', // In production, this would be handled by proper auth
      walletAddress
    });
  }

  return { userId: user.id, walletAddress: user.walletAddress || undefined };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Web3 service
  web3Service = await blockchainService.getWeb3Service();

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", network: blockchainConfig.networkName });
  });

  // Get network information
  app.get("/api/network", async (req, res) => {
    try {
      const [stats, blockNumber, gasPrice] = await Promise.all([
        storage.getNetworkStats(),
        web3Service.getBlockNumber(),
        web3Service.getGasPrice()
      ]);

      if (stats) {
        // Update real-time data
        await storage.updateNetworkStats({
          chainId: stats.chainId,
          gasPrice,
          blockNumber,
          totalValueLocked: stats.totalValueLocked,
          activeFarms: stats.activeFarms,
          totalFarmers: stats.totalFarmers,
          avgApy: stats.avgApy
        });
      }

      const updatedStats = await storage.getNetworkStats();
      res.json(updatedStats);
    } catch (error) {
      console.error('Error getting network info:', error);
      res.status(500).json({ message: "Failed to get network information" });
    }
  });

  // Wallet connection endpoint
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { address, signature, message } = walletConnectionSchema.parse(req.body);
      
      // Validate wallet address
      const isValid = await web3Service.validateAddress(address);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid wallet address" });
      }

      // In production, verify signature here
      // const isSignatureValid = await verifySignature(address, signature, message);
      
      let user = await storage.getUserByWalletAddress(address);
      if (!user) {
        user = await storage.createUser({
          username: `user_${address.slice(-8)}`,
          password: 'temp',
          walletAddress: address
        });
      }

      // Get user balance
      const balance = await web3Service.getBalance(address);

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          walletAddress: user.walletAddress 
        }, 
        balance 
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to connect wallet" });
    }
  });

  // Get user balance
  app.get("/api/wallet/balance", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user || !user.walletAddress) {
        return res.status(401).json({ message: "Wallet not connected" });
      }

      const balance = await web3Service.getBalance(user.walletAddress);
      res.json({ balance });
    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(500).json({ message: "Failed to get balance" });
    }
  });

  // Get all farming pools
  app.get("/api/pools", async (req, res) => {
    try {
      const pools = await storage.getAllActiveFarmingPools();
      
      // Enrich with real-time data from blockchain
      const enrichedPools = await Promise.all(
        pools.map(async (pool) => {
          try {
            const stats = await blockchainService.getPoolStats(pool.contractAddress);
            return {
              ...pool,
              tvl: stats.totalStaked,
              apy: stats.apy
            };
          } catch (error) {
            console.warn(`Failed to get stats for pool ${pool.id}:`, error);
            return pool;
          }
        })
      );

      res.json(enrichedPools);
    } catch (error) {
      console.error('Error getting pools:', error);
      res.status(500).json({ message: "Failed to get farming pools" });
    }
  });

  // Get user stakes
  app.get("/api/stakes", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const stakes = await storage.getUserStakes(user.userId);
      
      // Enrich with real-time blockchain data
      const enrichedStakes = await Promise.all(
        stakes.map(async (stake) => {
          try {
            const pool = await storage.getFarmingPool(stake.poolId);
            if (!pool || !user.walletAddress) return stake;

            const [stakedAmount, pendingRewards] = await Promise.all([
              blockchainService.getUserStakedAmount(pool.contractAddress, user.walletAddress),
              blockchainService.getUserPendingRewards(pool.contractAddress, user.walletAddress)
            ]);

            // Update storage with latest data
            await storage.updateStakeAmount(stake.id, stakedAmount);
            await storage.updatePendingRewards(stake.id, pendingRewards);

            return {
              ...stake,
              stakedAmount,
              pendingRewards,
              pool
            };
          } catch (error) {
            console.warn(`Failed to get blockchain data for stake ${stake.id}:`, error);
            return stake;
          }
        })
      );

      res.json(enrichedStakes);
    } catch (error) {
      console.error('Error getting user stakes:', error);
      res.status(500).json({ message: "Failed to get user stakes" });
    }
  });

  // Stake tokens
  app.post("/api/stake", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user || !user.walletAddress) {
        return res.status(401).json({ message: "Wallet not connected" });
      }

      const { poolId, amount } = stakeRequestSchema.parse(req.body);
      
      const pool = await storage.getFarmingPool(poolId);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }

      // Validate transaction on blockchain
      await blockchainService.validateStakeTransaction(
        pool.contractAddress,
        user.walletAddress,
        amount,
        pool.tokenA
      );

      // Estimate gas
      const gasEstimate = await blockchainService.estimateStakeGas(
        pool.contractAddress,
        amount,
        user.walletAddress
      );

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.userId,
        poolId,
        type: 'stake',
        amount,
        status: 'pending'
      });

      res.json({ 
        transactionId: transaction.id,
        gasEstimate,
        message: "Transaction prepared. Please sign in your wallet."
      });

    } catch (error) {
      console.error('Error staking tokens:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to stake tokens" 
      });
    }
  });

  // Unstake tokens
  app.post("/api/unstake", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user || !user.walletAddress) {
        return res.status(401).json({ message: "Wallet not connected" });
      }

      const { poolId, amount } = unstakeRequestSchema.parse(req.body);
      
      const pool = await storage.getFarmingPool(poolId);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }

      // Validate transaction on blockchain
      await blockchainService.validateUnstakeTransaction(
        pool.contractAddress,
        user.walletAddress,
        amount
      );

      // Estimate gas
      const gasEstimate = await blockchainService.estimateUnstakeGas(
        pool.contractAddress,
        amount,
        user.walletAddress
      );

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.userId,
        poolId,
        type: 'unstake',
        amount,
        status: 'pending'
      });

      res.json({ 
        transactionId: transaction.id,
        gasEstimate,
        message: "Transaction prepared. Please sign in your wallet."
      });

    } catch (error) {
      console.error('Error unstaking tokens:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to unstake tokens" 
      });
    }
  });

  // Claim rewards
  app.post("/api/claim", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user || !user.walletAddress) {
        return res.status(401).json({ message: "Wallet not connected" });
      }

      const { poolId } = claimRequestSchema.parse(req.body);
      
      const pool = await storage.getFarmingPool(poolId);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }

      // Check if user has pending rewards
      const pendingRewards = await blockchainService.getUserPendingRewards(
        pool.contractAddress,
        user.walletAddress
      );

      if (parseFloat(pendingRewards) === 0) {
        return res.status(400).json({ message: "No rewards to claim" });
      }

      // Estimate gas
      const gasEstimate = await blockchainService.estimateClaimGas(
        pool.contractAddress,
        user.walletAddress
      );

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.userId,
        poolId,
        type: 'claim',
        amount: pendingRewards,
        status: 'pending'
      });

      res.json({ 
        transactionId: transaction.id,
        gasEstimate,
        rewardAmount: pendingRewards,
        message: "Transaction prepared. Please sign in your wallet."
      });

    } catch (error) {
      console.error('Error claiming rewards:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to claim rewards" 
      });
    }
  });

  // Update transaction status (called by frontend after wallet interaction)
  app.post("/api/transaction/update", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { transactionId, txHash, status } = z.object({
        transactionId: z.string(),
        txHash: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'failed'])
      }).parse(req.body);

      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.userId !== user.userId) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (txHash) {
        // Wait for transaction confirmation
        try {
          const receipt = await web3Service.waitForTransaction(txHash);
          await storage.updateTransactionStatus(
            txHash,
            receipt.status,
            receipt.blockNumber,
            receipt.gasUsed,
            receipt.gasFee
          );
        } catch (error) {
          await storage.updateTransactionStatus(txHash, 'failed');
        }
      } else {
        // Update status without waiting for blockchain
        await storage.updateTransactionStatus(transaction.txHash || '', status);
      }

      res.json({ message: "Transaction status updated" });

    } catch (error) {
      console.error('Error updating transaction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Get user transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getUserTransactions(user.userId, limit);
      
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  // Get portfolio summary
  app.get("/api/portfolio", async (req, res) => {
    try {
      const user = await getUserFromRequest(req);
      if (!user || !user.walletAddress) {
        return res.status(401).json({ message: "Wallet not connected" });
      }

      const stakes = await storage.getUserStakes(user.userId);
      
      let totalStaked = 0;
      let totalRewards = 0;
      let pendingRewards = 0;

      for (const stake of stakes) {
        const pool = await storage.getFarmingPool(stake.poolId);
        if (!pool) continue;

        try {
          const [stakedAmount, pending] = await Promise.all([
            blockchainService.getUserStakedAmount(pool.contractAddress, user.walletAddress!),
            blockchainService.getUserPendingRewards(pool.contractAddress, user.walletAddress!)
          ]);

          totalStaked += parseFloat(stakedAmount);
          pendingRewards += parseFloat(pending);
        } catch (error) {
          console.warn(`Failed to get data for pool ${pool.id}:`, error);
        }
      }

      // Get completed reward transactions to calculate total rewards earned
      const claimTransactions = await storage.getUserTransactions(user.userId, 100);
      totalRewards = claimTransactions
        .filter(tx => tx.type === 'claim' && tx.status === 'confirmed')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      const portfolio = {
        totalStaked: totalStaked.toFixed(2),
        totalRewards: totalRewards.toFixed(2),
        pendingRewards: pendingRewards.toFixed(2),
        totalValue: (totalStaked + totalRewards + pendingRewards).toFixed(2)
      };

      res.json(portfolio);
    } catch (error) {
      console.error('Error getting portfolio:', error);
      res.status(500).json({ message: "Failed to get portfolio data" });
    }
  });

  // Get farming statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const [tvl, totalFarmers, avgApy, activeFarms] = await Promise.all([
        storage.getTotalValueLocked(),
        storage.getTotalFarmers(),
        storage.getAverageAPY(),
        storage.getAllActiveFarmingPools().then(pools => pools.length)
      ]);

      const stats = {
        tvl: `$${parseFloat(tvl).toLocaleString()}`,
        activeFarms,
        totalFarmers,
        avgApy: `${avgApy}%`
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  // Start blockchain event listeners
  const startEventListeners = async () => {
    try {
      const pools = await storage.getAllActiveFarmingPools();
      await blockchainService.startEventListeners(pools, (eventType, data) => {
        console.log(`Blockchain event: ${eventType}`, data);
        // Handle blockchain events here (update storage, notify users, etc.)
      });
    } catch (error) {
      console.error('Failed to start event listeners:', error);
    }
  };

  // Initialize event listeners
  startEventListeners();

  const httpServer = createServer(app);

  // Cleanup on server shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await blockchainService.stopEventListeners();
    httpServer.close();
  });

  return httpServer;
}
