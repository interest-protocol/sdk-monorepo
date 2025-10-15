import {
  MaybeTx,
  ObjectInput,
  StructTag,
  U64,
} from '@interest-protocol/sui-core-sdk';
import { ObjectRef, Transaction } from '@mysten/sui/transactions';

import {
  ConfigKey,
  MemezPool,
  MigratorWitness,
  PumpState,
} from './memez.types';

export interface NewPumpPoolArgs extends MaybeTx {
  memeCoinTreasuryCap: string | ObjectRef;
  creationSuiFee?: ObjectInput;
  totalSupply?: U64;
  isProtected?: boolean;
  developer: string;
  firstPurchase?: ObjectInput;
  metadata?: Record<string, string>;
  configurationKey: ConfigKey;
  migrationWitness: MigratorWitness | string;
  stakeHolders?: string[];
  quoteCoinType: string | StructTag;
  burnTax?: number;
  virtualLiquidity: U64;
  targetQuoteLiquidity: U64;
  liquidityProvision?: number;
}

export interface NewPumpPoolWithDevRevenueShareArgs extends MaybeTx {
  memeCoinTreasuryCap: string | ObjectRef;
  creationSuiFee?: ObjectInput;
  totalSupply?: U64;
  isProtected?: boolean;
  metadata?: Record<string, string>;
  configurationKey: ConfigKey;
  migrationWitness: MigratorWitness | string;
  quoteCoinType: string | StructTag;
  burnTax?: number;
  virtualLiquidity: U64;
  targetQuoteLiquidity: U64;
  liquidityProvision?: number;
}

export interface NewUncheckedPumpPoolArgs extends NewPumpPoolArgs {
  coinMetadataId: string;
  memeCoinType: string;
}

export interface PumpArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  quoteCoin: ObjectInput;
  referrer?: string | null;
  signature?: Uint8Array | null;
  minAmountOut?: U64;
}

export interface InternalPumpArgs {
  tx: Transaction;
  pool: MemezPool<PumpState>;
  quoteCoin: ObjectInput;
  referrer: string | null;
  signature: Uint8Array | null;
  minAmountOut: U64;
}

export interface DumpArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  memeCoin: ObjectInput;
  minAmountOut?: U64;
  referrer?: string | null;
}

export interface InternalDumpArgs {
  tx: Transaction;
  pool: MemezPool<PumpState>;
  memeCoin: ObjectInput;
  minAmountOut: U64;
  referrer: string | null;
}

export interface QuoteArgs {
  pool: string | MemezPool<PumpState>;
  amount: U64;
}

export interface QuotePumpReturnValues {
  memeAmountOut: bigint;
  quoteFee: bigint;
  memeFee: bigint;
}

export interface QuoteDumpReturnValues {
  quoteAmountOut: bigint;
  quoteFee: bigint;
  memeFee: bigint;
  burnFee: bigint;
}

export interface DistributeStakeHoldersAllocationArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
}

export interface GetMetadataCapsArgs {
  owner: string;
  nextCursor?: string | null;
  limit?: number;
}

export interface MetadataCap {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  ipxTreasury: string;
  coinType: string;
}

export interface UpdateMetadataArgs extends MaybeTx {
  metadataCap: MetadataCap;
  value: string;
}

export interface BurnMemeArgs extends MaybeTx {
  ipxTreasury: string;
  memeCoin: ObjectInput;
  coinType: string;
}

export interface UpdatePoolMetadataArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  newMetadata: Record<string, string>;
  metadataCap: string;
  fieldsToRemove?: string[];
}

export interface CalculateAmountInArgs {
  amountOut: bigint;
  balanceIn: bigint;
  balanceOut: bigint;
}

export interface GetAmountInArgs {
  amountOut: bigint;
  virtualLiquidity: bigint;
  liquidityProvisionBps: number;
  allocationBps: number;
  totalSupply: bigint;
  memeSwapFeeBps: number;
  quoteSwapFeeBps: number;
  quoteReferrerFeeBps: number;
  memeReferrerFeeBps: number;
}
