import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import {
  isValidSuiAddress,
  isValidSuiObjectId,
  normalizeStructTag,
} from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import { Progress } from './constants';
import { MemezBaseSDK } from './sdk';
import { SdkConstructorArgs } from './types/memez.types';
import {
  DeveloperAllocationClaimArgs,
  DistributeStakeHoldersAllocationArgs,
  DumpArgs,
  DumpTokenArgs,
  MigrateArgs,
  NewStablePoolArgs,
  PumpArgs,
  PumpTokenArgs,
  QuoteArgs,
  QuoteDumpReturnValues,
  QuotePumpReturnValues,
  ToCoinArgs,
} from './types/stable.types';

export class MemezStableSDK extends MemezBaseSDK {
  /**
   * Initiates the MemezFun SDK.
   *
   * @param args - An object containing the necessary arguments to initialize the SDK.
   * @param args.fullNodeUrl - The full node URL to use for the SDK.
   * @param args.packages - The package addresses to use for the SDK.
   * @param args.sharedObjects - A record of shared objects to use for the SDK.
   * @param args.network - The network to use for the SDK. Either `mainnet` or `testnet`.
   */
  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }

  public async newPool({
    tx = new Transaction(),
    configurationKey,
    migrationWitness,
    stakeHolders = [],
    quoteCoinType,
    developer,
    developerAllocation = 0n,
    vestingDurationMs = 0n,
    memeCoinTreasuryCap,
    creationSuiFee = this.zeroSuiCoin(tx),
    targetQuoteLiquidity,
    totalSupply = this.defaultSupply,
    useTokenStandard = false,
    metadata = {},
    liquidityProvision,
    memeSalePercentage,
  }: NewStablePoolArgs) {
    invariant(
      liquidityProvision >= 0 && liquidityProvision <= this.MAX_BPS,
      'liquidityProvision must be between 0 and 10_000'
    );
    invariant(
      memeSalePercentage >= 0 && memeSalePercentage <= this.MAX_BPS,
      'memeSalePercentage must be between 0 and 10_000'
    );

    invariant(
      isValidSuiAddress(developer),
      'developer must be a valid Sui address'
    );

    invariant(
      stakeHolders.every((stakeHolder) => isValidSuiAddress(stakeHolder)),
      'stakeHolders must be a valid Sui address'
    );

    const { memeCoinType, coinMetadataId } =
      await this.getCoinMetadataAndType(memeCoinTreasuryCap);

    const memezMetadata = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.METADATA,
      function: 'new',
      arguments: [
        tx.object(coinMetadataId),
        tx.pure.vector('string', Object.keys(metadata)),
        tx.pure.vector('string', Object.values(metadata)),
      ],
      typeArguments: [normalizeStructTag(memeCoinType)],
    });

    const stableConfig = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE_CONFIG,
      function: 'new',
      arguments: [
        tx.pure.vector('u64', [
          targetQuoteLiquidity,
          liquidityProvision,
          memeSalePercentage,
          totalSupply,
        ]),
      ],
    });

    const [pool, metadataCap] = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'new',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: false })),
        this.ownedObject(tx, memeCoinTreasuryCap),
        this.ownedObject(tx, creationSuiFee),
        stableConfig,
        tx.pure.bool(useTokenStandard),
        memezMetadata,
        tx.pure.vector('u64', [developerAllocation, vestingDurationMs]),
        tx.pure.vector('address', stakeHolders),
        tx.pure.address(developer),
        this.getVersion(tx),
      ],
      typeArguments: [
        normalizeStructTag(memeCoinType),
        normalizeStructTag(quoteCoinType),
        normalizeStructTag(configurationKey),
        normalizeStructTag(migrationWitness),
      ],
    });

    invariant(pool, 'Pool not returned from new');

    tx.moveCall({
      package: '0x2',
      module: 'transfer',
      function: 'public_share_object',
      arguments: [pool],
      typeArguments: [
        `${this.packages.MEMEZ_FUN.original}::memez_fun::MemezFun<${this.packages.MEMEZ_FUN.original}::memez_stable::Stable, ${normalizeStructTag(memeCoinType)},${normalizeStructTag(quoteCoinType)}>`,
      ],
    });

    return {
      metadataCap,
      tx,
    };
  }

  public async pump({ tx = new Transaction(), pool, quoteCoin }: PumpArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    invariant(!pool.usesTokenStandard, 'pool uses token standard');

    const [excessQuoteCoin, memeCoin] = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'pump',
      arguments: [
        tx.object(pool.objectId),
        this.ownedObject(tx, quoteCoin),
        this.getVersion(tx),
      ],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      excessQuoteCoin,
      memeCoin,
      tx,
    };
  }

  public async dump({ tx = new Transaction(), pool, memeCoin }: DumpArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    invariant(!pool.usesTokenStandard, 'pool uses token standard');

    const quoteCoin = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'dump',
      arguments: [
        tx.object(pool.objectId),
        this.ownedObject(tx, memeCoin),
        this.getVersion(tx),
      ],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      quoteCoin,
      tx,
    };
  }

  public async pumpToken({
    tx = new Transaction(),
    pool,
    quoteCoin,
  }: PumpTokenArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    invariant(pool.usesTokenStandard, 'pool does not use token standard');

    const [excessQuoteCoin, memeToken] = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'pump_token',
      arguments: [
        tx.object(pool.objectId),
        this.ownedObject(tx, quoteCoin),
        this.getVersion(tx),
      ],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      excessQuoteCoin,
      memeToken,
      tx,
    };
  }

  public async dumpToken({
    tx = new Transaction(),
    pool,
    memeToken,
  }: DumpTokenArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    invariant(pool.usesTokenStandard, 'pool does not use token standard');

    const quoteCoin = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'dump_token',
      arguments: [
        tx.object(pool.objectId),
        this.ownedObject(tx, memeToken),
        this.getVersion(tx),
      ],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      quoteCoin,
      tx,
    };
  }

  /**
   * Quotes the amount of meme coin received after selling Sui. The swap fee is from the coin in (Sui).
   *
   * @param args - An object containing the necessary arguments to quote the amount of meme coin received after selling Sui.
   * @param args.pool - The objectId of the MemezPool or the full parsed pool.
   * @param args.amount - The amount of Sui to sell.
   *
   * @returns An object containing the amount of meme coin received and the swap in fee.
   * @returns values.memeAmountOut - The amount of meme coin received.
   * @returns values.swapFeeIn - The swap fee in paid in Sui.
   */
  public async quotePump({
    pool,
    amount,
  }: QuoteArgs): Promise<QuotePumpReturnValues> {
    if (BigInt(amount) == 0n)
      return {
        excessQuoteAmount: 0n,
        memeAmountOut: 0n,
        quoteFee: 0n,
        memeFee: 0n,
      };
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'quote_pump',
      arguments: [tx.object(pool.objectId), tx.pure.u64(amount)],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.vector(bcs.u64())],
    ]);

    invariant(result[0], 'Quote pump devInspectAndGetReturnValues failed');

    const [excessQuoteAmount, memeAmountOut, quoteFee, memeFee] =
      result[0][0].map((value: string) => BigInt(value));

    return { excessQuoteAmount, memeAmountOut, quoteFee, memeFee };
  }

  /**
   * Quotes the amount of Sui received after selling meme coin. The swap fee is from the coin in (MemeCoin).
   *
   * @param args - An object containing the necessary arguments to quote the amount of Sui received after selling meme coin.
   * @param args.pool - The objectId of the MemezPool or the full parsed pool.
   * @param args.amount - The amount of meme coin to sell.
   *
   * @returns An object containing the amount of Sui received and the swap in fee.
   * @returns values.quoteAmountOut - The amount of Sui received.
   * @returns values.swapFeeIn - The swap fee in paid in MemeCoin.
   */
  public async quoteDump({
    pool,
    amount,
  }: QuoteArgs): Promise<QuoteDumpReturnValues> {
    if (BigInt(amount) == 0n)
      return {
        quoteAmountOut: 0n,
        quoteFee: 0n,
        memeFee: 0n,
      };

    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'quote_dump',
      arguments: [tx.object(pool.objectId), tx.pure.u64(amount)],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.vector(bcs.u64())],
    ]);

    invariant(result[0], 'Quote dump devInspectAndGetReturnValues failed');

    const [quoteAmountOut, memeFee, quoteFee] = result[0][0].map(
      (value: string) => BigInt(value)
    );

    return { quoteAmountOut, memeFee, quoteFee };
  }

  /**
   * Allows the developer to claim the first purchase coins. It can only be done after the pool migrates.
   *
   * @param args - An object containing the necessary arguments to claim the first purchase coins.
   * @param args.tx - Sui client Transaction class to chain move calls.
   * @param args.pool - The objectId of the MemezPool or the full parsed pool.
   *
   * @returns An object containing the memezVesting and the transaction.
   * @returns values.memezVesting - The memezVesting.
   * @returns values.tx - The Transaction.
   */
  public async developerAllocationClaim({
    tx = new Transaction(),
    pool,
  }: DeveloperAllocationClaimArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    const memezVesting = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'dev_allocation_claim',
      arguments: [
        tx.object(pool.objectId),
        tx.object.clock(),
        this.getVersion(tx),
      ],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      memezVesting,
      tx,
    };
  }

  /**
   * Converts a meme token to a meme coin. This is for pools that use the Token Standard. It can only be done after the pool migrates.
   *
   * @param args - An object containing the necessary arguments to convert a meme token to a meme coin.
   * @param args.tx - Sui client Transaction class to chain move calls.
   * @param args.pool - The objectId of the MemezPool or the full parsed pool.
   * @param args.memeToken - The meme token to convert to a meme coin.
   *
   * @returns An object containing the meme coin and the transaction.
   * @returns values.memeCoin - The meme coin.
   * @returns values.tx - The Transaction.
   */
  public async toCoin({ tx = new Transaction(), memeToken, pool }: ToCoinArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    invariant(pool.usesTokenStandard, 'pool uses token standard');

    const memeCoin = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'to_coin',
      arguments: [tx.object(pool.objectId), this.ownedObject(tx, memeToken)],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      memeCoin,
      tx,
    };
  }

  /**
   * Migrates the pool to DEX based on the MigrationWitness.
   *
   * @param args - An object containing the necessary arguments to migrate the pool.
   * @param args.tx - Sui client Transaction class to chain move calls.
   * @param args.pool - The objectId of the MemezPool or the full parsed pool.
   *
   * @returns An object containing the migrator and the transaction.
   * @returns values.migrator - The migrator.
   * @returns values.tx - The Transaction.
   */
  public async migrate({ tx = new Transaction(), pool }: MigrateArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    const migrator = tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'migrate',
      arguments: [tx.object(pool.objectId), this.getVersion(tx)],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      migrator,
      tx,
    };
  }

  /**
   * Distributes the stake holders allocation. It can only be done after the pool migrates.
   *
   * @param args - An object containing the necessary arguments to distribute the stake holders allocation.
   * @param args.tx - Sui client Transaction class to chain move calls.
   * @param args.pool - The objectId of the MemezPool or the full parsed pool.
   *
   * @returns An object containing the transaction.
   */
  public async distributeStakeHoldersAllocation({
    tx = new Transaction(),
    pool,
  }: DistributeStakeHoldersAllocationArgs) {
    if (typeof pool === 'string') {
      invariant(
        isValidSuiObjectId(pool),
        'pool must be a valid Sui objectId or MemezPool'
      );
      pool = await this.getStablePool(pool);
    }

    invariant(pool.progress === Progress.Migrated, 'pool is not migrated');

    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.STABLE,
      function: 'distribute_stake_holders_allocation',
      arguments: [
        tx.object(pool.objectId),
        tx.object.clock(),
        this.getVersion(tx),
      ],
      typeArguments: [pool.memeCoinType, pool.quoteCoinType],
    });

    return {
      tx,
    };
  }
}
