import { SuiCoreSDK } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import { makeTideAclSdk } from './acl';
import { REGISTRY_OBJECT, TIDE_AMM_PACKAGE } from './constants';
import {
  AddBlacklistArgs,
  DepositArgs,
  NewArgs,
  PauseXtoYArgs,
  PauseYtoXArgs,
  QuoteArgs,
  RemoveBlacklistArgs,
  SdkConstructorArgs,
  SetFeeXArgs,
  SetFeeYArgs,
  SetMaxPricesArgs,
  SetMaxUpdateDelayMsArgs,
  SetPricesArgs,
  SetVirtualXLiquidityArgs,
  ShareArgs,
  SwapArgs,
  TidePool,
  UnpauseXtoYArgs,
  UnpauseYtoXArgs,
  WithdrawArgs,
} from './tide.types';
import { parseTidePool } from './utils';

const TideAclSdk = makeTideAclSdk();

export class TideSdk extends SuiCoreSDK {
  #suiClient: SuiClient;

  public static PRECISION = BigInt(1e18);

  constructor(data: SdkConstructorArgs | null | undefined = {}) {
    super();

    data = {
      fullNodeUrl:
        data && data.fullNodeUrl ? data.fullNodeUrl : getFullnodeUrl('mainnet'),
    };

    this.#suiClient = new SuiClient({
      url: data.fullNodeUrl!,
    });
  }

  public async newPool({
    admin,
    xType,
    yType,
    virtualLiquidity,
    tx = new Transaction(),
  }: NewArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    const [xMetadata, yMetadata] = await Promise.all([
      this.#suiClient.getCoinMetadata({
        coinType: xType,
      }),
      this.#suiClient.getCoinMetadata({
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

  public setMaxUpdateDelayMs({
    tx = new Transaction(),
    pool,
    maxUpdateDelayMs,
    admin,
  }: SetMaxUpdateDelayMsArgs) {
    this.assertObjectId(admin);

    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_max_update_delay_ms`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.u64(maxUpdateDelayMs),
        authWitness,
      ],
    });

    return tx2;
  }

  public setMaxPrices({
    tx = new Transaction(),
    pool,
    maxPriceX,
    maxPriceY,
    minPriceX,
    minPriceY,
    admin,
  }: SetMaxPricesArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_max_prices`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.pure.u256(maxPriceX),
        tx.pure.u256(maxPriceY),
        tx.pure.u256(minPriceX),
        tx.pure.u256(minPriceY),
        authWitness,
      ],
    });

    return tx2;
  }

  public pauseXtoY({ tx = new Transaction(), pool, admin }: PauseXtoYArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::pause_x_y`,
      arguments: [this.sharedObject(tx, pool), authWitness],
    });

    return tx2;
  }

  public pauseYtoX({ tx = new Transaction(), pool, admin }: PauseYtoXArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::pause_y_x`,
      arguments: [this.sharedObject(tx, pool), authWitness],
    });

    return tx2;
  }

  public unpauseXtoY({ tx = new Transaction(), pool, admin }: UnpauseXtoYArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::unpause_x_y`,
      arguments: [this.sharedObject(tx, pool), authWitness],
    });

    return tx2;
  }

  public unpauseYtoX({ tx = new Transaction(), pool, admin }: UnpauseYtoXArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::unpause_y_x`,
      arguments: [this.sharedObject(tx, pool), authWitness],
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

  public setPrices({
    tx = new Transaction(),
    pool,
    priceX,
    priceY,
    admin,
  }: SetPricesArgs) {
    const { authWitness, tx: tx2 } = this.#getAdminWitness(tx, admin);

    tx2.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::set_prices`,
      arguments: [
        this.sharedObject(tx, pool),
        tx.object.clock(),
        tx.pure.u256(priceX),
        tx.pure.u256(priceY),
        authWitness,
      ],
    });

    return tx2;
  }

  public async swap({ tx = new Transaction(), pool, amount, xToY }: SwapArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    const coinIn = coinWithBalance({
      type: xToY ? pool.coinXType : pool.coinYType,
      balance: BigInt(amount),
    });

    const [extraCoinIn, coinOut] = tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::swap`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        tx.object.clock(),
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

    tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::quote`,
      arguments: [
        this.sharedObject(tx, pool.objectId),
        tx.object.clock(),
        tx.pure.u64(amount),
      ],
      typeArguments: [
        xToY ? pool.coinXType : pool.coinYType,
        xToY ? pool.coinYType : pool.coinXType,
      ],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.u64(), bcs.u64(), bcs.u64()],
    ]);

    invariant(result[0], 'Quote devInspectAndGetReturnValues failed');

    const [amountIn, amountOut, fee] = result[0].map((value: string) =>
      BigInt(value)
    );

    return {
      amountIn,
      amountOut,
      fee,
    };
  }

  async getPool(poolId: string) {
    const pool = await this.#suiClient.getObject({
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

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
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

    tx.moveCall({
      target: `${TIDE_AMM_PACKAGE}::tide_amm::virtual_balances`,
      arguments: [this.sharedObject(tx, pool.objectId)],
      typeArguments: [pool.coinXType, pool.coinYType],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.u256(), bcs.u256()],
    ]);

    invariant(
      result[0],
      'Virtual balances devInspectAndGetReturnValues failed'
    );

    const [balanceX, balanceY] = result[0].map((value: string) =>
      BigInt(value)
    );

    return {
      balanceX,
      balanceY,
    };
  }

  #getAdminWitness(tx: Transaction, admin: string) {
    this.assertObjectId(admin);

    return TideAclSdk.signIn({
      tx,
      admin,
    });
  }
}
