import { Network } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiObjectId, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import {
  BLUEFIN_CONFIG,
  OWNED_OBJECTS,
  PACKAGES,
  SHARED_OBJECTS,
} from '../constants';
import { MemezBaseSDK } from '../sdk';
import { SdkConstructorArgs } from '../types/memez.types';
import { parseXPumpPositions } from '../utils';
import {
  XPumpCollectFeeArgs,
  XPumpGetPositionsArgs,
  XPumpMigrateArgs,
  XPumpMigrateToExistingPoolArgs,
  XPumpNewPositionOwnerArgs,
  XPumpSetInitializePriceArgs,
  XPumpSetRewardValueArgs,
  XPumpSetTreasuryArgs,
  XPumpSetTreasuryFeeArgs,
  XPumpMigrateWithLiquidityArgs,
  XPumpTreasuryCollectFeeArgs,
  XPumpUpdatePositionOwnerArgs,
  XPumpSetPackageVersionArgs,
  XPumpMigratorSetLiquidityMarginArgs,
  XPumpSetTicksArgs,
  XPumpTreasuryCollectPositionV2FeeArgs,
} from './migrators.types';
import { Coin } from '../structs';

export class XPumpMigratorSDK extends MemezBaseSDK {
  packageId = PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.latest;

  adminId = OWNED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_ADMIN;

  upgradeCap = OWNED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_UPGRADE_CAP;

  module = 'xpump_migrator';

  witness = `${PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.original}::${this.module}::Witness`;

  positionOwnerType = `${PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.original}::${this.module}::PositionOwner`;

  SUI_COIN_METADATA_ID =
    '0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3';

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

  public newPositionOwner({
    tx = new Transaction(),
    memeCoinType,
  }: XPumpNewPositionOwnerArgs) {
    const positionOwner = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'new_position_owner',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
      positionOwner,
    };
  }

  public updatePositionOwner({
    tx = new Transaction(),
    newPositionOwner,
    memeCoinType,
  }: XPumpUpdatePositionOwnerArgs) {
    const positionOwner = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'update_position_owner',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
        tx.pure.address(newPositionOwner),
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
      positionOwner,
    };
  }

  public async migrate({
    tx = new Transaction(),
    migrator,
    memeCoinType,
    feeCoinType,
    feeCoin,
    quoteCoinType,
    ipxMemeCoinTreasury,
  }: XPumpMigrateArgs) {
    const memeCoinMetadata = await this.client.getCoinMetadata({
      coinType: memeCoinType,
    });

    invariant(memeCoinMetadata?.id, 'Invalid meme coin metadata');

    const suiCoin = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'migrate_to_new_pool_v3',
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
        tx.object(memeCoinMetadata.id),
        tx.object(this.SUI_COIN_METADATA_ID),
        migrator,
        this.ownedObject(tx, feeCoin),
      ],
      typeArguments: [memeCoinType, quoteCoinType, feeCoinType],
    });

    return {
      tx,
      suiCoin,
    };
  }

  public async migrateWithLiquidity({
    tx = new Transaction(),
    migrator,
    memeCoinType,
    feeCoinType,
    feeCoin,
    ipxMemeCoinTreasury,
    liquidity,
  }: XPumpMigrateWithLiquidityArgs) {
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
      function: 'migrate_to_new_pool_with_liquidity',
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
        tx.pure.u128(liquidity),
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

    const suiCoin = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'collect_all_fees',
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
      suiCoin,
    };
  }

  public async pendingFee({
    bluefinPool,
    memeCoinType,
    positionOwner,
  }: XPumpCollectFeeArgs) {
    this.assertObjectId(bluefinPool);

    const tx = new Transaction();

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'collect_all_fees',
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

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [Coin],
    ]);

    return result[0][0].value;
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

  public setPackageVersion({
    tx = new Transaction(),
    packageVersion,
  }: XPumpSetPackageVersionArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_package_version',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
        tx.pure.u64(packageVersion),
      ],
    });

    return {
      tx,
    };
  }

  public setTicks({ tx = new Transaction(), min, max }: XPumpSetTicksArgs) {
    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_tick_spacing',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
        tx.pure.u32(min),
        tx.pure.u32(max),
      ],
    });

    return {
      tx,
    };
  }

  public setLiquidityMargin({
    tx = new Transaction(),
    liquidityMargin,
  }: XPumpMigratorSetLiquidityMarginArgs) {
    invariant(
      BigInt(liquidityMargin) > 0n && BigInt(liquidityMargin) < 10_000n,
      'Liquidity margin must be greater than 0 and less than 10,000'
    );

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'set_liquidity_margin',
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: true,
          })
        ),
        this.ownedObject(tx, this.adminId),
        tx.pure.u64(liquidityMargin),
      ],
    });

    return {
      tx,
    };
  }

  public treasuryCollectPositionV2Fee({
    tx = new Transaction(),
    bluefinPool,
    memeCoinType,
  }: XPumpTreasuryCollectPositionV2FeeArgs) {
    this.assertObjectId(bluefinPool);

    const [memeCoin, suiCoin] = tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'treasury_collect_position_v2_fee',
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
        this.ownedObject(tx, this.adminId),
      ],
      typeArguments: [memeCoinType],
    });

    return {
      tx,
      memeCoin,
      suiCoin,
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

    return {
      hasNextPage: positions.hasNextPage,
      nextCursor: positions.nextCursor,
      positions: parseXPumpPositions(positions),
    };
  }

  async getPositionDataOwner(memeCoinType: string) {
    const tx = new Transaction();

    tx.moveCall({
      package: this.packageId,
      module: this.module,
      function: 'position_data_owner',
      typeArguments: [memeCoinType],
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS[Network.MAINNET].XPUMP_MIGRATOR_CONFIG({
            mutable: false,
          })
        ),
      ],
    });
    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.Address],
    ]);

    invariant(
      result[0],
      'Position data owner devInspectAndGetReturnValues failed'
    );

    return normalizeSuiObjectId(result[0][0]);
  }
}
