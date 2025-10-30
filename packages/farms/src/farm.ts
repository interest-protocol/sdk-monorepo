import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import invariant from 'tiny-invariant';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import {
  SdkConstructorArgs,
  GetDecimalsArgs,
  SetRewardsPerSecondArgs,
} from './farms.types';
import { Network, SuiCoreSDK } from '@interest-protocol/sui-core-sdk';
import { SuiClient } from '@mysten/sui/client';
import { PACKAGES, Modules } from './constants';
import { getSdkDefaultArgs, toInterestFarm, toInterestAccount } from './utils';
import {
  NewFarmArgs,
  PauseArgs,
  UnpauseArgs,
  SetEndTimeArgs,
  AddRewardArgs,
  NewAccountArgs,
  DestroyAccountArgs,
  StakeArgs,
  UnstakeArgs,
  HarvestArgs,
  InterestAccount,
} from './farms.types';
import BigNumber from 'bignumber.js';

export class FarmsSDK extends SuiCoreSDK {
  packages: (typeof PACKAGES)[Network];
  modules = Modules;

  rpcUrl: string;
  network: Network;

  client: SuiClient;

  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super();

    const data = {
      ...getSdkDefaultArgs(),
      ...args,
    };

    invariant(
      data.fullNodeUrl,
      'You must provide fullNodeUrl for this specific network'
    );

    invariant(
      data.network,
      'You must provide network for this specific network'
    );

    invariant(
      data.network === Network.MAINNET,
      'Farms SDK 1.0.0 is only supported on mainnet'
    );

