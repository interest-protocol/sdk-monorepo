import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { network, keypair, xPumpMigratorSdk, executeTx } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx, positionOwner } = await xPumpMigratorSdk.newPositionOwner({
    memeCoinType:
      '0x2e3c97ca6659629897905ddf89fd451a0c8421f4e45345a9b74481ae421e7dac::poors::POORS',
  });

  tx.transferObjects(
    [positionOwner],
    '0xa4e774fae31ae1aa6d9b2b832e1ee664c4f7284a8ad877c05aa5d64d10f65eda'
  );

  await executeTx(tx);
})();
