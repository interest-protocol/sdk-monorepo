import {
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

interface MaybeTx {
  tx?: Transaction;
}

export interface NewArgs extends MaybeTx, AdminGated {
  xType: string;
  yType: string;
  virtualLiquidity: U64;
  feedX: string;
  feedY: string;
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

export interface SetPauseXtoYArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  paused: boolean;
}

export interface SetPauseYtoXArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  paused: boolean;
}

export interface SetMaxAgeArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  maxAge: U64;
}

export interface SetMaxDeviationPercentageArgs extends MaybeTx, AdminGated {
  pool: SharedObject;
  maxDeviationPercentage: U64;
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
  coinXType: string;
  coinYType: string;
  decimalsX: bigint;
  decimalsY: bigint;
  feeX: bigint;
  feeY: bigint;
  maxAge: number;
  maxDeviationPercentage: bigint;
  virtualXLiquidity: bigint;
  xyPaused: boolean;
  yxPaused: boolean;
  feedX: string;
  feedY: string;
  packageVersion: number;
}

export interface CalculateRebalanceActionArgs {
  currentAmount: bigint;
  desiredAmount: bigint;
  threshold: bigint;
}

export interface ShouldRebalanceArgs {
  desiredAmount: bigint;
  pool: string;
  thresholdBasisPoints: bigint;
}
