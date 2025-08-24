import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { executeTx, network, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx } = xPumpMigratorSdk.setTreasury({
    treasury:
      '0xaab6feadd3236ecc1b4fa34d00356f0f826f5e3d225818cb738ccdf77dcac979',
  });

  await executeTx(tx);
})();
