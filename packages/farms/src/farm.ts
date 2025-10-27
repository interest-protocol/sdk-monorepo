import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import { SdkConstructorArgs, GetDecimalsArgs } from './farms.types';
import { Network, SuiCoreSDK } from '@interest-protocol/sui-core-sdk';
import { SuiClient } from '@mysten/sui/client';
import { PACKAGES, Modules } from './constants';
import { getSdkDefaultArgs, toInterestFarm } from './utils';
import { NewFarmArgs } from './farms.types';

export class FarmsSDK extends SuiCoreSDK {
  packages: (typeof PACKAGES)[Network];
  modules = Modules;

  rpcUrl: string;
  network: Network;

  client: SuiClient;

  defaultSupply = 1_000_000_000_000_000_000n;

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
    authWitness,
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
        this.ownedObject(tx, authWitness),
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
}
