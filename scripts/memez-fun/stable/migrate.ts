import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, executeTx, testMigratorSdk, testnetStablePoolId } =
    await getEnv();

  const { tx, migrator } = await stableSdk.migrate({
    pool: testnetStablePoolId,
  });

  const pool = await stableSdk.getStablePool(testnetStablePoolId);

  const { tx: tx2 } = testMigratorSdk.migrate({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    quoteCoinType: pool.quoteCoinType,
  });

  await executeTx(tx2);
})();
