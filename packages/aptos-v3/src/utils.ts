import { MoveValue } from '@aptos-labs/ts-sdk';
import {
  movementMainnetClient,
  Network,
} from '@interest-protocol/movement-core-sdk';
import { BigNumberUtils } from '@interest-protocol/v3-core';
import { pathOr } from 'ramda';

import { ConstructorArgs, InterestLpResource, Tick } from './dex.types';

export const getDefaultConstructorArgs = (): ConstructorArgs => {
  return {
    client: movementMainnetClient,
    network: Network.BARDOCK,
  };
};

export const formatInterestLpResource = (resource: InterestLpResource) => {
  return {
    burnRef: resource.burn_ref.inner.vec[0].self,
    feeGrowthInside0LastX64: resource.fee_growth_inside_0_last_x64,
    feeGrowthInside1LastX64: resource.fee_growth_inside_1_last_x64,
    liquidity: resource.liquidity,
    pool: resource.pool,
    propertyMapMutatorRef: resource.property_map_mutator_ref.self,
    rewards: resource.rewards.data.map((reward) => ({
      growthInsideLastX64: reward.growth_inside_last_x64,
      rewardsOwed: reward.rewards_owed,
    })),
    tickLower: BigNumberUtils.fromI32(resource.tick_lower.value.toString()),
    tickUpper: BigNumberUtils.fromI32(resource.tick_upper.value.toString()),
    tokenMutatorRef: resource.token_mutator_ref.self,
    tokensOwed0: resource.tokens_owed_0,
    tokensOwed1: resource.tokens_owed_1,
  };
};

export const parseTicks = (ticks: MoveValue[]): Tick[] => {
  return ticks.map((tick) => ({
    feeGrowthOutside0X64: pathOr('0', ['fee_growth_outside_0_x64'], tick),
    feeGrowthOutside1X64: pathOr('0', ['fee_growth_outside_1_x64'], tick),
    initialized: pathOr(false, ['initialized'], tick),
    liquidityGross: pathOr('0', ['liquidity_gross'], tick),
    liquidityNet: BigNumberUtils.fromI256(
      pathOr('0', ['liquidity_net', 'value'], tick)
    ).toString(),
    rewardGrowthsOutsideX64: pathOr([], ['reward_growths_outside_x64'], tick),
    secondsOutside: pathOr('0', ['seconds_outside'], tick),
    secondsPerLiquidityOutsideX64: pathOr(
      '0',
      ['seconds_per_liquidity_outside_x64'],
      tick
    ),
    tickCumulativeOutside: BigNumberUtils.fromI256(
      pathOr('0', ['tick_cumulative_outside', 'value'], tick)
    ).toString(),
    value: BigNumberUtils.fromI32(
      pathOr('0', ['value', 'value'], tick)
    ).toString(),
  }));
};
