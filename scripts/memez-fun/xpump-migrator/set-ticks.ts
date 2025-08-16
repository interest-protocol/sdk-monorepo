import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { executeTx, network, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx } = xPumpMigratorSdk.setTicks({
    min: 4294523896,
    max: 443400,
  });

  await executeTx(tx);
})();
