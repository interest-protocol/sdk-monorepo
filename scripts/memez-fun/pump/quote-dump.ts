import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId, POW_10_9 } = await getEnv();

  const x = await pumpSdk.quoteDump({
    pool: testnetPoolId,
    amount: 1_500_000n * POW_10_9,
  });

  console.log(x);
})();
