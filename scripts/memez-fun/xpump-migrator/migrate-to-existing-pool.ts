import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const BLUEFIN_POOL_ID =
  '0x86eb5f9224f92146324f32cfdfd6ff2b007db98e1f75f09de2ed62c875b364d5';

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

  const { tx: tx2, suiCoin } = await xPumpMigratorSdk.migrateToExistingPool({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    ipxMemeCoinTreasury: pool.ipxMemeCoinTreasury,
    pool: BLUEFIN_POOL_ID,
  });

  tx2.transferObjects([suiCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
