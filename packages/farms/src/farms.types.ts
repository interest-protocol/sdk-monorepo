import { Network, U64 } from '@interest-protocol/sui-core-sdk';
import { MaybeTx, ObjectInput } from '@interest-protocol/sui-core-sdk';
import {
  TransactionObjectArgument,
  TransactionResult,
} from '@mysten/sui/dist/cjs/transactions';

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
  totalStakedAmount: bigint;
}

export interface SetRewardsPerSecondArgs extends MaybeTx {
  farm: InterestFarm | string;
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

export interface PauseArgs extends MaybeTx {
  farm: InterestFarm | string;
  adminWitness: ObjectInput;
}

export interface UnpauseArgs extends MaybeTx {
  farm: InterestFarm | string;
  adminWitness: ObjectInput;
}

export interface SetEndTimeArgs extends MaybeTx {
  farm: InterestFarm | string;
  endTime: U64;
  adminWitness: ObjectInput;
  rewardType: string;
}

export interface AddRewardArgs extends MaybeTx {
  farm: InterestFarm | string;
  rewardType: string;
  rewardCoin: ObjectInput;
}

export interface NewAccountArgs extends MaybeTx {
  farm: InterestFarm | string;
}

export interface InterestAccount {
  objectId: string;
  objectType: string;
  farm: string;
  stakeBalance: bigint;
  stakeCoinType: string;
  rewards: Record<string, bigint>;
  rewardDebts: Record<string, bigint>;
}

export interface DestroyAccountArgs extends MaybeTx {
  account: ObjectInput;
  stakeCoinType: string;
}

export interface StakeArgs extends MaybeTx {
  farm: InterestFarm | string;
  account: InterestAccount | string;
  depositCoin: ObjectInput;
}

export interface StakeUncheckedArgs extends MaybeTx {
  farm: InterestFarm | string;
  account: TransactionResult | TransactionObjectArgument;
  depositCoin: ObjectInput;
}

export interface UnstakeArgs extends MaybeTx {
  farm: InterestFarm | string;
  account: InterestAccount | string;
  amount: U64;
}

export interface UnstakeUncheckedArgs extends MaybeTx {
  farm: InterestFarm | string;
  account: TransactionResult | TransactionObjectArgument;
  amount: U64;
}

export interface HarvestArgs extends MaybeTx {
  farm: InterestFarm | string;
  account: InterestAccount | string;
  rewardType: string;
}
