import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { network, keypair, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const positions = await xPumpMigratorSdk.getPositions({
    owner: keypair.toSuiAddress(),
  });

  invariant(positions.positions.length > 0, 'No positions found');

  const result = await xPumpMigratorSdk.pendingFee({
    bluefinPool: positions.positions[0]?.blueFinPoolId ?? '',
    memeCoinType: positions.positions[0]?.memeCoinType ?? '',
    positionOwner: positions.positions[0]?.objectId ?? '',
  });

  logSuccess(result);
})();
