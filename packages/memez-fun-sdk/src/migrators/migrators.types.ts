import type {
  MaybeTx,
  ObjectInput,
  U64,
} from '@interest-protocol/sui-core-sdk';
import { TransactionResult } from '@mysten/sui/transactions';

export interface XPumpSetRewardValueArgs extends MaybeTx {
  rewardValue: U64;
}

export interface XPumpSetTreasuryArgs extends MaybeTx {
  treasury: string;
}

export interface XPumpSetInitializePriceArgs extends MaybeTx {
  price: U64;
}

export interface XPumpSetTreasuryFeeArgs extends MaybeTx {
  fee: number;
}

export interface XPumpMigrateArgs extends MaybeTx {
  migrator: TransactionResult;
  memeCoinType: string;
  feeCoinType: string;
  ipxMemeCoinTreasury: string;
  feeCoin: ObjectInput;
}

export interface XPumpCollectFeeArgs extends MaybeTx {
  bluefinPool: string;
  memeCoinType: string;
  positionOwner: ObjectInput;
}

export interface XPumpMigrateToExistingPoolArgs extends MaybeTx {
  pool: string;
  ipxMemeCoinTreasury: string;
  memeCoinType: string;
  migrator: TransactionResult;
}

export interface XPumpGetPositionsArgs {
  owner: string;
  cursor?: string | null | undefined;
  limit?: number | null | undefined;
}

export interface XPumpTreasuryCollectFeeArgs extends MaybeTx {
  bluefinPool: string;
  memeCoinType: string;
}
