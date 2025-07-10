import { SuiCoreSDK } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { HermesClient } from '@pythnetwork/hermes-client';
import {
  SuiPriceServiceConnection,
  SuiPythClient,
} from '@pythnetwork/pyth-sui-js';
import invariant from 'tiny-invariant';

import { makeTideAclSdk } from './acl';
import {
  BASIS_POINTS,
  PYTH_STATE_ID,
  REGISTRY_OBJECT,
  TIDE_AMM_PACKAGE,
  WORMHOLE_STATE_ID,
} from './constants';
import {
  AddBlacklistArgs,
  DepositArgs,
  NewArgs,
  QuoteArgs,
  RemoveBlacklistArgs,
  SdkConstructorArgs,
  SetFeeXArgs,
  SetFeeYArgs,
  SetMaxAgeArgs,
  SetMaxDeviationPercentageArgs,
  SetPauseXtoYArgs,
  SetPauseYtoXArgs,
  SetVirtualXLiquidityArgs,
  ShareArgs,
  ShouldRebalanceArgs,
  SwapArgs,
  TidePool,
  WithdrawArgs,
} from './tide.types';
import { calculateRebalanceAction, parseTidePool } from './utils';

export class TideSdk extends SuiCoreSDK {
  suiClient: SuiClient;
  tideAclSdk: ReturnType<typeof makeTideAclSdk>;

  public static PRECISION = BigInt(1e18);
  public static PRECISION_DECIMALS = 18;

  constructor(data: SdkConstructorArgs | null | undefined = {}) {
    super();

    data = {
      fullNodeUrl:
        data && data.fullNodeUrl ? data.fullNodeUrl : getFullnodeUrl('mainnet'),
    };

    this.suiClient = new SuiClient({
      url: data.fullNodeUrl!,
    });

    this.tideAclSdk = makeTideAclSdk(data.fullNodeUrl!);
  }

