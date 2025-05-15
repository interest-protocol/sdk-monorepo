import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testMigratorSdk, executeTx, testnetPoolId } = await getEnv();

  const { tx, migrator } = await pumpSdk.migrate({
    pool: testnetPoolId,
  });

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const { tx: tx2 } = testMigratorSdk.migrate({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    quoteCoinType: pool.quoteCoinType,
  });

  await executeTx(tx2);
})();
