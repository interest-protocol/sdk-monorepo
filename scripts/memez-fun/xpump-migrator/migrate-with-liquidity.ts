import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';
import { ClmmPoolUtil, MAX_TICK_INDEX } from '@firefly-exchange/library-sui';
import { getEnv } from '../utils.script';
import BN from 'bn.js';

(async () => {
  const {
    executeTx,
    network,
    pumpSdk,
    keypair,
    testnetPoolId,

    xPumpMigratorSdk,
  } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const pool = await pumpSdk.getPumpPool(
    '0xe74129478aec3913f274c4c2a8fe12f1026683198d5d475426b33f72581a81a2'
  );

  const { tx, migrator } = await pumpSdk.migrate({
    pool: '0xe74129478aec3913f274c4c2a8fe12f1026683198d5d475426b33f72581a81a2',
  });

  const fee = tx.splitCoins(tx.gas, [0n]);

  const currentPrice = new BN('63901395939770060');

  const reward_Sui = new BN('2000000000');

  const quoteBalance = new BN(pool.curveState.quoteBalance.toString());

  const liquidity = ClmmPoolUtil.estimateLiquidityFromCoinAmounts(
    currentPrice,
    -443600,
    443600,
    {
      coinA: new BN(pool.curveState.memeBalance.toString()),
      coinB: quoteBalance
        .mul(quoteBalance.mul(new BN(500)).div(new BN(10000)))
        .sub(reward_Sui),
    }
  );

  const { tx: tx2, suiCoin } = await xPumpMigratorSdk.migrateWithLiquidity({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    feeCoinType: SUI_TYPE_ARG,
    feeCoin: fee,
    ipxMemeCoinTreasury: pool.ipxMemeCoinTreasury,
    liquidity: liquidity.toString(),
  });

  tx2.transferObjects([suiCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
