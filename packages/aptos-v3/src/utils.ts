import {
  movementMainnetClient,
  Network,
} from '@interest-protocol/movement-core-sdk';
import { BigNumberUtils } from '@interest-protocol/v3-core';

import { ConstructorArgs, InterestLpResource } from './dex.types';

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
