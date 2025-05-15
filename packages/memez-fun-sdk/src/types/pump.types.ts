import {
  MaybeTx,
  ObjectInput,
  StructTag,
  U64,
} from '@interest-protocol/sui-core-sdk';
import { ObjectRef } from '@mysten/sui/transactions';

import {
  ConfigKey,
  MemezPool,
  MigratorWitness,
  PumpState,
} from './memez.types';

export interface DevPurchaseData {
  developer: string;
  firstPurchase: ObjectInput;
}

export interface NewPumpPoolArgs extends MaybeTx {
  memeCoinTreasuryCap: string | ObjectRef;
  creationSuiFee?: ObjectInput;
  totalSupply?: U64;
  useTokenStandard?: boolean;
  devPurchaseData?: DevPurchaseData;
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

export interface NewUncheckedPumpPoolArgs extends NewPumpPoolArgs {
  coinMetadataId: string;
  memeCoinType: string;
}

export interface PumpArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  quoteCoin: ObjectInput;
  minAmountOut?: U64;
}

export interface PumpTokenArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  quoteCoin: ObjectInput;
  minAmountOut?: U64;
}

export interface DumpTokenArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  memeToken: ObjectInput;
  minAmountOut?: U64;
}

export interface DumpArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  memeCoin: ObjectInput;
  minAmountOut?: U64;
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

export interface ToCoinArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
  memeToken: ObjectInput;
}
