import type { MaybeTx, U64 } from '@interest-protocol/sui-core-sdk';
import { TransactionResult } from '@mysten/sui/transactions';

export interface RecrdSetRewardValueArgs extends MaybeTx {
  rewardValue: U64;
}

export interface RecrdSetTreasuryArgs extends MaybeTx {
  treasury: string;
}

export interface RecrdSetInitializePriceArgs extends MaybeTx {
  price: U64;
}

export interface RecrdRegisterPoolArgs extends MaybeTx {
  memeCoinTreasuryCap: string;
}

export interface RecrdMigrateArgs extends MaybeTx {
  migrator: TransactionResult;
  memeCoinType: string;
  quoteCoinType: string;
  ipxMemeCoinTreasury: string;
}

export interface XPumpSetRewardValueArgs extends MaybeTx {
  rewardValue: U64;
}

export interface XPumpSetTreasuryArgs extends MaybeTx {
  treasury: string;
}

export interface XPumpSetInitializePriceArgs extends MaybeTx {
  price: U64;
}

export interface XPumpRegisterPoolArgs extends MaybeTx {
  memeCoinTreasuryCap: string;
}

export interface XPumpMigrateArgs extends MaybeTx {
  migrator: TransactionResult;
  memeCoinType: string;
  quoteCoinType: string;
  ipxMemeCoinTreasury: string;
}
