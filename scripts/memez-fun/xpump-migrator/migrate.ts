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

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const { tx, migrator } = await pumpSdk.migrate({
    pool: testnetPoolId,
  });

  const { tx: tx2, suiCoin } = await xPumpMigratorSdk.migrate({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    quoteCoinType: pool.quoteCoinType,
    ipxMemeCoinTreasury: pool.ipxMemeCoinTreasury,
  });

  tx2.transferObjects([suiCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
