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

export interface XPumpMigrateWithLiquidityArgs extends MaybeTx {
  migrator: TransactionResult;
  memeCoinType: string;
  feeCoinType: string;
  ipxMemeCoinTreasury: string;
  feeCoin: ObjectInput;
  liquidity: U64;
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

export interface XPumpNewPositionOwnerArgs extends MaybeTx {
  memeCoinType: string;
}

export interface XPumpUpdatePositionOwnerArgs extends MaybeTx {
  newPositionOwner: string;
  memeCoinType: string;
}

export interface XPumpPositionOwner {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  memeCoinType: string;
  blueFinPoolId: string;
  blueFinPositionId: string;
}
