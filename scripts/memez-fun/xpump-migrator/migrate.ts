import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

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
    '0x915cd839f2c87144466c91347c89de81cacce00a61ee5513109c4ce23ed58b13'
  );

  const { tx, migrator } = await pumpSdk.migrate({
    pool: '0x915cd839f2c87144466c91347c89de81cacce00a61ee5513109c4ce23ed58b13',
  });

  const fee = tx.splitCoins(tx.gas, [0n]);

  const { tx: tx2, suiCoin } = await xPumpMigratorSdk.migrate({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    feeCoinType: SUI_TYPE_ARG,
    feeCoin: fee,
    ipxMemeCoinTreasury: pool.ipxMemeCoinTreasury,
  });

  tx2.transferObjects([suiCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
