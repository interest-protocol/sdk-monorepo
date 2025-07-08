import {
  MaybeTx,
  OwnedObject,
  SharedObject,
  U64,
} from '@interest-protocol/sui-core-sdk';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';

export interface SdkConstructorArgs {
  fullNodeUrl?: string;
}

interface AdminGated {
  admin: string;
}

export interface NewArgs extends MaybeTx, AdminGated {
  xType: string;
  yType: string;
  virtualLiquidity: U64;
}

export interface ShareArgs {
  tx: Transaction;
  pool: TransactionResult;
}

export interface SetFeeXArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  feeX: U64;
}

export interface SetFeeYArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  feeY: U64;
}

export interface SetMaxUpdateDelayMsArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  maxUpdateDelayMs: U64;
}

export interface SetMaxPricesArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  maxPriceX: U64;
  maxPriceY: U64;
  minPriceX: U64;
  minPriceY: U64;
}

export interface PauseXtoYArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
}

export interface PauseYtoXArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
}

export interface UnpauseXtoYArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
}

export interface UnpauseYtoXArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
}

export interface AddBlacklistArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  address: string;
}

export interface RemoveBlacklistArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  address: string;
}

export interface DepositArgs extends MaybeTx, AdminGated {
  pool: TidePool | string;
  coinX: OwnedObject;
  coinY: OwnedObject;
}

export interface WithdrawArgs extends MaybeTx, AdminGated {
  pool: TidePool | string;
  amountX: U64;
  amountY: U64;
}

interface Price {
  max: bigint;
  min: bigint;
  value: bigint;
}

export interface SetPricesArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  priceX: U64;
  priceY: U64;
}

export interface SetVirtualXLiquidityArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  virtualLiquidityX: U64;
}

export interface SwapArgs extends MaybeTx {
  pool: TidePool | string;
  amount: U64;
  xToY: boolean;
}

export interface QuoteArgs {
  pool: TidePool | string;
  amount: U64;
  xToY: boolean;
}

export interface TidePool {
  objectId: string;
  version: string;
  digest: string;
  decimalsX: bigint;
  decimalsY: bigint;
  feeX: bigint;
  feeY: bigint;
  lastUpdateMs: bigint;
  maxUpdateDelayMs: bigint;
  paused: boolean;
  priceX: Price;
  priceY: Price;
  poolVersion: number;
  virtualXLiquidity: bigint;
  coinXType: string;
  coinYType: string;
}
