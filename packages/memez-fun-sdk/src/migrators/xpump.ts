import { Network } from '@interest-protocol/sui-core-sdk';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import {
  BLUEFIN_CONFIG,
  OWNED_OBJECTS,
  PACKAGES,
  SHARED_OBJECTS,
} from '../constants';
import { MemezBaseSDK } from '../sdk';
import { SdkConstructorArgs } from '../types/memez.types';
import {
  XPumpCollectFeeArgs,
  XPumpGetPositionsArgs,
  XPumpMigrateArgs,
  XPumpMigrateToExistingPoolArgs,
  XPumpSetInitializePriceArgs,
  XPumpSetRewardValueArgs,
  XPumpSetTreasuryArgs,
  XPumpSetTreasuryFeeArgs,
  XPumpTreasuryCollectFeeArgs,
} from './migrators.types';

export class XPumpMigratorSDK extends MemezBaseSDK {
  packageId = PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.latest;

  adminId = OWNED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_ADMIN;

  upgradeCap = OWNED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_UPGRADE_CAP;

  module = 'xpump_migrator';

  witness = `${PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.original}::${this.module}::Witness`;

  positionOwnerType = `${PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.original}::${this.module}::PositionOwner`;

  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);

    invariant(
      this.network === Network.MAINNET,
      'XPump migrator is only available on mainnet'
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
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
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
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
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
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
        tx.pure.u128(price),
      ],
    });

    return {
      tx,
    };
  }

  public setTreasuryFee({
    tx = new Transaction(),
    fee,
  }: XPumpSetTreasuryFeeArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_treasury_fee',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
        tx.pure.u64(fee),
      ],
    });

    return {
      tx,
    };
  }

  public async migrate({
    tx = new Transaction(),
    migrator,
    memeCoinType,
    feeCoinType,
    feeCoin,
    ipxMemeCoinTreasury,
  }: XPumpMigrateArgs) {
    const [quoteCoinMetadata, memeCoinMetadata] = await Promise.all([
      this.client.getCoinMetadata({
        coinType: SUI_TYPE_ARG,
      }),
      this.client.getCoinMetadata({
        coinType: memeCoinType,
      }),
    ]);

    invariant(quoteCoinMetadata?.id, 'Invalid quote coin metadata');

    invariant(memeCoinMetadata?.id, 'Invalid meme coin metadata');

    const suiCoin = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'migrate_to_new_pool',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        tx.sharedObjectRef({
          objectId: BLUEFIN_CONFIG.objectId,
          mutable: true,
          initialSharedVersion: BLUEFIN_CONFIG.initialSharedVersion,
        }),
        tx.object.clock(),
        tx.object(ipxMemeCoinTreasury),
        tx.object(quoteCoinMetadata.id),
        tx.object(memeCoinMetadata.id),
        migrator,
        this.ownedObject(tx, feeCoin),
      ],
      typeArguments: [memeCoinType, feeCoinType],
    });

    return {
      tx,
      suiCoin,
    };
  }

  public async migrateToExistingPool({
    tx = new Transaction(),
    pool,
    ipxMemeCoinTreasury,
    memeCoinType,
    migrator,
  }: XPumpMigrateToExistingPoolArgs) {
    this.assertObjectId(pool);
    this.assertObjectId(ipxMemeCoinTreasury);
    this.assertObjectId(migrator);

    const memeCoinMetadata = await this.client.getCoinMetadata({
      coinType: memeCoinType,
    });

    invariant(memeCoinMetadata?.id, 'Invalid meme coin metadata');

    const suiCoin = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'migrate_to_existing_pool',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        tx.sharedObjectRef({
          objectId: BLUEFIN_CONFIG.objectId,
          mutable: true,
          initialSharedVersion: BLUEFIN_CONFIG.initialSharedVersion,
        }),
        tx.object(pool),
        tx.object.clock(),
        tx.object(ipxMemeCoinTreasury),
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

  public collectFee({
    tx = new Transaction(),
    bluefinPool,
    memeCoinType,
    positionOwner,
  }: XPumpCollectFeeArgs) {
    this.assertObjectId(bluefinPool);

    const [memeCoin, suiCoin] = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'collect_fee',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        tx.sharedObjectRef({
          objectId: BLUEFIN_CONFIG.objectId,
          mutable: false,
          initialSharedVersion: BLUEFIN_CONFIG.initialSharedVersion,
        }),
        tx.object(bluefinPool),
        tx.object.clock(),
        this.ownedObject(tx, positionOwner),
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
      memeCoin,
      suiCoin,
    };
  }

  public treasuryCollectFee({
    tx = new Transaction(),
    bluefinPool,
    memeCoinType,
  }: XPumpTreasuryCollectFeeArgs) {
    this.assertObjectId(bluefinPool);

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'treasury_collect_fee',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        tx.sharedObjectRef({
          objectId: BLUEFIN_CONFIG.objectId,
          mutable: false,
          initialSharedVersion: BLUEFIN_CONFIG.initialSharedVersion,
        }),
        tx.object(bluefinPool),
        tx.object.clock(),
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
    };
  }

  async getPositions({
    owner,
    cursor = null,
    limit = 50,
  }: XPumpGetPositionsArgs) {
    const positions = await this.client.getOwnedObjects({
      owner: owner,
      options: {
        showType: true,
        showContent: true,
      },
      filter: {
        StructType: this.positionOwnerType,
      },
      cursor,
      limit,
    });

    return positions;
  }
}