  public async newPool({
    admin,
    xType,
    yType,
    virtualLiquidity,
    feedX,
    feedY,
    tx = new Transaction(),
  }: NewArgs) {
    this.assertObjectId(admin);
    this.assertNotZeroAddress(feedX);
    this.assertNotZeroAddress(feedY);

    invariant(xType !== yType, 'xType and yType must be different');
    invariant(
      BigInt(virtualLiquidity) > 0n,
      'virtualLiquidity must be greater than 0'
    );

    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    const [xMetadata, yMetadata] = await Promise.all([
      this.suiClient.getCoinMetadata({
        coinType: xType,
      }),
      this.suiClient.getCoinMetadata({
        coinType: yType,
      }),
    ]);

    invariant(xMetadata?.id, 'xType is not a valid coin type');
    invariant(yMetadata?.id, 'yType is not a valid coin type');

    const pool = tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::new`,
      typeArguments: [xType, yType],
      arguments: [
        tx2.sharedObjectRef(REGISTRY_OBJECT({ mutable: true })),
        tx2.object(xMetadata.id),
        tx2.object(yMetadata.id),
        tx2.pure.u256(virtualLiquidity),
        tx2.pure.address(feedX),
        tx2.pure.address(feedY),
        authWitness,
      ],
    });

    return {
      pool,
      tx: tx2,
    };
  }

  public share({ tx, pool }: ShareArgs) {
    tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::share`,
      arguments: [tx.object(pool)],
    });
  }

  public setFeeX({ tx = new Transaction(), pool, feeX, admin }: SetFeeXArgs) {
    this.assertObjectId(admin);

    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_fee_x`,
      arguments: [this.sharedObject(tx, pool), tx.pure.u256(feeX), authWitness],
    });

    return tx2;
  }

  public setFeeY({ tx = new Transaction(), pool, feeY, admin }: SetFeeYArgs) {
    this.assertObjectId(admin);

    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_fee_y`,
      arguments: [this.sharedObject(tx, pool), tx.pure.u256(feeY), authWitness],
    });

    return tx2;
  }

  public setPauseXtoY({
    tx = new Transaction(),
    pool,
    paused,
    admin,
  }: SetPauseXtoYArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_pause_x_y`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.bool(paused),
        authWitness,
      ],
    });

    return tx2;
  }

  public setPauseYtoX({
    tx = new Transaction(),
    pool,
    paused,
    admin,
  }: SetPauseYtoXArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_pause_y_x`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.bool(paused),
        authWitness,
      ],
    });

    return tx2;
  }

  public addBlacklist({
    tx = new Transaction(),
    pool,
    address,
    admin,
  }: AddBlacklistArgs) {
    this.assertObjectId(admin);
    this.assertNotZeroAddress(address);

    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::add_to_blacklist`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.address(address),
        authWitness,
      ],
    });

    return tx2;
  }

  public removeBlacklist({
    tx = new Transaction(),
    pool,
    address,
    admin,
  }: RemoveBlacklistArgs) {
    this.assertObjectId(admin);
    this.assertNotZeroAddress(address);

    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::remove_from_blacklist`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.address(address),
        authWitness,
      ],
    });

    return tx2;
  }

  public setVirtualXLiquidity({
    tx = new Transaction(),
    pool,
    virtualLiquidityX,
    admin,
  }: SetVirtualXLiquidityArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_virtual_x_liquidity`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.u256(virtualLiquidityX),
        authWitness,
      ],
    });

    return tx2;
  }

  public setMaxAge({
    tx = new Transaction(),
    pool,
    maxAge,
    admin,
  }: SetMaxAgeArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_max_age`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.u64(maxAge),
        authWitness,
      ],
    });

    return tx2;
  }
  public setMaxDeviationPercentage({
    tx = new Transaction(),
    pool,
    maxDeviationPercentage,
    admin,
  }: SetMaxDeviationPercentageArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_max_deviation_percentage`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.u256(maxDeviationPercentage),
        authWitness,
      ],
    });

    return tx2;
  }

  public async deposit({
    tx = new Transaction(),
    pool,
    coinX,
    coinY,
    admin,
  }: DepositArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::deposit`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        this.ownedObject(tx, coinX),
        this.ownedObject(tx, coinY),
        authWitness,
      ],
      typeArguments: [pool.coinXType, pool.coinYType],
    });

    return tx2;
  }

  public async withdraw({
    tx = new Transaction(),
    pool,
    amountX,
    amountY,
    admin,
  }: WithdrawArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    const [coinX, coinY] = tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::withdraw`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        tx.pure.u64(amountX),
        tx.pure.u64(amountY),
        authWitness,
      ],
      typeArguments: [pool.coinXType, pool.coinYType],
    });

    return {
      coinX,
      coinY,
      tx: tx2,
    };
  }

  public async swap({ tx = new Transaction(), pool, amount, xToY }: SwapArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    const [priceInfoObjectIdX, priceInfoObjectIdY] =
      await this.#getPythPriceInfoObjects(tx, pool);

    const coinIn = coinWithBalance({
      type: xToY ? pool.coinXType : pool.coinYType,
      balance: BigInt(amount),
    });

    const [extraCoinIn, coinOut] = tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::swap`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        tx.object.clock(),
        tx.object(priceInfoObjectIdX),
        tx.object(priceInfoObjectIdY),
        coinIn,
      ],
      typeArguments: [
        xToY ? pool.coinXType : pool.coinYType,
        xToY ? pool.coinYType : pool.coinXType,
      ],
    });

    return {
      extraCoinIn,
      coinOut,
      tx,
    };
  }

  public async quote({ pool, amount, xToY }: QuoteArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    if (BigInt(amount) === 0n) {
      return {
        amountIn: 0n,
        amountOut: 0n,
        fee: 0n,
      };
    }

    const tx = new Transaction();

    const [priceInfoObjectIdX, priceInfoObjectIdY] =
      await this.#getPythPriceInfoObjects(tx, pool);

    tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::quote`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        tx.object.clock(),
        tx.object(priceInfoObjectIdX),
        tx.object(priceInfoObjectIdY),
        tx.pure.u64(amount),
      ],
      typeArguments: [
        xToY ? pool.coinXType : pool.coinYType,
        xToY ? pool.coinYType : pool.coinXType,
      ],
    });

    const result = await this.suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: normalizeSuiAddress('0x0'),
    });

    const lastExecutionTx = result.results?.[result.results.length - 1];

    invariant(lastExecutionTx, 'Last tx returned values is null');

    const lastTxReturnedValues = lastExecutionTx.returnValues;
    invariant(lastTxReturnedValues, 'Last tx returned values is null');

    invariant(
      lastTxReturnedValues[0] &&
        lastTxReturnedValues[1] &&
        lastTxReturnedValues[2],
      'Last tx returned values is null'
    );

    return {
      amountIn: bcs.u64().parse(Uint8Array.from(lastTxReturnedValues[0][0])),
      amountOut: bcs.u64().parse(Uint8Array.from(lastTxReturnedValues[1][0])),
      fee: bcs.u64().parse(Uint8Array.from(lastTxReturnedValues[2][0])),
    };
  }

  async getPool(poolId: string) {
    const pool = await this.suiClient.getObject({
      id: poolId,
      options: {
        showContent: true,
      },
    });

    return parseTidePool(pool);
  }

  async getBalances(pool: string | TidePool) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::balances`,
      arguments: [this.sharedObject(tx, pool.objectId)],
      typeArguments: [pool.coinXType, pool.coinYType],
    });

    const result = await devInspectAndGetReturnValues(this.suiClient, tx, [
      [bcs.u64(), bcs.u64()],
    ]);

    invariant(result[0], 'Balances devInspectAndGetReturnValues failed');

    const [balanceX, balanceY] = result[0].map((value: string) =>
      BigInt(value)
    );

    return {
      balanceX,
      balanceY,
    };
  }

  async virtualBalances(pool: string | TidePool) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    const tx = new Transaction();

    const [priceInfoObjectIdX, priceInfoObjectIdY] =
      await this.#getPythPriceInfoObjects(tx, pool);

    tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::virtual_balances`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        tx.object.clock(),
        tx.object(priceInfoObjectIdX),
        tx.object(priceInfoObjectIdY),
      ],
      typeArguments: [pool.coinXType, pool.coinYType],
    });

    const result = await this.suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: normalizeSuiAddress('0x0'),
    });

    const lastExecutionTx = result.results?.[result.results.length - 1];

    invariant(lastExecutionTx, 'Last tx returned values is null');

    const lastTxReturnedValues = lastExecutionTx.returnValues;
    invariant(lastTxReturnedValues, 'Last tx returned values is null');

    invariant(
      lastTxReturnedValues[0] && lastTxReturnedValues[1],
      'Last tx returned values is null'
    );

    return {
      balanceX: bcs.u256().parse(Uint8Array.from(lastTxReturnedValues[0][0])),
      balanceY: bcs.u256().parse(Uint8Array.from(lastTxReturnedValues[1][0])),
    };
  }

  async getPrices(pool: string | TidePool) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    const priceIds = [pool.feedX, pool.feedY];

    const hermesClient = this.#getHermesClient();
    const priceUpdates = await hermesClient.getLatestPriceUpdates(priceIds);

    const prices = priceUpdates.parsed?.map(({ price }) => {
      const powValue =
        price.expo > 0 ? 18 + Math.abs(price.expo) : 18 - Math.abs(price.expo);

      return BigInt(price.price) * 10n ** BigInt(powValue);
    });

    invariant(prices?.[0] && prices?.[1], 'Prices is null');

    return {
      priceX: prices[0],
      priceY: prices[1],
      precision: TideSdk.PRECISION,
    };
  }

  async shouldRebalance({
    pool,
    thresholdBasisPoints,
    desiredAmount,
  }: ShouldRebalanceArgs) {
    invariant(
      BigInt(desiredAmount) > 0n,
      'Desired amount must be greater than 0'
    );
    invariant(
      thresholdBasisPoints > 0n && thresholdBasisPoints <= BASIS_POINTS,
      'Threshold basis points must be greater than 0'
    );

    const balances = await this.getBalances(pool);

    return calculateRebalanceAction({
      currentAmount: balances.balanceX,
      desiredAmount,
      threshold: thresholdBasisPoints,
    });
  }

  #getPriceUpdateData(pool: TidePool) {
    const connection = this.#getSuiServiceConnection();

    return connection.getPriceFeedsUpdateData([pool.feedX, pool.feedY]);
  }

  #getSuiServiceConnection() {
    return new SuiPriceServiceConnection('https://hermes.pyth.network', {
      priceFeedRequestConfig: {
        binary: true,
      },
    });
  }

  #getHermesClient() {
    return new HermesClient('https://hermes.pyth.network', {});
  }

  async #getPythPriceInfoObjects(tx: Transaction, pool: TidePool) {
    const priceUpdateData = await this.#getPriceUpdateData(pool);
    const pythClient = this.#getPythClient();

    const priceInfoObjectIds = await pythClient.updatePriceFeeds(
      tx,
      priceUpdateData,
      [pool.feedX, pool.feedY]
    );

    invariant(
      priceInfoObjectIds.length === 2,
      'Price info object IDs length is not 2'
    );

    return priceInfoObjectIds;
  }

  #getPythClient() {
    return new SuiPythClient(this.suiClient, PYTH_STATE_ID, WORMHOLE_STATE_ID);
  }

  #getAdminWitness(tx: Transaction, admin: string) {
    this.assertObjectId(admin);

    return this.tideAclSdk.signIn({
      tx,
      admin,
    });
  }
}
