import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const farmingPools = pgTable("farming_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "LP" or "Single"
  contractAddress: text("contract_address").notNull().unique(),
  tokenA: text("token_a").notNull(),
  tokenB: text("token_b"), // null for single asset pools
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  tvl: decimal("tvl", { precision: 20, scale: 2 }).default('0'),
  isActive: boolean("is_active").default(true),
  rewardTokenAddress: text("reward_token_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStakes = pgTable("user_stakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  poolId: varchar("pool_id").references(() => farmingPools.id).notNull(),
  stakedAmount: decimal("staked_amount", { precision: 20, scale: 8 }).notNull(),
  pendingRewards: decimal("pending_rewards", { precision: 20, scale: 8 }).default('0'),
  lastRewardUpdate: timestamp("last_reward_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  poolId: varchar("pool_id").references(() => farmingPools.id),
  type: text("type").notNull(), // "stake", "unstake", "claim"
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  txHash: text("tx_hash").unique(),
  status: text("status").notNull().default('pending'), // "pending", "confirmed", "failed"
  gasUsed: decimal("gas_used", { precision: 20, scale: 8 }),
  gasFee: decimal("gas_fee", { precision: 20, scale: 8 }),
  blockNumber: integer("block_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const networkStats = pgTable("network_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chainId: integer("chain_id").notNull(),
  gasPrice: decimal("gas_price", { precision: 20, scale: 8 }).notNull(),
  blockNumber: integer("block_number").notNull(),
  totalValueLocked: decimal("total_value_locked", { precision: 20, scale: 2 }).default('0'),
  activeFarms: integer("active_farms").default(0),
  totalFarmers: integer("total_farmers").default(0),
  avgApy: decimal("avg_apy", { precision: 5, scale: 2 }).default('0'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFarmingPoolSchema = createInsertSchema(farmingPools).omit({
  id: true,
  createdAt: true,
});

export const insertUserStakeSchema = createInsertSchema(userStakes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNetworkStatsSchema = createInsertSchema(networkStats).omit({
  id: true,
  updatedAt: true,
});

// API request schemas
export const stakeRequestSchema = z.object({
  poolId: z.string(),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number"
  }),
});

export const unstakeRequestSchema = z.object({
  poolId: z.string(),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number"
  }),
});

export const claimRequestSchema = z.object({
  poolId: z.string(),
});

export const walletConnectionSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  signature: z.string(),
  message: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFarmingPool = z.infer<typeof insertFarmingPoolSchema>;
export type FarmingPool = typeof farmingPools.$inferSelect;

export type InsertUserStake = z.infer<typeof insertUserStakeSchema>;
export type UserStake = typeof userStakes.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertNetworkStats = z.infer<typeof insertNetworkStatsSchema>;
export type NetworkStats = typeof networkStats.$inferSelect;

export type StakeRequest = z.infer<typeof stakeRequestSchema>;
export type UnstakeRequest = z.infer<typeof unstakeRequestSchema>;
export type ClaimRequest = z.infer<typeof claimRequestSchema>;
export type WalletConnectionRequest = z.infer<typeof walletConnectionSchema>;
