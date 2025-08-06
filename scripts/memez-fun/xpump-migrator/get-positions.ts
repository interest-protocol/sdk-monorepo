import { logSuccess } from '@interest-protocol/logger';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const {
    network,
    keypair,

    xPumpMigratorSdk,
  } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const positions = await xPumpMigratorSdk.getPositions({
    owner: keypair.toSuiAddress(),
  });

  logSuccess('positions', positions);

  const positionOwner = await xPumpMigratorSdk.getPositionDataOwner(
    positions.positions[0]?.memeCoinType ?? ''
  );

  logSuccess(
    'was it CTOed ?',
    positionOwner !== positions.positions[0]?.objectId
  );
})();
