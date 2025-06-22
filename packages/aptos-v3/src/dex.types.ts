import { Aptos, Network as AptosNetwork } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

export interface ConstructorArgs {
  client?: Aptos;
  network?: Network | AptosNetwork.TESTNET;
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
  faAMetadata: string;
  faBMetadata: string;
  amountA: bigint;
  amountB: bigint;
  fee: number;
  sqrtPriceX64: bigint;
  lowerTick: number;
  upperTick: number;
  rewards_tick_spacing_multiplier?: number;
  minFAAmount?: bigint;
  minFBAmount?: bigint;
  recipient: string;
}

export interface NewLPAndAddLiquidityFAsArgs {
  faAMetadata: string;
  faBMetadata: string;
  amountA: bigint;
  amountB: bigint;
  lowerTick: number;
  upperTick: number;
  fee: number;
  minFAAmount?: bigint;
  minFBAmount?: bigint;
  recipient: string;
}

export interface AddLiquidityFAsArgs {
  interestLp: string;
  amount0: bigint;
  amount1: bigint;
  minFAAmount?: bigint;
  minFBAmount?: bigint;
  recipient: string;
}

export interface RemoveLiquidityFAsArgs {
  interestLp: string;
  liquidity: bigint;
  minFAAmount?: bigint;
  minFBAmount?: bigint;
  recipient: string;
}

export interface SwapFAsArgs {
  pool: string;
  faInMetadata: string;
  amountIn: bigint;
  sqrtPriceLimitX64: bigint;
  minAmountOut: bigint;
  recipient: string;
}
