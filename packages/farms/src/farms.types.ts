import { Network } from '@interest-protocol/sui-core-sdk';
import { MaybeTx, ObjectInput } from '@interest-protocol/sui-core-sdk';

export interface SdkConstructorArgs {
  fullNodeUrl: string;
  network: Network;
}

export interface NewFarmArgs extends MaybeTx {
  adminWitness: ObjectInput;
  stakeCoinType: string;
  adminWitnessType: string;
  rewardTypes: string[];
  decimals: ObjectInput;
}

export interface GetDecimalsArgs extends MaybeTx {
  coinType: string;
  isCurrency: boolean;
}

export interface Reward {
  end: bigint;
  rewards: bigint;
  rewardsPerSecond: bigint;
  lastRewardTimestamp: bigint;
  accruedRewardsPerShare: bigint;
}

export interface InterestFarm {
  objectId: string;
  objectType: string;
  rewardTypes: string[];
  precision: bigint;
  paused: boolean;
  adminType: string;
  rewardData: Record<string, Reward>;
  stakeCoinType: string;
}

export interface SetRewardsPerSecondArgs extends MaybeTx {
  farmId: string | InterestFarm;
  rewardType: string;
  rewardsPerSecond: bigint;
  adminWitness: ObjectInput;
}

export interface RewardDataNativeType {
  type: string;
  fields: {
    key: {
      type: string;
      fields: {
        name: string;
      };
    };
    value: {
      type: string;
      fields: {
        accrued_rewards_per_share: string;
        end: string;
        last_reward_timestamp: string;
        rewards: string;
        rewards_per_second: string;
      };
    };
  };
}