    this.rpcUrl = data.fullNodeUrl;
    this.network = data.network;
    this.packages = PACKAGES[data.network];
    this.client = new SuiClient({ url: data.fullNodeUrl });
  }

  public newFarm({
    adminWitness,
    stakeCoinType,
    adminWitnessType,
    rewardTypes,
    tx = new Transaction(),
    decimals,
  }: NewFarmArgs) {
    rewardTypes = [...new Set(rewardTypes)];

    invariant(
      rewardTypes.length > 0,
      'Farms must have at least one reward type'
    );

    const farmRequest = tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'request_new_farm',
      arguments: [
        this.ownedObject(tx, decimals),
        this.ownedObject(tx, adminWitness),
      ],
      typeArguments: [
        normalizeStructTag(stakeCoinType),
        normalizeStructTag(adminWitnessType),
      ],
    });

    rewardTypes.forEach((rewardType) => {
      tx.moveCall({
        package: this.packages.INTEREST_FARM.latest,
        module: this.modules.FARM,
        function: 'register_reward',
        arguments: [farmRequest],
        typeArguments: [
          normalizeStructTag(stakeCoinType),
          normalizeStructTag(rewardType),
        ],
      });
    });

    const farm = tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'new_farm',
      arguments: [farmRequest],
      typeArguments: [normalizeStructTag(stakeCoinType)],
    });

    tx.moveCall({
      package: SUI_FRAMEWORK_ADDRESS,
      module: 'transfer',
      function: 'public_share_object',
      arguments: [farm],
      typeArguments: [
        `${this.packages.INTEREST_FARM.original}::${this.modules.FARM}::InterestFarm<${normalizeStructTag(stakeCoinType)}>`,
      ],
    });

    return {
      tx,
    };
  }

  public async getDecimals({
    coinType,
    isCurrency,
    tx = new Transaction(),
  }: GetDecimalsArgs) {
    const metadata = await this.client.getCoinMetadata({
      coinType: normalizeStructTag(coinType),
    });

    invariant(metadata?.id, 'Coin metadata not found');

    const decimals = tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: isCurrency ? 'currency_decimals' : 'coin_metadata_decimals',
      arguments: [tx.object(metadata.id)],
      typeArguments: [normalizeStructTag(coinType)],
    });

    return {
      tx,
      decimals,
    };
  }

  public async setRewardsPerSecond({
    farm,
    rewardType,
    adminWitness,
    rewardsPerSecond,
    tx = new Transaction(),
  }: SetRewardsPerSecondArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;

    invariant(
      farm.rewardTypes.includes(normalizeStructTag(rewardType)),
      `Reward type ${rewardType} not found in farm ${farm.objectId}`
    );

    if (
      normalizeStructTag(rewardType) === normalizeStructTag(farm.stakeCoinType)
    ) {
      tx.moveCall({
        package: this.packages.INTEREST_FARM_UTILS.latest,
        module: this.modules.FARM_UTILS,
        function: 'set_rewards_per_second',
        arguments: [
          tx.object(farm.objectId),
          tx.object.clock(),
          this.ownedObject(tx, adminWitness),
          tx.pure.u64(rewardsPerSecond),
        ],
        typeArguments: [
          normalizeStructTag(farm.stakeCoinType),
          normalizeStructTag(farm.adminType),
        ],
      });
    } else {
      tx.moveCall({
        package: this.packages.INTEREST_FARM.latest,
        module: this.modules.FARM,
        function: 'set_rewards_per_second',
        arguments: [
          tx.object(farm.objectId),
          tx.object.clock(),
          this.ownedObject(tx, adminWitness),
          tx.pure.u64(rewardsPerSecond),
        ],
        typeArguments: [
          normalizeStructTag(farm.stakeCoinType),
          normalizeStructTag(rewardType),
          normalizeStructTag(farm.adminType),
        ],
      });
    }

    return { tx };
  }

  public async getFarm(farmId: string) {
    const farm = await this.client.getObject({
      id: farmId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    return toInterestFarm(farm);
  }

  public async pause({
    farm,
    adminWitness,
    tx = new Transaction(),
  }: PauseArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;

    tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'pause',
      arguments: [tx.object(farm.objectId), this.ownedObject(tx, adminWitness)],
      typeArguments: [
        normalizeStructTag(farm.stakeCoinType),
        normalizeStructTag(farm.adminType),
      ],
    });

    return { tx };
  }

  public async unpause({
    farm,
    adminWitness,
    tx = new Transaction(),
  }: UnpauseArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;

    tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'unpause',
      arguments: [tx.object(farm.objectId), this.ownedObject(tx, adminWitness)],
      typeArguments: [
        normalizeStructTag(farm.stakeCoinType),
        normalizeStructTag(farm.adminType),
      ],
    });

    return { tx };
  }

  public async setEndTime({
    farm,
    endTime,
    adminWitness,
    rewardType,
    tx = new Transaction(),
  }: SetEndTimeArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;

    invariant(
      farm.rewardTypes.includes(normalizeStructTag(rewardType)),
      `Reward type ${rewardType} not found in farm ${farm.objectId}`
    );

    if (
      normalizeStructTag(rewardType) === normalizeStructTag(farm.stakeCoinType)
    ) {
      tx.moveCall({
        package: this.packages.INTEREST_FARM_UTILS.latest,
        module: this.modules.FARM_UTILS,
        function: 'set_end_time',
        arguments: [
          tx.object(farm.objectId),
          tx.object.clock(),
          this.ownedObject(tx, adminWitness),
          tx.pure.u64(Math.floor(+endTime.toString())),
        ],
        typeArguments: [
          normalizeStructTag(farm.stakeCoinType),
          normalizeStructTag(farm.adminType),
        ],
      });
    } else {
      tx.moveCall({
        package: this.packages.INTEREST_FARM.latest,
        module: this.modules.FARM,
        function: 'set_end_time',
        arguments: [
          tx.object(farm.objectId),
          tx.object.clock(),
          this.ownedObject(tx, adminWitness),
          tx.pure.u64(Math.floor(+endTime.toString())),
        ],
        typeArguments: [
          normalizeStructTag(farm.stakeCoinType),
          normalizeStructTag(rewardType),
          normalizeStructTag(farm.adminType),
        ],
      });
    }

    return { tx };
  }

  public async addReward({
    farm,
    rewardType,
    rewardCoin,
    tx = new Transaction(),
  }: AddRewardArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;

    invariant(
      farm.rewardTypes.includes(normalizeStructTag(rewardType)),
      `Reward type ${rewardType} not found in farm ${farm.objectId}`
    );

    if (
      normalizeStructTag(rewardType) === normalizeStructTag(farm.stakeCoinType)
    ) {
      tx.moveCall({
        package: this.packages.INTEREST_FARM_UTILS.latest,
        module: this.modules.FARM_UTILS,
        function: 'add_reward',
        arguments: [
          tx.object(farm.objectId),
          tx.object.clock(),
          this.ownedObject(tx, rewardCoin),
        ],
        typeArguments: [normalizeStructTag(farm.stakeCoinType)],
      });
    } else {
      tx.moveCall({
        package: this.packages.INTEREST_FARM.latest,
        module: this.modules.FARM,
        function: 'add_reward',
        arguments: [
          tx.object(farm.objectId),
          tx.object.clock(),
          this.ownedObject(tx, rewardCoin),
        ],
        typeArguments: [
          normalizeStructTag(farm.stakeCoinType),
          normalizeStructTag(rewardType),
        ],
      });
    }

    return { tx };
  }

  public async newAccount({ farm, tx = new Transaction() }: NewAccountArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;

    const account = tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'new_account',
      arguments: [tx.object(farm.objectId)],
      typeArguments: [normalizeStructTag(farm.stakeCoinType)],
    });

    return { tx, account };
  }

  public async getAccounts(owner: string) {
    const data = [];
    let hasNextPage = true;
    let cursor = null;
    const accounts = await this.client.getOwnedObjects({
      owner,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        Package: this.packages.INTEREST_FARM.original,
      },
      limit: 50,
      cursor,
    });

    data.push(...accounts.data);

    hasNextPage = accounts.hasNextPage;
    cursor = accounts.nextCursor;

    while (hasNextPage) {
      const nextPage = await this.client.getOwnedObjects({
        owner,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          Package: this.packages.INTEREST_FARM.original,
        },
        cursor,
        limit: 50,
      });

      data.push(...nextPage.data);
      hasNextPage = nextPage.hasNextPage;
      cursor = nextPage.nextCursor;
    }

    return data.map((x) => toInterestAccount(x));
  }

  public async idToInterestAccount(ids: string[]) {
    const objects = await this.client.multiGetObjects({
      ids,
      options: {
        showContent: true,
        showType: true,
      },
    });

    return objects.map((x) => toInterestAccount(x));
  }

  public async destroyAccount({
    account,
    stakeCoinType,
    tx = new Transaction(),
  }: DestroyAccountArgs) {
    tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'destroy_account',
      arguments: [this.ownedObject(tx, account)],
      typeArguments: [normalizeStructTag(stakeCoinType)],
    });

    return { tx };
  }

  public async stake({
    farm,
    account,
    depositCoin,
    tx = new Transaction(),
  }: StakeArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;
    account =
      typeof account === 'string'
        ? toInterestAccount(
            await this.client.getObject({
              id: account,
              options: {
                showContent: true,
                showType: true,
              },
            })
          )
        : account;

    invariant(
      account.farm === farm.objectId,
      `Account ${account.objectId} is not associated with farm ${farm.objectId}`
    );

    tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'stake',
      arguments: [
        tx.object(account.objectId),
        tx.object(farm.objectId),
        tx.object.clock(),
        this.ownedObject(tx, depositCoin),
      ],
      typeArguments: [normalizeStructTag(farm.stakeCoinType)],
    });

    return { tx };
  }

  public async unstake({
    farm,
    account,
    amount,
    tx = new Transaction(),
  }: UnstakeArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;
    account =
      typeof account === 'string'
        ? toInterestAccount(
            await this.client.getObject({
              id: account,
              options: {
                showContent: true,
                showType: true,
              },
            })
          )
        : account;

    invariant(
      account.farm === farm.objectId,
      `Account ${account.objectId} is not associated with farm ${farm.objectId}`
    );

    const amountBigInt = BigInt(
      new BigNumber(amount.toString()).integerValue().toString()
    );

    invariant(amountBigInt > 0n, 'Amount must be greater than 0');
    invariant(
      amountBigInt <= account.stakeBalance,
      'Amount must be less than or equal to account balance'
    );

    const unstakeCoin = tx.moveCall({
      package: this.packages.INTEREST_FARM.latest,
      module: this.modules.FARM,
      function: 'unstake',
      arguments: [
        tx.object(account.objectId),
        tx.object(farm.objectId),
        tx.object.clock(),
        tx.pure.u64(amountBigInt),
      ],
      typeArguments: [normalizeStructTag(farm.stakeCoinType)],
    });

    return { tx, unstakeCoin };
  }

  public async harvest({
    farm,
    account,
    rewardType,
    tx = new Transaction(),
  }: HarvestArgs) {
    farm = typeof farm === 'string' ? await this.getFarm(farm) : farm;
    account =
      typeof account === 'string'
        ? toInterestAccount(
            await this.client.getObject({
              id: account,
              options: {
                showContent: true,
                showType: true,
              },
            })
          )
        : account;

    invariant(
      account.farm === farm.objectId,
      `Account ${account.objectId} is not associated with farm ${farm.objectId}`
    );

    const rewardCoin =
      normalizeStructTag(rewardType) !== normalizeStructTag(farm.stakeCoinType)
        ? tx.moveCall({
            package: this.packages.INTEREST_FARM.latest,
            module: this.modules.FARM,
            function: 'harvest',
            arguments: [
              tx.object(account.objectId),
              tx.object(farm.objectId),
              tx.object.clock(),
            ],
            typeArguments: [
              normalizeStructTag(farm.stakeCoinType),
              normalizeStructTag(rewardType),
            ],
          })
        : tx.moveCall({
            package: this.packages.INTEREST_FARM_UTILS.latest,
            module: this.modules.FARM_UTILS,
            function: 'harvest',
            arguments: [
              tx.object(account.objectId),
              tx.object(farm.objectId),
              tx.object.clock(),
            ],
            typeArguments: [normalizeStructTag(farm.stakeCoinType)],
          });

    return { tx, rewardCoin };
  }

  public async multiAccountPendingRewards(accounts: InterestAccount[]) {
    const tx = new Transaction();

    accounts.forEach((account) => {
      const rewards = Object.keys(account.rewards);

      rewards.forEach((rewardType) => {
        tx.moveCall({
          package: this.packages.INTEREST_FARM.latest,
          module: this.modules.FARM,
          function: 'pending_rewards',
          arguments: [
            tx.object(account.objectId),
            tx.object(account.farm),
            tx.object.clock(),
          ],
          typeArguments: [
            normalizeStructTag(account.stakeCoinType),
            normalizeStructTag(rewardType),
          ],
        });
      });
    });

    const allRewards = accounts
      .map((account) => Object.keys(account.rewards))
      .flat();

    const result = await devInspectAndGetReturnValues(
      this.client,
      tx,
      allRewards.map(() => [bcs.U64])
    );

    return accounts.map((account) => {
      const r = result.splice(0, Object.keys(account.rewards).length);

      return {
        account: account.objectId,

        rewards: allRewards
          .splice(0, Object.keys(account.rewards).length)
          .map((rewardType, index) => ({
            rewardType: rewardType,
            amount: BigInt(r[index]![0] as string),
          })),
      };
    });
  }

  public async pendingRewards(account: InterestAccount | string) {
    account =
      typeof account === 'string'
        ? toInterestAccount(
            await this.client.getObject({
              id: account,
              options: {
                showContent: true,
                showType: true,
              },
            })
          )
        : account;

    const tx = new Transaction();

    const rewards = Object.keys(account.rewards);

    rewards.forEach((rewardType) => {
      tx.moveCall({
        package: this.packages.INTEREST_FARM.latest,
        module: this.modules.FARM,
        function: 'pending_rewards',
        arguments: [
          tx.object(account.objectId),
          tx.object(account.farm),
          tx.object.clock(),
        ],
        typeArguments: [
          normalizeStructTag(account.stakeCoinType),
          normalizeStructTag(rewardType),
        ],
      });
    });

    const result = await devInspectAndGetReturnValues(
      this.client,
      tx,
      rewards.map(() => [bcs.U64])
    );

    return result.map(([pendingReward], index) => ({
      rewardType: rewards[index]!,
      amount: BigInt(pendingReward as string),
    }));
  }
}
