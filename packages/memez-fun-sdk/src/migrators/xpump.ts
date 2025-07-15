import { Network } from '@interest-protocol/sui-core-sdk';
import { Transaction } from '@mysten/sui/transactions';
import { isValidSuiAddress } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import {
  CETUS_BURNER_MANAGER,
  CETUS_GLOBAL_CONFIG,
  CETUS_POOLS,
} from '../constants';
import { MemezBaseSDK } from '../sdk';
import { SdkConstructorArgs } from '../types/memez.types';
import {
  XPumpMigrateArgs,
  XPumpRegisterPoolArgs,
  XPumpSetInitializePriceArgs,
  XPumpSetRewardValueArgs,
  XPumpSetTreasuryArgs,
} from './migrators.types';

export class XPumpMigratorSDK extends MemezBaseSDK {
  packageId =
    '0xfba336c793229cefbaa7c2e3ed9abeb970144c0eaceef46999c7ba7157fd8734';

  adminId =
    '0xaa7503c97dab460af13eda60b9af3ccc247cefd48e19da69ff0f0e2aa747fcf6';

  upgradeCap =
    '0x600b76e704842b0d3dd23ab9224d28acf4d320c0f042e52aa2ee81f330f93775';

  witness =
    '0xfba336c793229cefbaa7c2e3ed9abeb970144c0eaceef46999c7ba7157fd8734::xpump_migrator::Witness';

  module = 'xpump_migrator';

  xPumpConfig = {
    objectId:
      '0x18c566f7e85afa92accbd5058265cbbc4c13c22a740f430c45a41a542e4fa46c',
    initialSharedVersion: '589857101',
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
  }: XPumpSetRewardValueArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_reward_value',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.xPumpConfig.objectId,
          mutable: true,
          initialSharedVersion: this.xPumpConfig.initialSharedVersion,
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
  }: XPumpSetTreasuryArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_treasury',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.xPumpConfig.objectId,
          mutable: true,
          initialSharedVersion: this.xPumpConfig.initialSharedVersion,
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
  }: XPumpSetInitializePriceArgs) {
    invariant(BigInt(price) > 0n, 'Price must be greater than 0');

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_initialize_price',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.xPumpConfig.objectId,
          mutable: true,
          initialSharedVersion: this.xPumpConfig.initialSharedVersion,
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
  }: XPumpRegisterPoolArgs) {
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
          objectId: this.xPumpConfig.objectId,
          mutable: true,
          initialSharedVersion: this.xPumpConfig.initialSharedVersion,
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
  }: XPumpMigrateArgs) {
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
          objectId: this.xPumpConfig.objectId,
          mutable: true,
          initialSharedVersion: this.xPumpConfig.initialSharedVersion,
        }),
        tx.object(CETUS_BURNER_MANAGER),
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
