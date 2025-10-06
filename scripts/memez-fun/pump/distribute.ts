import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, executeTx, testnetPoolId } = await getEnv();

  const { tx } = await pumpSdk.distributeStakeHoldersAllocation({
    pool: '0xa27f52f33f75dd3296ab0a0f6c3d1605a4a081b343607903b31d35604d5abff8',
  });

  await executeTx(tx);
})();
