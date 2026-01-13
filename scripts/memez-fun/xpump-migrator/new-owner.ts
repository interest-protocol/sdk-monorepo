import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { network, keypair, xPumpMigratorSdk, executeTx } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx, positionOwner } = await xPumpMigratorSdk.newPositionOwner({
    memeCoinType:
      '0xf2fafa80fe5fc4d65d03c6de90e743015f6be51990c17adfd0a39216719689d1::cope::COPE',
  });

  tx.transferObjects(
    [positionOwner],
    '0xb3bace86a176648754aa72ade5cdf2a97de2ffc278119b55ca23cee7ca1b57cd'
  );

  await executeTx(tx);
})();
