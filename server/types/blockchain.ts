export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  networkName: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface PoolConfig {
  contractAddress: string;
  stakingToken: TokenInfo;
  rewardToken: TokenInfo;
  apy: string;
}

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  gasFee: string;
  status: 'success' | 'failed';
}

export interface StakeEventData {
  user: string;
  pool: string;
  amount: string;
  timestamp: number;
}

export interface UnstakeEventData {
  user: string;
  pool: string;
  amount: string;
  timestamp: number;
}

export interface ClaimEventData {
  user: string;
  pool: string;
  reward: string;
  timestamp: number;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCost: string;
}

export interface UserBalance {
  token: string;
  balance: string;
  decimals: number;
}

export interface PoolStats {
  totalStaked: string;
  totalRewards: string;
  apy: string;
  participants: number;
}
