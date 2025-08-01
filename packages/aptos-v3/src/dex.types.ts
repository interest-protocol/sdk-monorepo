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

export interface NewPoolAndLiquidityFasArgs {
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

export interface NewLPAndAddLiquidityFasArgs {
  pool: string;
  amount0: bigint;
  amount1: bigint;
  lowerTick: number;
  upperTick: number;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface AddLiquidityFasArgs {
  interestLp: string;
  amount0: bigint;
  amount1: bigint;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface SwapFaArgs {
  pool: string;
  faInMetadata: string;
  amountIn: bigint;
  sqrtPriceLimitX64?: bigint;
  minAmountOut?: bigint;
  recipient: string;
}

export interface AddLiquidityFasArgs {
  interestLp: string;
  amount0: bigint;
  amount1: bigint;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface DecreaseLiquidityFasArgs {
  interestLp: string;
  liquidity: bigint;
  minFa0Amount?: bigint;
  minFa1Amount?: bigint;
  recipient: string;
}

export interface CollectFeesArgs {
  interestLp: string;
  amount0Max?: bigint;
  amount1Max?: bigint;
  recipient: string;
}

export interface CollectRewardArgs {
  interestLp: string;
  reward: string;
  recipient: string;
}

export interface CollectProtocolFeeArgs {
  pool: string;
  recipient: string;
}

export interface InitializeRewardArgs {
  pool: string;
  reward: string;
  amount: bigint;
  emissionsPerSecond: number;
}

export interface AddRewardArgs {
  pool: string;
  reward: string;
  amount: bigint;
}

export interface UpdateEmissionsPerSecondArgs {
  pool: string;
  reward: string;
  emissionsPerSecond: number;
}

export interface UpdateEndTimestampArgs {
  pool: string;
  reward: string;
  endTimestamp: number;
}

export interface PendingFeesArgs {
  pool: string;
  interestLp: string;
}

export interface GetTicksArgs {
  pool: string;
  firstTick: number;
  numberOfTicks: number;
}

export interface InterestLpReward {
  growth_inside_last_x64: string;
  rewards_owed: string;
}

export interface Tick {
  feeGrowthOutside0X64: string;
  feeGrowthOutside1X64: string;
  initialized: boolean;
  liquidityGross: string;
  liquidityNet: string;
  rewardGrowthsOutsideX64: string[];
  secondsOutside: string;
  secondsPerLiquidityOutsideX64: string;
  tickCumulativeOutside: string;
  value: string;
}

export interface InterestLpResource {
  burn_ref: {
    inner: {
      vec: [
        {
          self: string;
        },
      ];
    };
    self: {
      vec: [];
    };
  };
  fee_growth_inside_0_last_x64: string;
  fee_growth_inside_1_last_x64: string;
  liquidity: string;
  pool: string;
  property_map_mutator_ref: {
    self: string;
  };
  rewards: {
    data: InterestLpReward[];
  };
  tick_lower: {
    value: number;
  };
  tick_upper: {
    value: number;
  };
  token_mutator_ref: {
    self: string;
  };
  tokens_owed_0: string;
  tokens_owed_1: string;
}
