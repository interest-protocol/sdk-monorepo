import { Aptos } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

export interface ConstructorArgs {
  client?: Aptos;
  network?: Network;
}

export interface SetProtocolFeeArgs {
  fee: number;
}

export interface AddFeeTickSpacingArgs {
  fee: number;
  tickSpacing: number;
}

export interface AddAdminArgs {
  admin: string;
}

export interface RemoveAdminArgs {
  admin: string;
}

export interface FaucetCreateArgs {
  name: string;
  symbol: string;
  decimals?: number;
}

export interface FaucetMintArgs {
  metadata: string;
  amount: bigint;
  recipient: string;
}

export interface FaucetMultiMintArgs {
  metadata: string;
  amounts: bigint[];
  recipients: string[];
}

// DEX functions

export interface NewPoolAndLiquidityFAsArgs {
  fa0Metadata: string;
  fa1Metadata: string;
  amount0: bigint;
  amount1: bigint;
  fee: number;
  lowerTick: number;
  upperTick: number;
  rewards_tick_spacing_multiplier?: number;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface NewLPAndAddLiquidityFAsArgs {
  fa0Metadata: string;
  fa1Metadata: string;
  amount0: bigint;
  amount1: bigint;
  lowerTick: number;
  upperTick: number;
  fee: number;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface AddLiquidityFAsArgs {
  interestLp: string;
  amount0: bigint;
  amount1: bigint;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface RemoveLiquidityFAsArgs {
  interestLp: string;
  liquidity: bigint;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface SwapFAArgs {
  pool: string;
  faInMetadata: string;
  amountIn: bigint;
  sqrtPriceLimitX64?: bigint;
  minAmountOut?: bigint;
  recipient: string;
}
