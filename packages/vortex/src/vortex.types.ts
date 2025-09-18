import { SuiClient } from '@mysten/sui/client';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';

export enum Pool {
  // 0.1 Sui
  shrimp = 100_000_000,
  // 1 Sui
  dolphin = 1_000_000_000,
  // 10 Sui
  whale = 10_000_000_000,
}

export enum Modules {
  vortex = 'vortex',
  proof = 'vortex_proof',
  merkleTree = 'vortex_merkle_tree',
}

export interface SharedObject {
  objectId: string;
  initialSharedVersion: string;
}

export interface VortexPools {
  [Pool.shrimp]: SharedObject;
  [Pool.dolphin]: SharedObject;
  [Pool.whale]: SharedObject;
}

export interface SdkConstructorArgs {
  client: SuiClient;
  packageId: string;
  pools: VortexPools;
}

export interface AdminSdkConstructorArgs {
  packageId: string;
  adminCap: string;
}

export interface DepositArgs {
  tx?: Transaction;
  commitment: bigint;
  pool: Pool;
}

export interface WithdrawArgs {
  tx?: Transaction;
  pool: Pool;
  proofPointsHex: string;
  root: bigint;
  nullifier: bigint;
  recipient: string;
  relayer: string;
  relayerFee: bigint;
}

export interface NewPoolArgs {
  tx?: Transaction;
  pool: Pool;
}

export interface SharePoolArgs {
  tx: Transaction;
  pool: TransactionResult;
}

export interface SetDepositFeeArgs {
  tx?: Transaction;
  pool: TransactionResult | string;
  fee: bigint;
}

export interface SetWithdrawFeeArgs {
  tx?: Transaction;
  pool: TransactionResult | string;
  fee: bigint;
}

export interface SetGroth16VkArgs {
  tx?: Transaction;
  pool: TransactionResult | string;
  vk: string;
}
