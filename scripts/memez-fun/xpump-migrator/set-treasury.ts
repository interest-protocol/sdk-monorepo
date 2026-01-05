import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { executeTx, network, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx } = xPumpMigratorSdk.setTreasury({
    treasury:
      '0x6aede69ad73e1876023f8e73196f24edb3e7c307ad4553a61600b14431e4ab0a',
  });

  await executeTx(tx);
})();
