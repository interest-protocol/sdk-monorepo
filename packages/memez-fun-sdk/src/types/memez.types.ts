import type {
  MaybeTx,
  Network,
  ObjectInput,
  StructTag,
  U64,
} from '@interest-protocol/sui-core-sdk';

import type { CONFIG_KEYS, MIGRATOR_WITNESSES } from '../constants';
import type { SHARED_OBJECTS } from '../constants';

export interface PackageValues {
  original: string;
  latest: string;
}

export type MemezFunSharedObjects = (typeof SHARED_OBJECTS)[Network];

export interface SdkConstructorArgs {
  fullNodeUrl: string;
  network: Network;
}

export type ConfigKey =
  (typeof CONFIG_KEYS)[Network][keyof (typeof CONFIG_KEYS)[Network]];

export type MigratorWitness =
  (typeof MIGRATOR_WITNESSES)[Network][keyof (typeof MIGRATOR_WITNESSES)[Network]];

export interface MemezPool<T> {
  objectId: string;
  poolType: string;
  curveType: string;
  memeCoinType: string;
  quoteCoinType: string;
  publicKey: string | null;
  ipxMemeCoinTreasury: string;
  metadata: Record<string, string>;
  migrationWitness: string;
  progress: string;
  stateId: string;
  dynamicFieldDataId: string;
  curveState: T;
}

export interface Recipient {
  address: string;
  bps: number;
}

export interface Allocation {
  memeBalance: bigint;
  vestingPeriod: bigint;
  recipients: Recipient[];
}

export interface PumpState {
  devPurchase: bigint;
  liquidityProvision: bigint;
  migrationFee: number;
  virtualLiquidity: bigint;
  targetQuoteLiquidity: bigint;
  quoteBalance: bigint;
  memeBalance: bigint;
  burnTax: number;
  memeSwapFee: number;
  quoteSwapFee: number;
  allocation: Allocation;
  memeReferrerFee: number;
  quoteReferrerFee: number;
}

export type PumpPool = MemezPool<PumpState>;

export interface AddMigrationWitnessArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  migratorWitness: MigratorWitness | string;
}

export interface RemoveMigrationWitnessArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  migratorWitness: MigratorWitness | string;
}

export interface AddQuoteCoinArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  quoteCoinType: string | StructTag;
}

export interface RemoveQuoteCoinArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  quoteCoinType: string | StructTag;
}

export interface SetFeesArgs extends MaybeTx {
  authWitness: ObjectInput;
  configurationKey: ConfigKey;
  values: U64[][];
  recipients: string[][];
}

export interface RemoveConfigurationArgs extends MaybeTx {
  key: string;
  model: string;
  authWitness: ObjectInput;
}

export interface DevClaimArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
}

export interface MigrateArgs extends MaybeTx {
  pool: string | MemezPool<PumpState>;
}

export interface GetFeesArgs {
  configurationKey: ConfigKey;
}

export interface GetCurveDataArgs {
  configurationKey: ConfigKey;
  totalSupply: U64;
  quoteCoinType: string | StructTag;
}

export interface StableData {
  maxTargetQuoteLiquidity: bigint;
  liquidityProvision: bigint;
  memeSaleAmount: bigint;
}

export interface PumpData {
  burnTax: bigint;
  virtualLiquidity: bigint;
  targetQuoteLiquidity: bigint;
  liquidityProvision: bigint;
}

export interface GetMemeCoinMarketCapArgs {
  quoteBalance: bigint;
  virtualLiquidity: bigint;
  memeBalance: bigint;
  quoteUSDPrice: number;
  memeCoinTotalSupply?: bigint;
}

export interface GetPoolMetadataArgs {
  poolId: string;
  quoteCoinType: string | StructTag;
  memeCoinType: string | StructTag;
  curveType: string | StructTag;
}

export interface MakeMemezAclSdkArgs {
  network: Network;
  fullNodeUrl: string;
}

export interface SetPublicKeyArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  publicKey: Uint8Array;
}

export interface SetMemeReferrerFeeArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  fee: number;
}

export interface SetQuoteReferrerFeeArgs extends MaybeTx {
  authWitness: ObjectInput;
  configKey: ConfigKey;
  fee: number;
}
