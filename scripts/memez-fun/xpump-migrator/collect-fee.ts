import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { network, keypair, executeTx, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const positions = await xPumpMigratorSdk.getPositions({
    owner: keypair.toSuiAddress(),
  });

  invariant(positions.positions.length > 0, 'No positions found');

  const { tx, suiCoin } = xPumpMigratorSdk.collectFee({
    bluefinPool: positions.positions[0]?.blueFinPoolId ?? '',
    memeCoinType: positions.positions[0]?.memeCoinType ?? '',
    positionOwner: positions.positions[0]?.objectId ?? '',
  });

  tx.transferObjects([suiCoin], tx.pure.address(keypair.toSuiAddress()));

  await executeTx(tx);
})();
