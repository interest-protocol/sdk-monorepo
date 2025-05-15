import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { executeTx, network, recrdMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx } = recrdMigratorSdk.setRewardValue({
    rewardValue: 100_000n,
  });

  await executeTx(tx);
})();
