import { AggregatorClient } from '@cetusprotocol/aggregator-sdk';
import { logError, logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/sui-utils';
import {
  RebalanceAction,
  TidePool,
  TideSdk,
} from '@interest-protocol/tide-amm';
import { getFullnodeUrl } from '@mysten/sui/client';
import BN from 'bn.js';
import invariant from 'tiny-invariant';

// === Constants ===

export const ADMIN_OBJECT_ID =
  '0x854e37e97268aae4fa33628b9f18c6167fdef326eefc7af4d0f818283a34f23f';

export const REBALANCE_THRESHOLD = 2_000n;

export const TARGET_SUI_AMOUNT = 6n * 10n ** 9n;

export const SUI_USDC_POOL_ID =
  '0x208330127845e6be5a6292b6fbe078e7b8a28b4cdb3087e1e5c016cbbc9a16ff';

export const SLIPPAGE = 0.1;

// === Utils ===

export const tideSdk = new TideSdk({
  fullNodeUrl: getFullnodeUrl('mainnet'),
});

const router = new AggregatorClient({});

// === Functions ===

export const performRemoveAction = async (
  tidePool: TidePool,
  router: AggregatorClient,
  amount: bigint
) => {
  const routers = await router.findRouters({
    from: tidePool.coinXType,
    target: tidePool.coinYType,
    amount: new BN(amount.toString()),
    byAmountIn: true, // true means fix input amount, false means fix output amount
  });

  invariant(routers, 'No routers found');

  const { tx, coinX, coinY } = await tideSdk.withdraw({
    pool: SUI_USDC_POOL_ID,
    amountX: amount,
    amountY: 0n,
    admin: ADMIN_OBJECT_ID,
  });

  tx.moveCall({
    target: '0x2::coin::destroy_zero',
    typeArguments: [tidePool.coinYType],
    arguments: [coinY],
  });

  const targetCoin = await router.routerSwap({
    routers,
    txb: tx,
    inputCoin: coinX,
    slippage: SLIPPAGE,
  });

  const coinXZero = tx.moveCall({
    target: '0x2::coin::zero',
    typeArguments: [tidePool.coinXType],
  });

  const tx2 = await tideSdk.deposit({
    tx,
    pool: SUI_USDC_POOL_ID,
    coinX: coinXZero,
    coinY: targetCoin,
    admin: ADMIN_OBJECT_ID,
  });

  await executeTx(tx2);
};

export const performAddAction = async (
  tidePool: TidePool,
  router: AggregatorClient,
  amount: bigint
) => {
  const [prices, balances] = await Promise.all([
    tideSdk.getPrices(SUI_USDC_POOL_ID),
    tideSdk.getBalances(SUI_USDC_POOL_ID),
  ]);

  const normalizedAmount = (amount * prices.precision) / tidePool.decimalsX;

  const amountYToRemove = (normalizedAmount * prices.priceX) / prices.priceY;

  const realAMount = (amountYToRemove * tidePool.decimalsY) / prices.precision;

  const safeAmount =
    realAMount > balances.balanceY ? balances.balanceY : realAMount;

  const routers = await router.findRouters({
    from: tidePool.coinYType,
    target: tidePool.coinXType,
    amount: new BN(safeAmount.toString()),
    byAmountIn: true,
  });

  invariant(routers, 'No routers found');

  const { tx, coinX, coinY } = await tideSdk.withdraw({
    pool: SUI_USDC_POOL_ID,
    amountX: 0n,
    amountY: safeAmount,
    admin: ADMIN_OBJECT_ID,
  });

  tx.moveCall({
    target: '0x2::coin::destroy_zero',
    typeArguments: [tidePool.coinXType],
    arguments: [coinX],
  });

  const targetCoin = await router.routerSwap({
    routers,
    txb: tx,
    inputCoin: coinY,
    slippage: SLIPPAGE,
  });

  const coinYZero = tx.moveCall({
    target: '0x2::coin::zero',
    typeArguments: [tidePool.coinYType],
  });

  const tx2 = await tideSdk.deposit({
    tx,
    pool: SUI_USDC_POOL_ID,
    coinX: targetCoin,
    coinY: coinYZero,
    admin: ADMIN_OBJECT_ID,
  });

  await executeTx(tx2);
};

(async () => {
  try {
    const { action, amount } = await tideSdk.shouldRebalance({
      pool: SUI_USDC_POOL_ID,
      desiredAmount: TARGET_SUI_AMOUNT,
      thresholdBasisPoints: REBALANCE_THRESHOLD,
    });

    if (action === RebalanceAction.None) {
      logSuccess('No rebalance needed');

      return;
    }

    const tidePool = await tideSdk.getPool(SUI_USDC_POOL_ID);

    if (action === RebalanceAction.Remove) {
      await performRemoveAction(tidePool, router, amount);

      logSuccess('Rebalance removed', {
        action,
        amount,
      });
    } else {
      await performAddAction(tidePool, router, amount);

      logSuccess('Rebalance added', {
        action,
        amount,
      });
    }
  } catch (error) {
    logError('Error rebalancing', { error });
  }
})();
