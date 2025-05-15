import { Treasuries } from '@interest-protocol/memez-fun-sdk';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { executeTx, network, recrdMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx } = recrdMigratorSdk.setTreasury({
    treasury: Treasuries.MEMEZ,
  });

  await executeTx(tx);
})();
