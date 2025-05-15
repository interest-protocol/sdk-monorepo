import {
  MaybeTx,
  ObjectInput,
  StructTag,
  U64,
} from '@interest-protocol/acl-sdk';
import { ObjectRef } from '@mysten/sui/transactions';

import {
  ConfigKey,
  MemezPool,
  MigratorWitness,
  StableState,
} from './memez.types';

export interface NewStablePoolArgs extends MaybeTx {
  memeCoinTreasuryCap: string | ObjectRef;
  creationSuiFee?: ObjectInput;
  targetQuoteLiquidity: U64;
  totalSupply?: U64;
  useTokenStandard?: boolean;
  metadata?: Record<string, string>;
  configurationKey: ConfigKey;
  migrationWitness: MigratorWitness;
  stakeHolders?: string[];
  quoteCoinType: string | StructTag;
  developer: string;
  developerAllocation: U64;
  vestingDurationMs: U64;
  liquidityProvision: number;
  memeSalePercentage: number;
}

export interface PumpArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
  quoteCoin: ObjectInput;
}

export interface PumpTokenArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
  quoteCoin: ObjectInput;
}

export interface DumpTokenArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
  memeToken: ObjectInput;
}

export interface DumpArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
  memeCoin: ObjectInput;
}

export interface QuoteArgs {
  pool: string | MemezPool<StableState>;
  amount: U64;
}

export interface QuotePumpReturnValues {
  excessQuoteAmount: bigint;
  memeAmountOut: bigint;
  quoteFee: bigint;
  memeFee: bigint;
}

export interface QuoteDumpReturnValues {
  quoteAmountOut: bigint;
  quoteFee: bigint;
  memeFee: bigint;
}

export interface MigrateArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
}

export interface DeveloperAllocationClaimArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
}

export interface DistributeStakeHoldersAllocationArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
}

export interface ToCoinArgs extends MaybeTx {
  pool: string | MemezPool<StableState>;
  memeToken: ObjectInput;
}
