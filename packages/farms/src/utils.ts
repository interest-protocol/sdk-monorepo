import { SdkConstructorArgs } from './farms.types';
import { Network } from '@interest-protocol/sui-core-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiObjectResponse } from '@mysten/sui/client';
import { pathOr } from 'ramda';
import { InterestFarm, Reward, RewardDataNativeType } from './farms.types';
import { normalizeStructTag } from '@mysten/sui/utils';

export const getSdkDefaultArgs = (): SdkConstructorArgs => ({
  network: Network.MAINNET,
  fullNodeUrl: getFullnodeUrl('mainnet'),
});

function extractStakeCoinType(input: string) {
  const regex = /<(0x[a-f0-9]+::\w+::\w+)>/;
  const match = input.match(regex);
  return match ? match[1] : '';
}

export const toInterestFarm = (value: SuiObjectResponse): InterestFarm => {
  const rewardDataContent = pathOr(
    [] as RewardDataNativeType[],
    ['data', 'content', 'fields', 'reward_data', 'fields', 'contents'],
    value
  );

  return {
    objectId: pathOr('', ['data', 'objectId'], value),
    objectType: pathOr('', ['data', 'type'], value),
    stakeCoinType: extractStakeCoinType(pathOr('', ['data', 'type'], value))!,
    paused: pathOr(false, ['data', 'content', 'fields', 'paused'], value),
    adminType: normalizeStructTag(
      pathOr(
        '',
        ['data', 'content', 'fields', 'admin_type', 'fields', 'name'],
        value
      )
    ),
    rewardTypes: pathOr(
      [{ type: '', fields: [{ name: '' }] as any }],
      ['data', 'content', 'fields', 'rewards'],
      value
    ).map((rewardType) =>
      normalizeStructTag(rewardType.fields.name.toString())
    ),
    precision: BigInt(
      pathOr(0, ['data', 'content', 'fields', 'precision'], value)
    ),
    rewardData: rewardDataContent.reduce(
      (acc, rewardData: RewardDataNativeType) => {
        return {
          ...acc,
          [normalizeStructTag(rewardData.fields.key.fields.name)]: {
            end: BigInt(rewardData.fields.value.fields.end),
            rewards: BigInt(rewardData.fields.value.fields.rewards),
            rewardsPerSecond: BigInt(
              rewardData.fields.value.fields.rewards_per_second
            ),
            lastRewardTimestamp: BigInt(
              rewardData.fields.value.fields.last_reward_timestamp
            ),
            accruedRewardsPerShare: BigInt(
              rewardData.fields.value.fields.accrued_rewards_per_share
            ),
          },
        };
      },
      {} as Record<string, Reward>
    ),
  };
};
