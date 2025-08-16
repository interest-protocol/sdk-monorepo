import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { executeTx, network, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx } = xPumpMigratorSdk.setLiquidityMargin({
    liquidityMargin: 500,
  });

  await executeTx(tx);
})();
