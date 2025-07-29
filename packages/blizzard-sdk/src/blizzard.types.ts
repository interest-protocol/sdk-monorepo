import {
  MaybeTx,
  OwnedObject,
  PackageValues,
  SharedObject,
  SharedObjectRef,
  U64,
} from '@interest-protocol/sui-core-sdk';
import { ObjectRef, TransactionResult } from '@mysten/sui/transactions';
import { NestedResult } from '@polymedia/suitcase-core';

import type { TYPES } from './constants';

export interface GetMsUntilNextEpochArgs {
  currentEpoch: number;
  epochDurationMs: number;
  firstEpochStartTimestamp: number;
}

export type Package = Record<
  | 'WWAL'
  | 'BLIZZARD'
  | 'BLIZZARD_HOOKS'
  | 'WAL'
  | 'WALRUS'
  | 'BLIZZARD_UTILS'
  | 'UP_WAL'
  | 'BREAD_WAL'
  | 'PWAL'
  | 'NWAL'
  | 'MWAL'
  | 'TR_WAL',
  PackageValues & Record<string, string>
>;

export type SharedObjects = Record<
  | 'WWAL_COIN_METADATA'
  | 'BLIZZARD_AV'
  | 'BLIZZARD_ACL'
  | 'WALRUS_STAKING'
  | 'BLIZZARD_ACL',
  ({ mutable }: { mutable: boolean }) => SharedObjectRef
>;

export type OwnedObjects = Record<
  | 'WWAL_UPGRADE_CAP'
  | 'WWAL_SUPER_ADMIN'
  | 'BLIZZARD_UPGRADE_CAP'
  | 'BLIZZARD_SUPER_ADMIN'
  | 'BLIZZARD_PUBLISHER'
  | 'BLIZZARD_STAKE_NFT_PUBLISHER'
  | 'BLIZZARD_STAKE_NFT_DISPLAY'
  | 'HOOKS_UPGRADE_CAP'
  | 'BLIZZARD_UTILS_UPGRADE_CAP'
  | 'BLIZZARD_ADMIN'
  | 'WWAL_ADMIN'
  | 'PWAL_SUPER_ADMIN'
  | 'BREAD_WAL_SUPER_ADMIN'
  | 'NWAL_SUPER_ADMIN'
  | 'UP_WAL_SUPER_ADMIN'
  | 'MWAL_SUPER_ADMIN'
  | 'TR_WAL_SUPER_ADMIN',
  string
>;

export interface SignInArgs extends MaybeTx {
  admin: OwnedObject;
}

export interface SdkConstructorArgs {
  fullNodeUrl?: string;
  packages?: Package;
  sharedObjects?: SharedObjects;
  types?: typeof TYPES;
}

// === BLIZZARD LST START ===

export interface NewLSTArgs extends MaybeTx {
  treasuryCap: string | ObjectRef;
  superAdminRecipient: string;
  adminWitness: TransactionResult;
}

export interface MintArgs extends MaybeTx {
  walCoin: OwnedObject;
  nodeId: string;
  blizzardStaking: SharedObject;
}

export interface MintAfterVotesFinishedArgs extends MaybeTx {
  walCoin: OwnedObject;
  nodeId: string;
  blizzardStaking: SharedObject;
}

export interface BurnStakeNftArgs extends MaybeTx {
  nft: OwnedObject;
  blizzardStaking: SharedObject;
}

export interface BurnLstArgs extends MaybeTx {
  lstCoin: OwnedObject;
  withdrawIXs: NestedResult;
  blizzardStaking: SharedObject;
}

export interface TransmuteArgs extends MaybeTx {
  withdrawIXs: NestedResult;
  fromBlizzardStaking: SharedObject;
  fromCoin: OwnedObject;
}

export interface AddNodeArgs extends MaybeTx {
  nodeId: string;
  blizzardStaking: SharedObject;
  adminWitness: TransactionResult;
}

export interface RemoveNodeArgs extends MaybeTx {
  nodeId: string;
  blizzardStaking: SharedObject;
  adminWitness: TransactionResult;
}

export interface KeepStakeNftArgs extends MaybeTx {
  nft: TransactionResult;
}

export interface SyncExchangeRateArgs extends MaybeTx {
  blizzardStaking: SharedObject;
}

export interface LastEpochAprArgs {
  nodeId: string;
}

export interface FcfsArgs extends MaybeTx {
  blizzardStaking: SharedObject;
  value: U64;
}

export interface VectorTransferStakedWalArgs extends MaybeTx {
  vector: NestedResult;
  to: string;
}

export interface ToWalAtEpochArgs {
  blizzardStaking: SharedObject;
  epoch: number;
  value: U64;
}

export interface ToLstAtEpochArgs {
  blizzardStaking: SharedObject;
  epoch: number;
  value: U64;
}

export interface ViewFcfsArgs {
  value: U64;
  blizzardStaking: SharedObject;
}

// === BLIZZARD LST END ===

// === ACL Types Start ===

export type BlizzardAclArgs = (SdkConstructorArgs | null | undefined) & {
  acl: SharedObject;
};

export interface NewAdminArgs extends MaybeTx {
  superAdmin: OwnedObject;
  lstType?: string;
}

export interface NewAdminAndTransferArgs extends MaybeTx {
  superAdmin: OwnedObject;
  recipient: string;
  lstType?: string;
}

export interface RevokeAdminArgs extends MaybeTx {
  superAdmin: OwnedObject;
  admin: string;
  lstType?: string;
}

export interface SignInArgs extends MaybeTx {
  admin: OwnedObject;
  lstType?: string;
}

export interface DestroyAdminArgs extends MaybeTx {
  admin: OwnedObject;
  lstType?: string;
}

export interface DestroySuperAdminArgs extends MaybeTx {
  superAdmin: OwnedObject;
  lstType?: string;
}

export interface StartSuperAdminTransferArgs extends MaybeTx {
  superAdmin: OwnedObject;
  recipient: string;
  lstType?: string;
}

export interface FinishSuperAdminTransferArgs extends MaybeTx {
  superAdmin: OwnedObject;
  lstType?: string;
}

export interface IsAdminArgs {
  admin: string;
  lstType?: string;
}

export interface ClaimFeesArgs extends MaybeTx {
  adminWitness: TransactionResult;
  blizzardStaking: SharedObject;
}

export interface AddVersionArgs extends MaybeTx {
  version: number;
  adminWitness: TransactionResult;
}

export interface RemoveVersionArgs extends MaybeTx {
  version: number;
  adminWitness: TransactionResult;
}

// === ACL Types End ===

// === Update Metadata ===

export interface UpdateMetadataArgs extends MaybeTx {
  value: string;
  adminWitness: TransactionResult;
  blizzardStaking: SharedObject;
}

// === LBlizzard Staking ===

export interface FeeConfig {
  mint: U64;
  burn: U64;
  transmute: U64;
  protocol: U64;
}

export interface BlizzardStaking {
  objectId: string;
  type: string;
  paused: boolean;
  walFeeBalance: bigint;
  lstFeeBalance: bigint;
  totalWalDeposited: bigint;
  allowedNodes: string[];
  feeConfig: FeeConfig;
  lstSupply: bigint;
}
