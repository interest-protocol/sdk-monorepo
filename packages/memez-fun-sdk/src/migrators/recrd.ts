import { Network } from '@interest-protocol/sui-core-sdk';
import { Transaction } from '@mysten/sui/transactions';
import { isValidSuiAddress } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { CETUS_GLOBAL_CONFIG, CETUS_POOLS } from '../constants';
import { MemezBaseSDK } from '../sdk';
import { SdkConstructorArgs } from '../types/memez.types';
import {
  RecrdMigrateArgs,
  RecrdRegisterPoolArgs,
  RecrdSetInitializePriceArgs,
  RecrdSetRewardValueArgs,
  RecrdSetTreasuryArgs,
} from './migrators.types';

export class RecrdMigratorSDK extends MemezBaseSDK {
  packageId =
    '0x682082068b8f1192f16a6074e107014d433e57ef839c7f9e3aea48f2d93a3ea2';

  adminId =
    '0xca3d834e9c872b2b3fc391ae1d4c2c27f95340ba36cd6762532872f1365b1838';

  upgradeCap =
    '0xc82c3fb9e2280554e008ebadc871d9189154a35a37021e8764ebed5e25e2ed49';

  witness =
    '0x682082068b8f1192f16a6074e107014d433e57ef839c7f9e3aea48f2d93a3ea2::recrd_migrator::Witness';

  module = 'recrd_migrator';

  recrdConfig = {
    objectId:
      '0x33347f5adc74fe9c2530df3f8dc456de9fb58764e7e15ff6380e8dae6f5dd62e',
    initialSharedVersion: '549909183',
  };

  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);

    invariant(
      this.network === Network.MAINNET,
      'Recrd migrator is only available on mainnet'
    );
  }

  public setRewardValue({
    tx = new Transaction(),
    rewardValue,
  }: RecrdSetRewardValueArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_reward_value',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.recrdConfig.objectId,
          mutable: true,
          initialSharedVersion: this.recrdConfig.initialSharedVersion,
        }),
        this.ownedObject(tx, this.adminId),
        tx.pure.u64(rewardValue),
      ],
    });

    return {
      tx,
    };
  }

  public setTreasury({
    tx = new Transaction(),
    treasury,
  }: RecrdSetTreasuryArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_treasury',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.recrdConfig.objectId,
          mutable: true,
          initialSharedVersion: this.recrdConfig.initialSharedVersion,
        }),
        this.ownedObject(tx, this.adminId),
        tx.pure.address(treasury),
      ],
    });

    return {
      tx,
    };
  }

  public setInitializePrice({
    tx = new Transaction(),
    price,
  }: RecrdSetInitializePriceArgs) {
    invariant(BigInt(price) > 0n, 'Price must be greater than 0');

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_initialize_price',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.recrdConfig.objectId,
          mutable: true,
          initialSharedVersion: this.recrdConfig.initialSharedVersion,
        }),
        this.ownedObject(tx, this.adminId),
        tx.pure.u128(price),
      ],
    });

    return {
      tx,
    };
  }

  public async registerPool({
    tx = new Transaction(),
    memeCoinTreasuryCap,
  }: RecrdRegisterPoolArgs) {
    invariant(
      isValidSuiAddress(memeCoinTreasuryCap),
      'Invalid meme coin treasury cap'
    );

    const { memeCoinType } =
      await this.getCoinMetadataAndType(memeCoinTreasuryCap);

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'register_pool',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.recrdConfig.objectId,
          mutable: true,
          initialSharedVersion: this.recrdConfig.initialSharedVersion,
        }),
        tx.sharedObjectRef({
          objectId: CETUS_GLOBAL_CONFIG.objectId,
          mutable: false,
          initialSharedVersion: CETUS_GLOBAL_CONFIG.initialSharedVersion,
        }),
        tx.sharedObjectRef({
          objectId: CETUS_POOLS.objectId,
          mutable: true,
          initialSharedVersion: CETUS_POOLS.initialSharedVersion,
        }),
        this.ownedObject(tx, memeCoinTreasuryCap),
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
    };
  }

  public async migrate({
    tx = new Transaction(),
    migrator,
    memeCoinType,
    quoteCoinType,
    ipxMemeCoinTreasury,
  }: RecrdMigrateArgs) {
    const quoteCoinMetadata = await this.client.getCoinMetadata({
      coinType: quoteCoinType,
    });

    invariant(quoteCoinMetadata?.id, 'Invalid quote coin metadata');

    const memeCoinMetadata = await this.client.getCoinMetadata({
      coinType: memeCoinType,
    });

    invariant(memeCoinMetadata?.id, 'Invalid meme coin metadata');

    const suiCoin = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'migrate',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.recrdConfig.objectId,
          mutable: true,
          initialSharedVersion: this.recrdConfig.initialSharedVersion,
        }),
        tx.object.clock(),
        tx.object(ipxMemeCoinTreasury),
        tx.sharedObjectRef({
          objectId: CETUS_GLOBAL_CONFIG.objectId,
          mutable: false,
          initialSharedVersion: CETUS_GLOBAL_CONFIG.initialSharedVersion,
        }),
        tx.sharedObjectRef({
          objectId: CETUS_POOLS.objectId,
          mutable: true,
          initialSharedVersion: CETUS_POOLS.initialSharedVersion,
        }),
        tx.object(quoteCoinMetadata.id),
        tx.object(memeCoinMetadata.id),
        migrator,
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
      suiCoin,
    };
  }
}
